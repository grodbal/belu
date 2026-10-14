import type { OutboxEvent } from "@/lib/integrations/outbox";

export type SupportedOutboxEventType =
  | "booking.payment_confirmed"
  | "payment.late_paid_requires_review";

export type BookingPaymentConfirmedPayload = {
  booking_id: string;
  payment_attempt_id: string;
  client_profile_id: string;
  beluer_profile_id: string;
  service_id: string;
  scheduled_date: string;
  scheduled_time: string;
  district: string;
  amount_minor: number;
  currency: "PEN";
  provider: string;
  method: string | null;
};

export type LatePaidRequiresReviewPayload = {
  booking_id: string;
  payment_attempt_id: string;
  amount_minor: number;
  provider: string;
  provider_payment_id: string;
};

export type BookingPaymentConfirmedEvent = Omit<OutboxEvent, "event_type" | "payload"> & {
  event_type: "booking.payment_confirmed";
  aggregate_type: "booking";
  payload: BookingPaymentConfirmedPayload;
};

export type LatePaidRequiresReviewEvent = Omit<OutboxEvent, "event_type" | "payload"> & {
  event_type: "payment.late_paid_requires_review";
  aggregate_type: "payment";
  payload: LatePaidRequiresReviewPayload;
};

export type SupportedOutboxEvent =
  | BookingPaymentConfirmedEvent
  | LatePaidRequiresReviewEvent;

export type EventParseResult =
  | { ok: true; event: SupportedOutboxEvent }
  | { ok: false; reason: "unsupported_event" | "invalid_payload" };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isNonEmptyString(value);
}

function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isPostgresTime(value: unknown): value is string {
  return typeof value === "string" &&
    /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?$/.test(value);
}

function isBookingPaymentConfirmedPayload(
  value: unknown
): value is BookingPaymentConfirmedPayload {
  if (!isRecord(value)) return false;
  return isUuid(value.booking_id) &&
    isUuid(value.payment_attempt_id) &&
    isUuid(value.client_profile_id) &&
    isUuid(value.beluer_profile_id) &&
    isUuid(value.service_id) &&
    isIsoDate(value.scheduled_date) &&
    isPostgresTime(value.scheduled_time) &&
    isNonEmptyString(value.district) &&
    isPositiveSafeInteger(value.amount_minor) &&
    value.currency === "PEN" &&
    isNonEmptyString(value.provider) &&
    isNullableString(value.method);
}

function isLatePaidRequiresReviewPayload(
  value: unknown
): value is LatePaidRequiresReviewPayload {
  if (!isRecord(value)) return false;
  return isUuid(value.booking_id) &&
    isUuid(value.payment_attempt_id) &&
    isPositiveSafeInteger(value.amount_minor) &&
    isNonEmptyString(value.provider) &&
    isNonEmptyString(value.provider_payment_id);
}

export function parseOutboxEvent(event: OutboxEvent): EventParseResult {
  if (event.event_type === "booking.payment_confirmed") {
    if (
      event.aggregate_type !== "booking" ||
      !isUuid(event.aggregate_id) ||
      !isBookingPaymentConfirmedPayload(event.payload) ||
      event.aggregate_id !== event.payload.booking_id
    ) {
      return { ok: false, reason: "invalid_payload" };
    }
    return {
      ok: true,
      event: {
        id: event.id,
        event_type: "booking.payment_confirmed",
        aggregate_type: "booking",
        aggregate_id: event.aggregate_id,
        payload: event.payload,
        attempts: event.attempts,
        available_at: event.available_at,
      },
    };
  }

  if (event.event_type === "payment.late_paid_requires_review") {
    if (
      event.aggregate_type !== "payment" ||
      !isUuid(event.aggregate_id) ||
      !isLatePaidRequiresReviewPayload(event.payload) ||
      event.aggregate_id !== event.payload.payment_attempt_id
    ) {
      return { ok: false, reason: "invalid_payload" };
    }
    return {
      ok: true,
      event: {
        id: event.id,
        event_type: "payment.late_paid_requires_review",
        aggregate_type: "payment",
        aggregate_id: event.aggregate_id,
        payload: event.payload,
        attempts: event.attempts,
        available_at: event.available_at,
      },
    };
  }

  return { ok: false, reason: "unsupported_event" };
}
