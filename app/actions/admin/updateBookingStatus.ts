"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type UpdateBookingStatusState = {
  success: boolean;
  message: string;
};

const allowedStatuses = [
  "pending",
  "assigned",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "redo_requested",
  "redo_approved",
];

export async function updateBookingStatusAction(
  previousState: UpdateBookingStatusState,
  formData: FormData
): Promise<UpdateBookingStatusState> {
  await requireAdmin();

  const bookingId = String(formData.get("bookingId") || "");
  const status = String(formData.get("status") || "");

  if (!bookingId) {
    return {
      success: false,
      message: "No se encontró la reserva.",
    };
  }

  if (!allowedStatuses.includes(status)) {
    return {
      success: false,
      message: "Estado de reserva no válido.",
    };
  }

  const supabase = createAdminClient();

  if (status === "assigned") {
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, beluer_profile_id")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return {
        success: false,
        message: "No se encontró la reserva.",
      };
    }

    if (!booking.beluer_profile_id) {
      return {
        success: false,
        message:
          "Asigna una Beluer antes de marcar la reserva como asignada.",
      };
    }
  }

  const { data: updatedBooking, error } = await supabase
    .from("bookings")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select("id, status")
    .single();

  if (error || !updatedBooking) {
    return {
      success: false,
      message: `No se pudo actualizar la reserva: ${
        error?.message || "Supabase no devolvió la reserva actualizada."
      }`,
    };
  }

  if (updatedBooking.status !== status) {
    return {
      success: false,
      message:
        "El estado no quedó persistido en Supabase. Revisa la reserva antes de continuar.",
    };
  }

  revalidatePath("/app/admin");

  return {
    success: true,
    message: "Estado de reserva actualizado correctamente.",
  };
}
