import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { PaymentAttempt, PaymentAttemptStatus } from "@/lib/payments/paymentTypes";

type PaymentAttemptRow = Omit<PaymentAttempt, "status"> & { status: string };

export type AdminPaymentData = {
  attemptsByBooking: Map<string, PaymentAttempt[]>;
  reviewAttemptIds: Set<string>;
  attemptsError: boolean;
  reviewError: boolean;
};

export async function getAdminPaymentData(
  bookingIds: string[]
): Promise<AdminPaymentData> {
  const result: AdminPaymentData = {
    attemptsByBooking: new Map(),
    reviewAttemptIds: new Set(),
    attemptsError: false,
    reviewError: false,
  };
  if (bookingIds.length === 0) return result;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, booking_id, provider, provider_order_id, provider_payment_id, amount_minor, currency, method, status, paid_at, created_at"
    )
    .in("booking_id", bookingIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminPaymentData: payment attempts lookup failed", error);
    result.attemptsError = true;
    return result;
  }

  const rows = (data || []) as unknown as PaymentAttemptRow[];
  const attemptIds: string[] = [];
  for (const row of rows) {
    const attempt: PaymentAttempt = {
      ...row,
      status: isPaymentAttemptStatus(row.status) ? row.status : "unknown",
    };
    const bookingAttempts = result.attemptsByBooking.get(attempt.booking_id) || [];
    bookingAttempts.push(attempt);
    result.attemptsByBooking.set(attempt.booking_id, bookingAttempts);
    attemptIds.push(attempt.id);
  }

  if (attemptIds.length === 0) return result;

  const { data: reviews, error: reviewError } = await supabase
    .from("integration_outbox")
    .select("aggregate_id")
    .eq("event_type", "payment.late_paid_requires_review")
    .eq("aggregate_type", "payment")
    .in("aggregate_id", attemptIds);

  if (reviewError) {
    console.error("getAdminPaymentData: late-payment review lookup failed", reviewError);
    result.reviewError = true;
  } else {
    for (const review of reviews || []) result.reviewAttemptIds.add(review.aggregate_id);
  }

  return result;
}

function isPaymentAttemptStatus(value: string): value is PaymentAttemptStatus {
  return value === "pending" || value === "processing" || value === "paid" ||
    value === "failed" || value === "expired" || value === "refunded";
}
