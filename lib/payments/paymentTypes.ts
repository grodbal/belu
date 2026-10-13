export type PaymentProvider = "culqi";

export type PaymentMethod = "card" | "yape" | "qr";

export type PaymentAttemptStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "expired"
  | "refunded";

export type PaymentCurrency = "PEN";

export type PaymentAttempt = {
  id: string;
  booking_id: string;
  provider: string;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  amount_minor: number | string;
  currency: string;
  method: string | null;
  status: PaymentAttemptStatus | "unknown";
  paid_at: string | null;
  created_at: string;
};

export type PaymentReviewState = "none" | "required";

export type CreatePaymentAttemptInput = {
  bookingId: string;
  provider: PaymentProvider;
  method: PaymentMethod;
  idempotencyKey: string;
};

export type CreatePaymentAttemptErrorCode =
  | "INVALID_REQUEST"
  | "UNAUTHORIZED"
  | "CLIENT_PROFILE_NOT_FOUND"
  | "BOOKING_NOT_FOUND"
  | "BOOKING_NOT_OWNED"
  | "BOOKING_NOT_PAYMENT_PENDING"
  | "BOOKING_BELUER_UNASSIGNED"
  | "PAYMENT_ALREADY_COMPLETED"
  | "PAYMENT_HOLD_INVALID"
  | "PAYMENT_HOLD_EXPIRED"
  | "PAYMENT_ATTEMPT_ALREADY_ACTIVE"
  | "PAYMENT_ATTEMPT_NOT_REUSABLE"
  | "IDEMPOTENCY_KEY_REUSED"
  | "PAYMENT_AMOUNT_INVALID"
  | "INTERNAL_ERROR";

export type PaymentAttemptResult =
  | {
      ok: true;
      paymentAttemptId: string;
      bookingId: string;
      amountMinor: number;
      currency: PaymentCurrency;
      method: PaymentMethod;
      provider: PaymentProvider;
      expiresAt: string;
    }
  | {
      ok: false;
      code: CreatePaymentAttemptErrorCode;
      message: string;
    };

export type ConfirmPaymentInput = {
  paymentAttemptId: string;
  provider: PaymentProvider;
  providerPaymentId: string;
  providerOrderId?: string | null;
  paidAt?: string | null;
};

export type ConfirmPaymentCode =
  | "OK"
  | "PAYMENT_ALREADY_CONFIRMED"
  | "PAYMENT_ATTEMPT_NOT_FOUND"
  | "PAYMENT_ATTEMPT_NOT_CONFIRMABLE"
  | "PAYMENT_PROVIDER_MISMATCH"
  | "PAYMENT_AMOUNT_MISMATCH"
  | "PAYMENT_PROVIDER_ID_CONFLICT"
  | "BOOKING_NOT_FOUND"
  | "BOOKING_PAYMENT_STATE_INVALID"
  | "PAYMENT_LATE_AFTER_EXPIRY"
  | "INVALID_REQUEST"
  | "INTERNAL_ERROR";

export type ConfirmPaymentResult = {
  ok: boolean;
  code: ConfirmPaymentCode;
  bookingId: string | null;
  paymentAttemptId: string | null;
  bookingStatus: string | null;
  bookingPaymentStatus: string | null;
  paymentStatus: string | null;
  outboxEventId: string | null;
};
