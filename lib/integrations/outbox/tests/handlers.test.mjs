import assert from "node:assert/strict";
import test from "node:test";
import {
  getBookingPaymentConfirmedReadiness,
  handleBookingPaymentConfirmed,
} from "../handlers/bookingPaymentConfirmed.ts";
import {
  getLatePaidRequiresReviewReadiness,
  handleLatePaidRequiresReview,
} from "../handlers/latePaidRequiresReview.ts";

test("production handlers remain NOT_IMPLEMENTED no-ops", async () => {
  assert.deepEqual(getBookingPaymentConfirmedReadiness(), {
    ready: false,
    reason: "NOT_IMPLEMENTED",
  });
  assert.deepEqual(getLatePaidRequiresReviewReadiness(), {
    ready: false,
    reason: "NOT_IMPLEMENTED",
  });
  await assert.doesNotReject(handleBookingPaymentConfirmed({}));
  await assert.doesNotReject(handleLatePaidRequiresReview({}));
});
