import assert from "node:assert/strict";
import test from "node:test";
import { parseOutboxEvent } from "../eventTypes.ts";

const uuid = "11111111-1111-4111-8111-111111111111";
const booking = () => ({
  id: uuid,
  event_type: "booking.payment_confirmed",
  aggregate_type: "booking",
  aggregate_id: uuid,
  payload: {
    booking_id: uuid,
    payment_attempt_id: "22222222-2222-4222-8222-222222222222",
    client_profile_id: "33333333-3333-4333-8333-333333333333",
    beluer_profile_id: "44444444-4444-4444-8444-444444444444",
    service_id: "55555555-5555-4555-8555-555555555555",
    scheduled_date: "2026-10-14",
    scheduled_time: "23:59:59.123456",
    district: "Miraflores",
    amount_minor: 12500,
    currency: "PEN",
    provider: "culqi",
    method: "card",
  },
  attempts: 1,
  available_at: "2026-10-14T00:00:00Z",
});
const late = () => ({
  ...booking(),
  event_type: "payment.late_paid_requires_review",
  aggregate_type: "payment",
  aggregate_id: "22222222-2222-4222-8222-222222222222",
  payload: {
    booking_id: uuid,
    payment_attempt_id: "22222222-2222-4222-8222-222222222222",
    amount_minor: 12500,
    provider: "culqi",
    provider_payment_id: "payment_123",
  },
});

test("accepts SQL-shaped booking payload and nullable method", () => {
  const event = booking();
  event.payload.method = null;
  assert.equal(parseOutboxEvent(event).ok, true);
});

test("rejects null, missing, empty, or malformed beluer_profile_id", () => {
  for (const value of [null, undefined, "", "not-a-uuid"]) {
    const event = booking();
    if (value === undefined) delete event.payload.beluer_profile_id;
    else event.payload.beluer_profile_id = value;
    assert.deepEqual(parseOutboxEvent(event), { ok: false, reason: "invalid_payload" });
  }
});

test("rejects invalid UUID formats in required IDs", () => {
  for (const field of ["booking_id", "payment_attempt_id", "client_profile_id", "beluer_profile_id", "service_id"]) {
    const event = booking();
    event.payload[field] = "123";
    assert.equal(parseOutboxEvent(event).ok, false, field);
  }
});

test("rejects invalid date and out-of-range PostgreSQL times", () => {
  for (const [field, value] of [["scheduled_date", "2026-02-30"], ["scheduled_time", "24:00:00"], ["scheduled_time", "12:60:00"]]) {
    const event = booking();
    event.payload[field] = value;
    assert.equal(parseOutboxEvent(event).ok, false, `${field}=${value}`);
  }
});

test("accepts legitimate amount precision and rejects unsafe/non-positive amounts", () => {
  for (const amount of [1, 12500, 9999999999]) {
    const event = booking();
    event.payload.amount_minor = amount;
    assert.equal(parseOutboxEvent(event).ok, true);
  }
  for (const amount of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    const event = booking();
    event.payload.amount_minor = amount;
    assert.equal(parseOutboxEvent(event).ok, false);
  }
});

test("enforces booking aggregate and booking ID consistency", () => {
  const wrongType = booking();
  wrongType.aggregate_type = "payment";
  assert.equal(parseOutboxEvent(wrongType).ok, false);
  const wrongId = booking();
  wrongId.aggregate_id = "66666666-6666-4666-8666-666666666666";
  assert.equal(parseOutboxEvent(wrongId).ok, false);
});

test("requires PEN, provider, and nonblank district", () => {
  for (const [field, value] of [["currency", "USD"], ["provider", " "], ["district", ""]]) {
    const event = booking();
    event.payload[field] = value;
    assert.equal(parseOutboxEvent(event).ok, false, field);
  }
});

test("validates late review payload and payment aggregate", () => {
  assert.equal(parseOutboxEvent(late()).ok, true);
  const wrongAggregate = late();
  wrongAggregate.aggregate_type = "booking";
  assert.equal(parseOutboxEvent(wrongAggregate).ok, false);
  const wrongId = late();
  wrongId.aggregate_id = uuid;
  assert.equal(parseOutboxEvent(wrongId).ok, false);
});

test("returns unsupported for an unknown event type", () => {
  const event = booking();
  event.event_type = "unknown.event";
  assert.deepEqual(parseOutboxEvent(event), { ok: false, reason: "unsupported_event" });
});
