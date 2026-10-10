"use server";

import { revalidatePath } from "next/cache";
import {
  resolveApprovedBeluerActor,
  resolveBeluerActor,
} from "@/lib/auth/serviceOfferActor";

export type ServiceCategory = "lashes" | "nails" | "brows";
export type ServiceType = "primary" | "addon";
export type BeluerOfferStatus = "active" | "inactive";

export type BeluerServiceCatalogItem = {
  serviceId: string;
  name: string;
  category: ServiceCategory;
  serviceType: ServiceType;
  durationMinutes: number;
  minimumPrice: number;
  offeringStatus: BeluerOfferStatus;
  beluerPrice: number | null;
};

export type ServiceOfferErrorCode =
  | "UNAUTHORIZED"
  | "PROFILE_NOT_FOUND"
  | "BELUER_NOT_FOUND"
  | "BELUER_NOT_APPROVED"
  | "SERVICE_NOT_FOUND"
  | "SERVICE_NOT_ACTIVE"
  | "MINIMUM_PRICE_NOT_FOUND"
  | "CATEGORY_NOT_APPROVED"
  | "INVALID_PRICE"
  | "PRICE_BELOW_MINIMUM"
  | "INTERNAL_ERROR";

export type ServiceOfferResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ServiceOfferErrorCode } };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toCents(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const normalized = String(value).trim();
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

function failure<T>(code: ServiceOfferErrorCode): ServiceOfferResult<T> {
  return { ok: false, error: { code } };
}

function internalFailure<T>(): ServiceOfferResult<T> {
  return failure("INTERNAL_ERROR");
}

export async function getBeluerServiceCatalog(): Promise<
  ServiceOfferResult<BeluerServiceCatalogItem[]>
> {
  const actorResult = await resolveBeluerActor();
  if (!actorResult.ok) return failure(actorResult.code);
  const { actor } = actorResult;

  const { data: approvals, error: approvalsError } = await actor.supabase
    .from("beluer_category_approvals")
    .select("category")
    .eq("beluer_profile_id", actor.beluerProfileId)
    .eq("status", "approved");

  if (approvalsError) return internalFailure();
  const categories = (approvals ?? []).map((row) => row.category as ServiceCategory);
  if (categories.length === 0) return { ok: true, data: [] };

  const { data: services, error: servicesError } = await actor.supabase
    .from("services")
    .select("id, name, category, service_type, duration_minutes")
    .eq("status", "active")
    .in("category", categories);

  if (servicesError) return internalFailure();
  const serviceRows = services ?? [];
  if (serviceRows.length === 0) return { ok: true, data: [] };

  const serviceIds = serviceRows.map((service) => service.id);
  const [{ data: rules, error: rulesError }, { data: skills, error: skillsError }] =
    await Promise.all([
      actor.supabase
        .from("service_pricing_rules")
        .select("service_id, minimum_price")
        .in("service_id", serviceIds),
      actor.supabase
        .from("beluer_service_skills")
        .select("service_id, status, beluer_price")
        .eq("beluer_profile_id", actor.beluerProfileId)
        .in("service_id", serviceIds),
    ]);

  if (rulesError || skillsError) return internalFailure();
  const ruleByService = new Map(
    (rules ?? []).map((rule) => [rule.service_id, rule.minimum_price])
  );
  const skillByService = new Map((skills ?? []).map((skill) => [skill.service_id, skill]));

  const catalog: BeluerServiceCatalogItem[] = [];
  for (const service of serviceRows) {
    const minimumPrice = ruleByService.get(service.id);
    if (minimumPrice === undefined) continue;
    const skill = skillByService.get(service.id);
    catalog.push({
      serviceId: service.id,
      name: service.name,
      category: service.category as ServiceCategory,
      serviceType: service.service_type as ServiceType,
      durationMinutes: service.duration_minutes,
      minimumPrice: Number(minimumPrice),
      offeringStatus: skill?.status === "active" ? "active" : "inactive",
      beluerPrice: skill?.beluer_price == null ? null : Number(skill.beluer_price),
    });
  }

  return { ok: true, data: catalog };
}

export async function setBeluerServiceOffer(input: {
  serviceId: string;
  beluerPrice: number | string;
}): Promise<ServiceOfferResult<{ serviceId: string; status: "active" }>> {
  const actorResult = await resolveApprovedBeluerActor();
  if (!actorResult.ok) return failure(actorResult.code);
  const { actor } = actorResult;

  if (!uuidPattern.test(input?.serviceId ?? "")) return failure("SERVICE_NOT_FOUND");
  const priceCents = toCents(input?.beluerPrice);
  if (priceCents === null) return failure("INVALID_PRICE");

  const { data: service, error: serviceError } = await actor.supabase
    .from("services")
    .select("id, category, status")
    .eq("id", input.serviceId)
    .maybeSingle();

  if (serviceError) return internalFailure();
  if (!service) return failure("SERVICE_NOT_FOUND");
  if (service.status !== "active") return failure("SERVICE_NOT_ACTIVE");

  const { data: pricingRule, error: ruleError } = await actor.supabase
    .from("service_pricing_rules")
    .select("minimum_price")
    .eq("service_id", service.id)
    .maybeSingle();

  if (ruleError) return internalFailure();
  if (!pricingRule) return failure("MINIMUM_PRICE_NOT_FOUND");
  const minimumCents = toCents(pricingRule.minimum_price);
  if (minimumCents === null) return internalFailure();
  if (priceCents < minimumCents) return failure("PRICE_BELOW_MINIMUM");

  const { data: approval, error: approvalError } = await actor.supabase
    .from("beluer_category_approvals")
    .select("status")
    .eq("beluer_profile_id", actor.beluerProfileId)
    .eq("category", service.category)
    .maybeSingle();

  if (approvalError) return internalFailure();
  if (approval?.status !== "approved") return failure("CATEGORY_NOT_APPROVED");

  const { error: upsertError } = await actor.supabase
    .from("beluer_service_skills")
    .upsert(
      {
        beluer_profile_id: actor.beluerProfileId,
        service_id: service.id,
        status: "active",
        beluer_price: priceCents / 100,
      },
      { onConflict: "beluer_profile_id,service_id" }
    );

  if (upsertError) {
    if (upsertError.message.includes("ACTIVE_OFFER_REQUIRES_APPROVED_CATEGORY")) {
      return failure("CATEGORY_NOT_APPROVED");
    }
    if (upsertError.message.includes("ACTIVE_OFFER_REQUIRES_APPROVED_BELUER")) {
      return failure("BELUER_NOT_APPROVED");
    }
    if (upsertError.message.includes("ACTIVE_OFFER_PRICE_BELOW_MINIMUM")) {
      return failure("PRICE_BELOW_MINIMUM");
    }
    if (upsertError.message.includes("ACTIVE_OFFER_REQUIRES_SERVICE_ACTIVE")) {
      return failure("SERVICE_NOT_ACTIVE");
    }
    if (upsertError.message.includes("ACTIVE_OFFER_REQUIRES_PRICE")) {
      return failure("INVALID_PRICE");
    }
    return internalFailure();
  }

  revalidatePath("/app/beluer");
  revalidatePath("/app/cliente");
  return { ok: true, data: { serviceId: service.id, status: "active" } };
}

export async function disableBeluerService(input: {
  serviceId: string;
}): Promise<ServiceOfferResult<{ serviceId: string; status: "inactive" }>> {
  const actorResult = await resolveBeluerActor();
  if (!actorResult.ok) return failure(actorResult.code);
  const { actor } = actorResult;

  if (!uuidPattern.test(input?.serviceId ?? "")) return failure("SERVICE_NOT_FOUND");
  const { data: service, error: serviceError } = await actor.supabase
    .from("services")
    .select("id")
    .eq("id", input.serviceId)
    .maybeSingle();

  if (serviceError) return internalFailure();
  if (!service) return failure("SERVICE_NOT_FOUND");

  const { data: rule, error: ruleError } = await actor.supabase
    .from("service_pricing_rules")
    .select("service_id")
    .eq("service_id", input.serviceId)
    .maybeSingle();

  if (ruleError) return internalFailure();
  if (!rule) return failure("MINIMUM_PRICE_NOT_FOUND");

  const { error: updateError } = await actor.supabase
    .from("beluer_service_skills")
    .update({ status: "inactive" })
    .eq("beluer_profile_id", actor.beluerProfileId)
    .eq("service_id", input.serviceId);

  if (updateError) return internalFailure();

  revalidatePath("/app/beluer");
  revalidatePath("/app/cliente");
  return { ok: true, data: { serviceId: input.serviceId, status: "inactive" } };
}
