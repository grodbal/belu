import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ConfirmPaymentInput,
  ConfirmPaymentCode,
  ConfirmPaymentResult,
  PaymentProvider,
} from "@/lib/payments/paymentTypes";

type ConfirmPaymentRow = {
  result_code: string;
  booking_id: string | null;
  payment_attempt_id: string | null;
  booking_status: string | null;
  booking_payment_status: string | null;
  payment_status: string | null;
  outbox_event_id: string | null;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isProvider = (value: unknown): value is PaymentProvider =>
  value === "culqi";

const isConfirmPaymentCode = (value: string): value is ConfirmPaymentCode =>
  value === "OK" ||
  value === "PAYMENT_ALREADY_CONFIRMED" ||
  value === "PAYMENT_ATTEMPT_NOT_FOUND" ||
  value === "PAYMENT_ATTEMPT_NOT_CONFIRMABLE" ||
  value === "PAYMENT_PROVIDER_MISMATCH" ||
  value === "PAYMENT_AMOUNT_MISMATCH" ||
  value === "PAYMENT_PROVIDER_ID_CONFLICT" ||
  value === "BOOKING_NOT_FOUND" ||
  value === "BOOKING_PAYMENT_STATE_INVALID" ||
  value === "PAYMENT_LATE_AFTER_EXPIRY" ||
  value === "INVALID_REQUEST";

export async function confirmPayment(
  rawInput: ConfirmPaymentInput
): Promise<ConfirmPaymentResult> {
  const input = rawInput as ConfirmPaymentInput | null;
  if (
    !input ||
    typeof input.paymentAttemptId !== "string" ||
    !UUID_PATTERN.test(input.paymentAttemptId) ||
    !isProvider(input.provider) ||
    typeof input.providerPaymentId !== "string" ||
    input.providerPaymentId.trim().length === 0 ||
    (input.providerOrderId != null &&
      (typeof input.providerOrderId !== "string" ||
        input.providerOrderId.trim().length === 0)) ||
    (input.paidAt != null &&
      (typeof input.paidAt !== "string" ||
        !Number.isFinite(Date.parse(input.paidAt))))
  ) {
    return {
      ok: false,
      code: "INVALID_REQUEST",
      bookingId: null,
      paymentAttemptId: null,
      bookingStatus: null,
      bookingPaymentStatus: null,
      paymentStatus: null,
      outboxEventId: null,
    };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("confirm_booking_payment", {
    p_payment_attempt_id: input.paymentAttemptId,
    p_provider: input.provider,
    p_provider_payment_id: input.providerPaymentId.trim(),
    p_provider_order_id: input.providerOrderId?.trim() || null,
    p_paid_at: input.paidAt ?? null,
  });

  if (error) {
    console.error("confirmPayment: RPC failed", error);
    return {
      ok: false,
      code: "INTERNAL_ERROR",
      bookingId: null,
      paymentAttemptId: input.paymentAttemptId,
      bookingStatus: null,
      bookingPaymentStatus: null,
      paymentStatus: null,
      outboxEventId: null,
    };
  }

  const rows = data as unknown as ConfirmPaymentRow[] | null;
  if (!rows || rows.length !== 1) {
    return {
      ok: false,
      code: "INTERNAL_ERROR",
      bookingId: null,
      paymentAttemptId: input.paymentAttemptId,
      bookingStatus: null,
      bookingPaymentStatus: null,
      paymentStatus: null,
      outboxEventId: null,
    };
  }

  const row = rows[0];
  const code = isConfirmPaymentCode(row.result_code)
    ? row.result_code
    : "INTERNAL_ERROR";
  const ok = code === "OK" || code === "PAYMENT_ALREADY_CONFIRMED" ||
    code === "PAYMENT_LATE_AFTER_EXPIRY";
  return {
    ok,
    code,
    bookingId: row.booking_id,
    paymentAttemptId: row.payment_attempt_id,
    bookingStatus: row.booking_status,
    bookingPaymentStatus: row.booking_payment_status,
    paymentStatus: row.payment_status,
    outboxEventId: row.outbox_event_id,
  };
}
