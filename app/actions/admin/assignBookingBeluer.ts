"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

type AssignBookingBeluerState = {
  success: boolean;
  message: string;
};

const assignableStatuses = ["pending", "assigned"];
const blockedStatuses = ["cancelled", "completed"];

function normalizeBeluerLevel(level: string | null | undefined) {
  return String(level || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveBeluerCommissionRate(level: string | null | undefined) {
  const normalizedLevel = normalizeBeluerLevel(level);
  const levelSnapshot = String(level || "").trim();
  const topLevels = new Set([
    "top",
    "beluer_top",
    "beluer top",
    "top ✦",
    "beluer top ✦",
  ]);
  const premiumLevels = new Set([
    "verified",
    "verificada",
    "beluer_verificada",
    "beluer verificada",
    "premium",
  ]);
  const standardLevels = new Set([
    "new",
    "nueva",
    "beluer_nueva",
    "beluer nueva",
    "standard",
    "estandar",
  ]);

  if (topLevels.has(normalizedLevel)) {
    return {
      levelSnapshot: levelSnapshot || "top",
      rateDecimal: 0.08,
      legacyRate: 8,
    };
  }

  if (premiumLevels.has(normalizedLevel)) {
    return {
      levelSnapshot: levelSnapshot || "premium",
      rateDecimal: 0.1,
      legacyRate: 10,
    };
  }

  if (standardLevels.has(normalizedLevel)) {
    return {
      levelSnapshot: levelSnapshot || "standard",
      rateDecimal: 0.13,
      legacyRate: 13,
    };
  }

  return {
    levelSnapshot: "standard",
    rateDecimal: 0.13,
    legacyRate: 13,
  };
}

function toSafeNumber(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

function roundMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function assignBookingBeluerAction(
  previousState: AssignBookingBeluerState,
  formData: FormData
): Promise<AssignBookingBeluerState> {
  await requireAdmin();

  const bookingId = String(formData.get("bookingId") || "");
  const beluerProfileId = String(formData.get("beluerProfileId") || "");

  if (!bookingId) {
    return {
      success: false,
      message: "No se encontró la reserva.",
    };
  }

  if (!beluerProfileId) {
    return {
      success: false,
      message: "Selecciona una Beluer para asignar.",
    };
  }

  const supabase = createAdminClient();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, status, public_price, logistic_fee, base_price, express_fee")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return {
      success: false,
      message: "No se encontró la reserva.",
    };
  }

  if (blockedStatuses.includes(booking.status)) {
    return {
      success: false,
      message: "No se puede asignar una Beluer a una reserva cancelada o completada.",
    };
  }

  if (!assignableStatuses.includes(booking.status)) {
    return {
      success: false,
      message: "Solo las reservas pendientes o asignadas pueden reasignarse desde este flujo.",
    };
  }

  const { data: beluer, error: beluerError } = await supabase
    .from("beluer_profiles")
    .select("id, public_name, level, status, is_available")
    .eq("id", beluerProfileId)
    .single();

  if (beluerError || !beluer) {
    return {
      success: false,
      message: "No se encontró la Beluer seleccionada.",
    };
  }

  if (beluer.status !== "approved") {
    return {
      success: false,
      message: "Solo puedes asignar Beluers aprobadas.",
    };
  }

  if (!beluer.is_available) {
    return {
      success: false,
      message: "La Beluer seleccionada no está disponible actualmente.",
    };
  }

  const publicPrice = toSafeNumber(booking.public_price);
  const logisticFee = toSafeNumber(booking.logistic_fee);
  const basePrice =
    booking.base_price === null || booking.base_price === undefined
      ? publicPrice - logisticFee
      : toSafeNumber(booking.base_price);
  const expressFee = toSafeNumber(booking.express_fee);
  const commission = resolveBeluerCommissionRate(beluer.level);
  const beluCommissionAmount = roundMoney(basePrice * commission.rateDecimal);
  const beluerServicePayoutAmount = roundMoney(
    basePrice - beluCommissionAmount
  );
  const beluerLogisticPayoutAmount = roundMoney(logisticFee);
  const beluerExpressPayoutAmount = roundMoney(expressFee);
  const beluerTotalPayoutAmount = roundMoney(
    beluerServicePayoutAmount +
      beluerLogisticPayoutAmount +
      beluerExpressPayoutAmount
  );
  const commissionLockedAt = new Date().toISOString();

  const { data: updatedBooking, error: updateError } = await supabase
    .from("bookings")
    .update({
      beluer_profile_id: beluer.id,
      status: "assigned",
      beluer_level_snapshot: commission.levelSnapshot,
      commission_rate_snapshot: commission.rateDecimal,
      belu_commission_rate: commission.legacyRate,
      belu_commission_amount: beluCommissionAmount,
      beluer_service_payout_amount: beluerServicePayoutAmount,
      beluer_logistic_payout_amount: beluerLogisticPayoutAmount,
      beluer_express_payout_amount: beluerExpressPayoutAmount,
      beluer_total_payout_amount: beluerTotalPayoutAmount,
      beluer_payment_amount: beluerTotalPayoutAmount,
      commission_locked_at: commissionLockedAt,
      commission_locked_event: "admin_assigned",
      updated_at: commissionLockedAt,
    })
    .eq("id", booking.id)
    .select("id, beluer_profile_id, status")
    .single();

  if (updateError || !updatedBooking) {
    return {
      success: false,
      message: `No se pudo asignar la Beluer: ${
        updateError?.message || "Supabase no devolvió la reserva actualizada."
      }`,
    };
  }

  if (
    updatedBooking.beluer_profile_id !== beluer.id ||
    updatedBooking.status !== "assigned"
  ) {
    return {
      success: false,
      message:
        "La asignación no quedó persistida en Supabase. Revisa la reserva antes de continuar.",
    };
  }

  revalidatePath("/app/admin");
  revalidatePath("/app/cliente");
  revalidatePath("/app/beluer");

  return {
    success: true,
    message: `Beluer asignada correctamente: ${
      beluer.public_name || "Beluer seleccionada"
    }.`,
  };
}
