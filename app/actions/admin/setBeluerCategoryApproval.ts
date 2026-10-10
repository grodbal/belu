"use server";

import { revalidatePath } from "next/cache";
import { resolveAdminActor } from "@/lib/auth/serviceOfferActor";
import type { ServiceCategory } from "@/app/actions/beluer/serviceOffers";

export type CategoryApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revoked";

export type CategoryApprovalErrorCode =
  | "UNAUTHORIZED"
  | "PROFILE_NOT_FOUND"
  | "BELUER_NOT_APPROVED"
  | "INVALID_INPUT"
  | "BELUER_NOT_FOUND"
  | "INTERNAL_ERROR";

export type CategoryApprovalResult =
  | {
      ok: true;
      data: {
        beluerProfileId: string;
        category: ServiceCategory;
        status: CategoryApprovalStatus;
      };
    }
  | { ok: false; error: { code: CategoryApprovalErrorCode } };

const categories = new Set<ServiceCategory>(["lashes", "nails", "brows"]);
const statuses = new Set<CategoryApprovalStatus>([
  "pending",
  "approved",
  "rejected",
  "revoked",
]);
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function setBeluerCategoryApproval(input: {
  beluerProfileId: string;
  category: string;
  status: string;
}): Promise<CategoryApprovalResult> {
  const actorResult = await resolveAdminActor();
  if (!actorResult.ok) {
    return { ok: false, error: { code: actorResult.code } };
  }
  const { actor } = actorResult;

  if (
    !uuidPattern.test(input?.beluerProfileId ?? "") ||
    !categories.has(input?.category as ServiceCategory) ||
    !statuses.has(input?.status as CategoryApprovalStatus)
  ) {
    return { ok: false, error: { code: "INVALID_INPUT" } };
  }

  const category = input.category as ServiceCategory;
  const status = input.status as CategoryApprovalStatus;
  const { data: beluer, error: beluerError } = await actor.supabase
    .from("beluer_profiles")
    .select("id")
    .eq("id", input.beluerProfileId)
    .maybeSingle();

  if (beluerError) {
    return { ok: false, error: { code: "INTERNAL_ERROR" } };
  }
  if (!beluer) return { ok: false, error: { code: "BELUER_NOT_FOUND" } };

  const { error } = await actor.supabase.rpc("set_beluer_category_approval", {
    p_beluer_profile_id: beluer.id,
    p_category: category,
    p_status: status,
    p_approved_by: status === "approved" ? actor.profileId : null,
  });

  if (error) return { ok: false, error: { code: "INTERNAL_ERROR" } };

  revalidatePath("/app/admin");
  revalidatePath("/app/beluer");
  revalidatePath("/app/cliente");
  return {
    ok: true,
    data: { beluerProfileId: beluer.id, category, status },
  };
}
