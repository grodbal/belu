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

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, status, hold_expires_at")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    return { success: false, message: "No se pudo verificar el estado de pago." };
  }
  if (!booking) {
    return { success: false, message: "No se encontró la reserva." };
  }

  const { data: attempts, error: attemptsError } = await supabase
    .from("payments")
    .select("id")
    .eq("booking_id", bookingId)
    .limit(1);

  if (attemptsError) {
    return { success: false, message: "No se pudo verificar el historial de pago." };
  }

  const hasProviderPaymentState = booking.status === "payment_pending" ||
    booking.hold_expires_at !== null || (attempts && attempts.length > 0);
  if (hasProviderPaymentState) {
    return {
      success: false,
      code: paymentStatus === "paid"
        ? "PAYMENT_PENDING_REQUIRES_PROVIDER_CONFIRMATION"
        : "PAYMENT_ATTEMPT_REQUIRES_PROVIDER_CONFIRMATION",
      message: "El estado de pago de esta reserva lo determina el intento registrado con el proveedor.",
    };
  }

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
