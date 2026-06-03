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
    .select("id, status")
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
    .select("id, public_name, status, is_available")
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

  const { data: updatedBooking, error: updateError } = await supabase
    .from("bookings")
    .update({
      beluer_profile_id: beluer.id,
      status: "assigned",
      updated_at: new Date().toISOString(),
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
