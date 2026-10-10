"use server";

import { revalidatePath } from "next/cache";
import { normalizeBookingDistrict } from "@/lib/bookings/foundation";
import { buildBookingFinancialSnapshots } from "@/lib/bookings/financialSnapshots";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type CreateBookingErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_BOOKING_MODE"
  | "SERVICE_NOT_FOUND"
  | "SERVICE_NOT_ACTIVE"
  | "OFFER_NOT_FOUND"
  | "OFFER_NOT_ACTIVE"
  | "BELUER_NOT_APPROVED"
  | "BELUER_NOT_AVAILABLE"
  | "CATEGORY_NOT_APPROVED"
  | "MINIMUM_PRICE_NOT_FOUND"
  | "PRICE_BELOW_MINIMUM"
  | "DISTRICT_NOT_COVERED"
  | "BELUER_DISTRICT_MISMATCH"
  | "TIME_SLOT_UNAVAILABLE"
  | "BOOKING_SERVICE_NOT_ACTIVE"
  | "BOOKING_BELUER_NOT_APPROVED"
  | "BOOKING_BELUER_NOT_AVAILABLE"
  | "BOOKING_CATEGORY_NOT_APPROVED"
  | "BOOKING_OFFER_NOT_ACTIVE"
  | "BOOKING_OFFER_PRICE_INVALID"
  | "OFFER_PRICE_CHANGED_RETRY"
  | "MINIMUM_PRICE_CHANGED_RETRY"
  | "BOOKING_SERVICE_CHANGED_RETRY"
  | "BELUER_LEVEL_CHANGED_RETRY";

type CreateBookingState = {
  success: boolean;
  message: string;
  code?: CreateBookingErrorCode;
};

const PUBLIC_BOOKING_ERROR =
  "No pudimos registrar tu reserva. Inténtalo nuevamente.";
const LOGISTIC_FEE = 10;
const EXPRESS_FEE = 20;
const BUSY_BOOKING_STATUSES = ["assigned", "confirmed", "in_progress"];

function failure(code: CreateBookingErrorCode, message: string): CreateBookingState {
  return { success: false, code, message };
}

function mapAtomicBookingError(errorMessage: string): CreateBookingState | null {
  const knownErrors: Record<
    string,
    { code: CreateBookingErrorCode; message: string }
  > = {
    SERVICE_NOT_FOUND: {
      code: "SERVICE_NOT_FOUND",
      message: "No encontramos ese servicio.",
    },
    BOOKING_SERVICE_NOT_ACTIVE: {
      code: "SERVICE_NOT_ACTIVE",
      message: "El servicio seleccionado ya no está disponible.",
    },
    MINIMUM_PRICE_NOT_FOUND: {
      code: "MINIMUM_PRICE_NOT_FOUND",
      message: "El precio mínimo de este servicio no está configurado.",
    },
    BOOKING_BELUER_NOT_APPROVED: {
      code: "BELUER_NOT_APPROVED",
      message: "La Beluer seleccionada ya no está aprobada.",
    },
    BOOKING_BELUER_NOT_AVAILABLE: {
      code: "BELUER_NOT_AVAILABLE",
      message: "La Beluer seleccionada ya no está disponible.",
    },
    BELUER_LEVEL_CHANGED_RETRY: {
      code: "BELUER_LEVEL_CHANGED_RETRY",
      message: "Las condiciones de la especialista se actualizaron. Intenta reservar nuevamente.",
    },
    BOOKING_CATEGORY_NOT_APPROVED: {
      code: "CATEGORY_NOT_APPROVED",
      message: "La categoría de esta Beluer ya no está aprobada.",
    },
    BOOKING_OFFER_NOT_ACTIVE: {
      code: "OFFER_NOT_ACTIVE",
      message: "La oferta seleccionada ya no está activa.",
    },
    BOOKING_OFFER_PRICE_INVALID: {
      code: "OFFER_NOT_ACTIVE",
      message: "La oferta seleccionada ya no está disponible.",
    },
    PRICE_BELOW_MINIMUM: {
      code: "PRICE_BELOW_MINIMUM",
      message: "La oferta de la Beluer ya no cumple el precio mínimo.",
    },
    OFFER_PRICE_CHANGED_RETRY: {
      code: "OFFER_PRICE_CHANGED_RETRY",
      message: "El precio del servicio cambió. Actualiza la reserva e inténtalo nuevamente.",
    },
    MINIMUM_PRICE_CHANGED_RETRY: {
      code: "MINIMUM_PRICE_CHANGED_RETRY",
      message: "El precio mínimo de este servicio cambió. Actualiza la reserva e inténtalo nuevamente.",
    },
    BOOKING_SERVICE_CHANGED_RETRY: {
      code: "BOOKING_SERVICE_CHANGED_RETRY",
      message: "Los datos del servicio cambiaron. Actualiza la reserva e inténtalo nuevamente.",
    },
    TIME_SLOT_UNAVAILABLE: {
      code: "TIME_SLOT_UNAVAILABLE",
      message: "Ese horario ya no está disponible para esta Beluer.",
    },
  };

  const match = Object.entries(knownErrors).find(([marker]) =>
    errorMessage.includes(marker)
  );
  return match ? failure(match[1].code, match[1].message) : null;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function normalizeTime(value: string) {
  const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
  return match ? `${match[1]}:${match[2]}` : null;
}

function getLimaNowParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

function asLocalLimaMinutes(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return Date.UTC(year, month - 1, day, hour, minute) / 60_000;
}

function shiftDate(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}

function isValidMoney(value: unknown, allowZero = true) {
  const amount = Number(value);
  return Number.isFinite(amount) && (allowZero ? amount >= 0 : amount > 0);
}

export async function createBookingAction(
  previousState: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  void previousState;

  const serviceId = String(formData.get("serviceId") || "").trim();
  const selectedBeluerId = String(formData.get("selectedBeluerId") || "").trim();
  const bookingMode = String(formData.get("bookingMode") || "").trim();
  const scheduledDate = String(formData.get("scheduledDate") || "");
  const scheduledTime = normalizeTime(String(formData.get("scheduledTime") || ""));
  const address = String(formData.get("address") || "").trim();
  const districtValue = formData.get("district");
  const district = typeof districtValue === "string" ? districtValue.trim() : "";
  const notes = String(formData.get("notes") || "").trim();
  const expressRequested = String(formData.get("isExpress") || "") === "true";
  const idempotencyKey = String(formData.get("idempotencyKey") || "").trim();

  if (bookingMode !== "libre") {
    return failure(
      "INVALID_BOOKING_MODE",
      "Por ahora solo puedes reservar eligiendo una Beluer."
    );
  }
  if (!isUuid(serviceId)) {
    return { success: false, message: "Selecciona un servicio válido." };
  }
  if (!isUuid(selectedBeluerId)) {
    return { success: false, message: "Selecciona una Beluer válida." };
  }
  if (!isValidDate(scheduledDate) || !scheduledTime) {
    return { success: false, message: "Selecciona una fecha y hora válidas." };
  }
  const nowInLima = getLimaNowParts();
  if (
    scheduledDate < nowInLima.date ||
    (scheduledDate === nowInLima.date && scheduledTime <= nowInLima.time)
  ) {
    return { success: false, message: "La fecha y hora de la reserva deben ser futuras." };
  }
  if (!address) return { success: false, message: "Ingresa la dirección del servicio." };
  if (!district || district.length > 120) {
    return { success: false, message: "Ingresa el distrito donde recibirás el servicio." };
  }
  if (!isUuid(idempotencyKey)) {
    return {
      success: false,
      message: "No pudimos validar este intento de reserva. Inténtalo nuevamente.",
    };
  }

  try {
    const authClient = await createClient();
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();
    if (userError || !user) {
      return failure("UNAUTHORIZED", "Debes iniciar sesión para reservar.");
    }

    const supabase = createAdminClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (profileError || !profile || profile.role !== "cliente") {
      return failure("UNAUTHORIZED", "Debes iniciar sesión como clienta para reservar.");
    }

    const { data: existingBooking, error: existingBookingError } = await supabase
      .from("bookings")
      .select("id")
      .eq("client_profile_id", profile.id)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (existingBookingError) {
      console.error("createBooking: idempotency lookup failed", existingBookingError);
      return { success: false, message: PUBLIC_BOOKING_ERROR };
    }
    if (existingBooking) {
      revalidatePath("/app/cliente");
      return {
        success: true,
        message: "Tu reserva ya estaba registrada. El pago continúa pendiente.",
      };
    }

    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("id, name, category, service_type, status, duration_minutes")
      .eq("id", serviceId)
      .maybeSingle();
    if (serviceError) {
      console.error("createBooking: service lookup failed", serviceError);
      return { success: false, message: PUBLIC_BOOKING_ERROR };
    }
    if (!service) return failure("SERVICE_NOT_FOUND", "No encontramos ese servicio.");
    if (service.status !== "active") {
      return failure("SERVICE_NOT_ACTIVE", "El servicio seleccionado ya no está disponible.");
    }
    if (!["lashes", "nails", "brows"].includes(service.category)) {
      return { success: false, message: "El servicio seleccionado no está disponible." };
    }

    const { data: beluer, error: beluerError } = await supabase
      .from("beluer_profiles")
      .select("id, status, is_available, districts, level")
      .eq("id", selectedBeluerId)
      .maybeSingle();
    if (beluerError) {
      console.error("createBooking: Beluer lookup failed", beluerError);
      return { success: false, message: PUBLIC_BOOKING_ERROR };
    }
    if (!beluer || beluer.status !== "approved") {
      return failure("BELUER_NOT_APPROVED", "La Beluer seleccionada no está aprobada.");
    }
    if (!beluer.is_available) {
      return failure("BELUER_NOT_AVAILABLE", "La Beluer seleccionada no está disponible.");
    }

    const { data: approval, error: approvalError } = await supabase
      .from("beluer_category_approvals")
      .select("status")
      .eq("beluer_profile_id", beluer.id)
      .eq("category", service.category)
      .maybeSingle();
    if (approvalError) {
      console.error("createBooking: category approval lookup failed", approvalError);
      return { success: false, message: PUBLIC_BOOKING_ERROR };
    }
    if (!approval || approval.status !== "approved") {
      return failure("CATEGORY_NOT_APPROVED", "La categoría de esta Beluer aún no está aprobada.");
    }

    const { data: skill, error: skillError } = await supabase
      .from("beluer_service_skills")
      .select("id, status, beluer_price")
      .eq("beluer_profile_id", beluer.id)
      .eq("service_id", service.id)
      .maybeSingle();
    if (skillError) {
      console.error("createBooking: offer lookup failed", skillError);
      return { success: false, message: PUBLIC_BOOKING_ERROR };
    }
    if (!skill) return failure("OFFER_NOT_FOUND", "La Beluer no ofrece este servicio.");
    if (skill.status !== "active" || !isValidMoney(skill.beluer_price, false)) {
      return failure("OFFER_NOT_ACTIVE", "La oferta seleccionada ya no está activa.");
    }

    const { data: pricingRule, error: pricingRuleError } = await supabase
      .from("service_pricing_rules")
      .select("minimum_price")
      .eq("service_id", service.id)
      .maybeSingle();
    if (pricingRuleError) {
      console.error("createBooking: pricing rule lookup failed", pricingRuleError);
      return { success: false, message: PUBLIC_BOOKING_ERROR };
    }
    if (!pricingRule || !isValidMoney(pricingRule.minimum_price, false)) {
      return failure("MINIMUM_PRICE_NOT_FOUND", "El precio mínimo de este servicio no está configurado.");
    }

    const servicePrice = Number(skill.beluer_price);
    const minimumPrice = Number(pricingRule.minimum_price);
    if (servicePrice < minimumPrice) {
      return failure("PRICE_BELOW_MINIMUM", "La oferta de la Beluer ya no cumple el precio mínimo.");
    }

    const coveredDistricts = Array.isArray(beluer.districts)
      ? beluer.districts.map(normalizeBookingDistrict)
      : [];
    if (!coveredDistricts.includes(normalizeBookingDistrict(district))) {
      return failure("DISTRICT_NOT_COVERED", "La Beluer seleccionada no cubre ese distrito.");
    }

    const durationMinutes = Number(service.duration_minutes);
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      console.error("createBooking: invalid service duration", service.id);
      return { success: false, message: PUBLIC_BOOKING_ERROR };
    }
    const newStart = asLocalLimaMinutes(scheduledDate, scheduledTime);
    const newEnd = newStart + durationMinutes;
    const { data: existingBookings, error: scheduleError } = await supabase
      .from("bookings")
      .select("scheduled_date, scheduled_time, service_id")
      .eq("beluer_profile_id", beluer.id)
      .in("status", BUSY_BOOKING_STATUSES)
      .gte("scheduled_date", shiftDate(scheduledDate, -1))
      .lte("scheduled_date", shiftDate(scheduledDate, 2));
    if (scheduleError) {
      console.error("createBooking: schedule lookup failed", scheduleError);
      return { success: false, message: PUBLIC_BOOKING_ERROR };
    }
    const existingServiceIds = Array.from(
      new Set((existingBookings || []).map((booking) => booking.service_id))
    );
    const { data: existingServices, error: existingServicesError } =
      existingServiceIds.length > 0
        ? await supabase
            .from("services")
            .select("id, duration_minutes")
            .in("id", existingServiceIds)
        : { data: [], error: null };
    if (existingServicesError) {
      console.error("createBooking: schedule service lookup failed", existingServicesError);
      return { success: false, message: PUBLIC_BOOKING_ERROR };
    }
    const durationByServiceId = new Map(
      (existingServices || []).map((existingService) => [
        existingService.id,
        Number(existingService.duration_minutes),
      ])
    );
    const hasOverlap = (existingBookings || []).some((booking) => {
      const existingDuration = durationByServiceId.get(booking.service_id) ?? 0;
      if (!Number.isFinite(existingDuration) || existingDuration <= 0) return false;
      const existingStart = asLocalLimaMinutes(
        booking.scheduled_date,
        String(booking.scheduled_time).slice(0, 5)
      );
      const existingEnd = existingStart + existingDuration;
      return newStart < existingEnd && newEnd > existingStart;
    });
    if (hasOverlap) {
      return failure("TIME_SLOT_UNAVAILABLE", "Ese horario ya no está disponible para esta Beluer.");
    }

    const scheduledAt = new Date(
      `${scheduledDate}T${scheduledTime}:00-05:00`
    ).getTime();
    const isAutomaticallyExpress = scheduledAt <= Date.now() + 2 * 60 * 60 * 1000;
    const isExpress = expressRequested || isAutomaticallyExpress;
    const expressFee = isExpress ? EXPRESS_FEE : 0;
    const financialSnapshots = buildBookingFinancialSnapshots({
      beluerLevel: beluer.level,
      servicePriceSnapshot: servicePrice,
      basePrice: servicePrice,
      logisticFee: LOGISTIC_FEE,
      expressFee,
      lockEvent: "client_selected_beluer",
    });

    const { data: bookingId, error: bookingError } = await supabase.rpc(
      "create_booking_with_schedule_lock",
      {
        p_booking: {
          client_profile_id: profile.id,
          beluer_profile_id: beluer.id,
          service_id: service.id,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
          address,
          district,
          notes,
          is_express: isExpress,
          express_fee: expressFee,
          public_price: servicePrice,
          logistic_fee: LOGISTIC_FEE,
          base_price: servicePrice,
          service_price_snapshot: servicePrice,
          service_name_snapshot: service.name,
          service_category_snapshot: service.category,
          service_type_snapshot: service.service_type,
          minimum_price_snapshot: minimumPrice,
          idempotency_key: idempotencyKey,
          ...financialSnapshots,
        },
      }
    );

    if (bookingError) {
      const safeRpcError = mapAtomicBookingError(bookingError.message || "");
      if (safeRpcError) return safeRpcError;
      console.error("createBooking: insert failed", bookingError);
      return { success: false, message: PUBLIC_BOOKING_ERROR };
    }
    if (!bookingId) {
      console.error("createBooking: booking RPC returned no booking id");
      return { success: false, message: PUBLIC_BOOKING_ERROR };
    }

    revalidatePath("/app/cliente");
    revalidatePath("/app/admin");
    return {
      success: true,
      message: "Reserva registrada. El pago con Yape continúa pendiente.",
    };
  } catch (error) {
    console.error("createBooking: unexpected failure", error);
    return { success: false, message: PUBLIC_BOOKING_ERROR };
  }
}
