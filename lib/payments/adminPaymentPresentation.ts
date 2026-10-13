import type { PaymentAttempt } from "@/lib/payments/paymentTypes";

export type AdminPaymentPresentation = { state: string; label: string };

export function getAdminPaymentPresentation(
  bookingPaymentStatus: string,
  bookingStatus: string,
  latestAttempt: PaymentAttempt | undefined,
  reviewAttemptIds: ReadonlySet<string>
): AdminPaymentPresentation {
  if (latestAttempt && reviewAttemptIds.has(latestAttempt.id))
    return { state: "late_review", label: "Pago tardío · revisión requerida" };
  if (bookingPaymentStatus === "paid") return { state: "paid", label: "Pagado" };
  if (bookingStatus === "payment_pending" && bookingPaymentStatus === "pending")
    return { state: "awaiting_confirmation", label: "Pendiente de confirmación" };
  if (latestAttempt?.status === "expired") return { state: "expired", label: "Vencido" };
  if (latestAttempt?.status === "failed" || bookingPaymentStatus === "failed")
    return { state: "failed", label: "Fallido" };
  if (latestAttempt?.status === "refunded" || bookingPaymentStatus === "refunded")
    return { state: "refunded", label: "Reembolsado" };
  if (bookingPaymentStatus === "partially_refunded")
    return { state: "refunded", label: "Reembolsado parcialmente" };
  if (latestAttempt?.status === "processing") return { state: "processing", label: "Procesando" };
  if (latestAttempt?.status === "pending" || bookingPaymentStatus === "pending")
    return { state: "pending", label: "Pendiente" };
  return { state: "unknown", label: "Estado no disponible" };
}
