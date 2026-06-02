"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type UpdateBookingPaymentStatusState = {
  success: boolean;
  message: string;
};

const allowedPaymentStatuses = ["pending", "paid", "failed", "refunded"];

export async function updateBookingPaymentStatusAction(
  previousState: UpdateBookingPaymentStatusState,
  formData: FormData
): Promise<UpdateBookingPaymentStatusState> {
  await requireAdmin();

  const bookingId = String(formData.get("bookingId") || "");
  const paymentStatus = String(formData.get("paymentStatus") || "");

  if (!bookingId) {
    return {
      success: false,
      message: "No se encontró la reserva.",
    };
  }

  if (!allowedPaymentStatuses.includes(paymentStatus)) {
    return {
      success: false,
      message: "Estado de pago no válido.",
    };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("bookings")
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) {
    return {
      success: false,
      message: `No se pudo actualizar el pago: ${error.message}`,
    };
  }

  revalidatePath("/app/admin");

  return {
    success: true,
    message: "Estado de pago actualizado correctamente.",
  };
}
