"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type UpdateBookingPaymentStatusState = {
  success: boolean;
  message: string;
  code?: string;
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

  let updateQuery = supabase
    .from("bookings")
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (paymentStatus === "paid") {
    updateQuery = updateQuery.neq("status", "payment_pending");
  }

  const { data, error } = await updateQuery
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      success: false,
      message: `No se pudo actualizar el pago: ${error.message}`,
    };
  }

  if (!data) {
    const { data: booking, error: lookupError } = await supabase
      .from("bookings")
      .select("status")
      .eq("id", bookingId)
      .maybeSingle();

    if (lookupError) {
      return { success: false, message: `No se pudo actualizar el pago: ${lookupError.message}` };
    }

    if (booking?.status === "payment_pending" && paymentStatus === "paid") {
      return {
        success: false,
        code: "PAYMENT_PENDING_REQUIRES_PROVIDER_CONFIRMATION",
        message: "Las reservas pendientes de pago solo pueden confirmarse mediante la pasarela.",
      };
    }

    return { success: false, message: "No se encontró la reserva." };
  }

  revalidatePath("/app/admin");

  return {
    success: true,
    message: "Estado de pago actualizado correctamente.",
  };
}
