import assert from "node:assert/strict";
import test, { mock } from "node:test";

// Node's built-in module mocks keep dependency injection inside this test harness.
const harness = {};
mock.module("@/lib/integrations/outbox", { exports: {
  claimOutboxEvents: (...args) => harness.claim(...args),
  markOutboxProcessed: (...args) => harness.markProcessed(...args),
  markOutboxFailed: (...args) => harness.markFailed(...args),
} });
mock.module("@/lib/integrations/outbox/handlers/bookingPaymentConfirmed", { exports: {
  getBookingPaymentConfirmedReadiness: (...args) => harness.bookingReadiness(...args),
  handleBookingPaymentConfirmed: (...args) => harness.handleBookingPaymentConfirmed(...args),
} });
mock.module("@/lib/integrations/outbox/handlers/latePaidRequiresReview", { exports: {
  getLatePaidRequiresReviewReadiness: (...args) => harness.lateReadiness(...args),
  handleLatePaidRequiresReview: (...args) => harness.handleLatePaidRequiresReview(...args),
} });
const { dispatchOutboxBatch } = await import("../dispatcher.ts");

const id = "11111111-1111-4111-8111-111111111111";
const payload = {
  booking_id: id,
  payment_attempt_id: "22222222-2222-4222-8222-222222222222",
  client_profile_id: "33333333-3333-4333-8333-333333333333",
  beluer_profile_id: "44444444-4444-4444-8444-444444444444",
  service_id: "55555555-5555-4555-8555-555555555555",
  scheduled_date: "2026-10-14",
  scheduled_time: "12:00:00",
  district: "Miraflores",
  amount_minor: 12500,
  currency: "PEN",
  provider: "culqi",
  method: null,
};
const event = (overrides = {}) => ({
  id,
  event_type: "booking.payment_confirmed",
  aggregate_type: "booking",
  aggregate_id: id,
  payload: { ...payload },
  attempts: 1,
  available_at: "2026-10-14T00:00:00Z",
  ...overrides,
});
const success = (events = [event()]) => ({ ok: true, code: "OK", events });
const ack = (code = "OK") => ({ ok: code === "OK" || code === "ALREADY_PROCESSED", code, events: [] });
const baseDeps = (overrides = {}) => ({
  readiness: async () => ({ ready: true }),
  claim: async () => success(),
  markProcessed: async () => ack(),
  markFailed: async () => ack(),
  handleBookingPaymentConfirmed: async () => {},
  handleLatePaidRequiresReview: async () => {},
  ...overrides,
});

const runWithDependencies = (input, dependencies = baseDeps()) => {
  harness.bookingReadiness = dependencies.bookingReadiness ?? dependencies.readiness;
  harness.lateReadiness = dependencies.lateReadiness ?? dependencies.readiness;
  harness.claim = dependencies.claim;
  harness.markProcessed = dependencies.markProcessed;
  harness.markFailed = dependencies.markFailed;
  harness.handleBookingPaymentConfirmed = dependencies.handleBookingPaymentConfirmed;
  harness.handleLatePaidRequiresReview = dependencies.handleLatePaidRequiresReview;
  return dispatchOutboxBatch(input);
};

Object.assign(harness, {
  bookingReadiness: () => ({ ready: false, reason: "NOT_IMPLEMENTED" }),
  lateReadiness: () => ({ ready: false, reason: "NOT_IMPLEMENTED" }),
  claim: async () => success(),
  markProcessed: async () => ack(),
  markFailed: async () => ack(),
  handleBookingPaymentConfirmed: async () => {},
  handleLatePaidRequiresReview: async () => {},
});

test("dispatcher blocks until every registered handler is ready", async () => {
  const result = await dispatchOutboxBatch({ workerId: "worker", limit: 1 });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "NOT_READY");
  assert.equal(result.claimed, 0);
});

test("production readiness guard runs before claim and every ACK", async () => {
  const result = await dispatchOutboxBatch({ workerId: "worker", limit: 1 });
  assert.deepEqual(
    [result.claimed, result.processed, result.failed, result.alreadyProcessed, result.ackFailed],
    [0, 0, 0, 0, 0],
  );
  assert.deepEqual(result.results, []);
});

test("production dispatcher cannot be made ready by passing fake dependencies", async () => {
  let claims = 0;
  harness.bookingReadiness = () => ({ ready: false, reason: "NOT_IMPLEMENTED" });
  harness.lateReadiness = () => ({ ready: false, reason: "NOT_IMPLEMENTED" });
  harness.claim = async () => { claims += 1; return success(); };
  const fakeDependencies = baseDeps({
    readiness: async () => ({ ready: true }),
    claim: async () => { claims += 1; return success(); },
  });
  const result = await dispatchOutboxBatch({ workerId: "worker", limit: 1 }, fakeDependencies);
  assert.equal(result.reason, "NOT_READY");
  assert.equal(claims, 0);
});

test("partial handler readiness does not claim any event", async () => {
  let claims = 0;
  let acks = 0;
  const result = await runWithDependencies({ workerId: "worker", limit: 1 }, baseDeps({
    bookingReadiness: async () => ({ ready: true }),
    lateReadiness: async () => ({ ready: false, reason: "NOT_IMPLEMENTED" }),
    claim: async () => { claims += 1; return success(); },
    markProcessed: async () => { acks += 1; return ack(); },
    markFailed: async () => { acks += 1; return ack(); },
  }));
  assert.equal(result.reason, "NOT_READY");
  assert.deepEqual([claims, acks], [0, 0]);
});

test("readiness evaluation errors fail closed before claim", async () => {
  let claims = 0;
  const result = await runWithDependencies({ workerId: "worker", limit: 1 }, baseDeps({
    readiness: async () => { throw new Error("private dependency detail"); },
    claim: async () => { claims += 1; return success(); },
  }));
  assert.equal(result.reason, "NOT_READY");
  assert.equal(claims, 0);
  assert.equal(JSON.stringify(result).includes("private dependency detail"), false);
});

test("rejects invalid worker and batch limits without claiming", async () => {
  let calls = 0;
  const deps = baseDeps({ claim: async () => { calls += 1; return success([]); } });
  for (const input of [{ workerId: " ", limit: 1 }, { workerId: "worker", limit: 0 }, { workerId: "worker", limit: 101 }]) {
    const result = await runWithDependencies(input, deps);
    assert.equal(result.ok, false);
    assert.equal(result.claimFailure, "INVALID_REQUEST");
  }
  assert.equal(calls, 0);
});

test("reports claim failure distinctly from an empty batch", async () => {
  const failed = await runWithDependencies({ workerId: "worker", limit: 10 }, baseDeps({
    claim: async () => ({ ok: false, code: "INTERNAL_ERROR", events: [] }),
  }));
  const empty = await runWithDependencies({ workerId: "worker", limit: 10 }, baseDeps({
    claim: async () => success([]),
  }));
  assert.equal(failed.ok, false);
  assert.equal(failed.claimFailure, "INTERNAL_ERROR");
  assert.equal(empty.ok, true);
  assert.equal(empty.claimed, 0);
});

test("processes valid events and reports OK acknowledgement", async () => {
  const result = await runWithDependencies({ workerId: "worker", limit: 1 });
  assert.deepEqual([result.processed, result.failed, result.alreadyProcessed, result.ackFailed], [1, 0, 0, 0]);
});

test("late payment event routes only to its matching handler", async () => {
  const late = event({
    event_type: "payment.late_paid_requires_review",
    aggregate_type: "payment",
    aggregate_id: "22222222-2222-4222-8222-222222222222",
    payload: {
      booking_id: id,
      payment_attempt_id: "22222222-2222-4222-8222-222222222222",
      amount_minor: 12500,
      provider: "culqi",
      provider_payment_id: "payment-provider-1",
    },
  });
  const called = [];
  const result = await runWithDependencies({ workerId: "worker", limit: 1 }, baseDeps({
    claim: async () => success([late]),
    handleBookingPaymentConfirmed: async () => called.push("booking"),
    handleLatePaidRequiresReview: async () => called.push("late"),
  }));
  assert.deepEqual(called, ["late"]);
  assert.equal(result.processed, 1);
});

test("booking payment event never routes to the late payment handler", async () => {
  const called = [];
  await runWithDependencies({ workerId: "worker", limit: 1 }, baseDeps({
    handleBookingPaymentConfirmed: async () => called.push("booking"),
    handleLatePaidRequiresReview: async () => called.push("late"),
  }));
  assert.deepEqual(called, ["booking"]);
});

test("reports ALREADY_PROCESSED only when ACK returns that code", async () => {
  const result = await runWithDependencies({ workerId: "worker", limit: 1 }, baseDeps({
    markProcessed: async () => ack("ALREADY_PROCESSED"),
  }));
  assert.deepEqual([result.processed, result.alreadyProcessed, result.ackFailed], [0, 1, 0]);
});

test("reports ownership and ACK errors as ack_failed", async (t) => {
  for (const code of ["WORKER_MISMATCH", "EVENT_NOT_PROCESSING", "EVENT_NOT_FOUND", "INTERNAL_ERROR", "INVALID_REQUEST"]) {
    await t.test(code, async () => {
      const result = await runWithDependencies({ workerId: "worker", limit: 1 }, baseDeps({
        markProcessed: async () => ack(code),
      }));
      assert.deepEqual([result.processed, result.ackFailed], [0, 1]);
      assert.equal(result.results[0].code, code);
    });
  }
});

test("lease ownership loss after handler completion is surfaced as ACK failure", async () => {
  let handled = false;
  const result = await runWithDependencies({ workerId: "worker-a", limit: 1 }, baseDeps({
    handleBookingPaymentConfirmed: async () => { handled = true; },
    markProcessed: async () => ack("WORKER_MISMATCH"),
  }));
  assert.equal(handled, true);
  assert.equal(result.results[0].status, "ack_failed");
  assert.equal(result.ackFailed, 1);
});

test("keeps a failed handler isolated and safely ACKs it", async () => {
  const events = [event(), event({ id: "66666666-6666-4666-8666-666666666666", payload: { ...payload, booking_id: "66666666-6666-4666-8666-666666666666" }, aggregate_id: "66666666-6666-4666-8666-666666666666" })];
  const handled = [];
  const safeErrors = [];
  const result = await runWithDependencies({ workerId: "worker", limit: 2 }, baseDeps({
    claim: async () => success(events),
    handleBookingPaymentConfirmed: async (item) => {
      handled.push(item.id);
      if (handled.length === 1) throw new Error("secret token and customer data");
    },
    markFailed: async (_eventId, _workerId, error) => { safeErrors.push(error); return ack(); },
  }));
  assert.equal(handled.length, 2);
  assert.deepEqual(safeErrors, ["PROCESSING_FAILED"]);
  assert.deepEqual([result.failed, result.processed], [1, 1]);
  assert.equal(JSON.stringify(result).includes("secret token"), false);
});

test("invalid payload never reaches handler and is failed safely", async () => {
  const invalid = event({ payload: { ...payload, beluer_profile_id: null } });
  let called = false;
  let safeError;
  const result = await runWithDependencies({ workerId: "worker", limit: 1 }, baseDeps({
    claim: async () => success([invalid]),
    handleBookingPaymentConfirmed: async () => { called = true; },
    markFailed: async (_eventId, _workerId, error) => { safeError = error; return ack(); },
  }));
  assert.equal(called, false);
  assert.equal(safeError, "INVALID_RESPONSE");
  assert.equal(result.failed, 1);
});

test("unknown event never reaches a handler or processed ACK", async () => {
  let processed = 0;
  let failed = 0;
  const result = await runWithDependencies({ workerId: "worker", limit: 1 }, baseDeps({
    claim: async () => success([event({ event_type: "unknown.event" })]),
    markProcessed: async () => { processed += 1; return ack(); },
    markFailed: async () => { failed += 1; return ack(); },
  }));
  assert.equal(processed, 0);
  assert.equal(failed, 1);
  assert.equal(result.results[0].eventType, "unsupported");
});

test("failed ACK remains visible as ack_failed", async () => {
  const result = await runWithDependencies({ workerId: "worker", limit: 1 }, baseDeps({
    handleBookingPaymentConfirmed: async () => { throw new Error("private details"); },
    markFailed: async () => ack("WORKER_MISMATCH"),
  }));
  assert.equal(result.ackFailed, 1);
  assert.equal(result.failed, 0);
  assert.equal(JSON.stringify(result).includes("private details"), false);
});

test("MAX_ATTEMPTS_REACHED is reported as persisted terminal failure", async () => {
  const result = await runWithDependencies({ workerId: "worker", limit: 1 }, baseDeps({
    handleBookingPaymentConfirmed: async () => { throw new Error("failure"); },
    markFailed: async () => ack("MAX_ATTEMPTS_REACHED"),
  }));
  assert.equal(result.failed, 1);
  assert.equal(result.results[0].ackCode, "MAX_ATTEMPTS_REACHED");
});

test("processes events sequentially", async () => {
  const second = event({ id: "66666666-6666-4666-8666-666666666666", payload: { ...payload, booking_id: "66666666-6666-4666-8666-666666666666" }, aggregate_id: "66666666-6666-4666-8666-666666666666" });
  const order = [];
  await runWithDependencies({ workerId: "worker", limit: 2 }, baseDeps({
    claim: async () => success([event(), second]),
    handleBookingPaymentConfirmed: async (item) => { order.push(`handle:${item.id}`); },
    markProcessed: async (eventId) => { order.push(`ack:${eventId}`); return ack(); },
  }));
  assert.deepEqual(order, [`handle:${id}`, `ack:${id}`, `handle:${second.id}`, `ack:${second.id}`]);
});

test("ACK exception is represented without exposing its message", async () => {
  const result = await runWithDependencies({ workerId: "worker", limit: 1 }, baseDeps({
    markProcessed: async () => { throw new Error("secret endpoint"); },
  }));
  assert.equal(result.ackFailed, 1);
  assert.equal(result.results[0].code, "INTERNAL_ERROR");
  assert.equal(JSON.stringify(result).includes("secret endpoint"), false);
});
