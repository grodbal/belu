"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const { error } = await supabase
    .from("bookings")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) {
    return {
      success: false,
      message: `No se pudo actualizar la reserva: ${error.message}`,
    };
  }

  revalidatePath("/app/admin");

  return {
    success: true,
    message: "Estado de reserva actualizado correctamente.",
  };
}