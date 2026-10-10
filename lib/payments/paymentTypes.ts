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
