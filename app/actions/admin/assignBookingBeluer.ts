"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { buildBookingFinancialSnapshots } from "@/lib/bookings/financialSnapshots";
import { createAdminClient } from "@/lib/supabase/admin";

type AssignBookingBeluerState = {
  success: boolean;
  message: string;
};

const assignableStatuses = ["pending", "assigned"];
const blockedStatuses = ["cancelled", "completed"];

function toSafeNumber(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
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
    .select(
      "id, status, public_price, logistic_fee, base_price, express_fee, service_price_snapshot"
    )
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
  const snapshots = buildBookingFinancialSnapshots({
    beluerLevel: beluer.level,
    servicePriceSnapshot:
      booking.service_price_snapshot === null ||
      booking.service_price_snapshot === undefined
        ? null
        : toSafeNumber(booking.service_price_snapshot),
    basePrice,
    logisticFee,
    expressFee: toSafeNumber(booking.express_fee),
    lockEvent: "admin_assigned",
  });

  const { data: updatedBooking, error: updateError } = await supabase
    .from("bookings")
    .update({
      beluer_profile_id: beluer.id,
      status: "assigned",
      ...snapshots,
      updated_at: snapshots.commission_locked_at,
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
