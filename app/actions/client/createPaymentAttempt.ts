"use server";

import { createPaymentAttempt as createPaymentAttemptInternal } from "@/lib/payments/paymentAttempt";
import type {
  CreatePaymentAttemptInput,
  PaymentAttemptResult,
} from "@/lib/payments/paymentTypes";

export async function createPaymentAttemptAction(
  input: CreatePaymentAttemptInput
): Promise<PaymentAttemptResult> {
  return createPaymentAttemptInternal(input);
}
