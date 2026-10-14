import "server-only";

import {
  claimOutboxEvents,
  markOutboxFailed,
  markOutboxProcessed,
  type OutboxAckResult,
  type OutboxCode,
  type OutboxEvent,
  type SafeOutboxError,
} from "@/lib/integrations/outbox";
import {
  getBookingPaymentConfirmedReadiness,
  handleBookingPaymentConfirmed,
} from "@/lib/integrations/outbox/handlers/bookingPaymentConfirmed";
import {
  getLatePaidRequiresReviewReadiness,
  handleLatePaidRequiresReview,
} from "@/lib/integrations/outbox/handlers/latePaidRequiresReview";
import {
  parseOutboxEvent,
  type SupportedOutboxEvent,
  type SupportedOutboxEventType,
} from "@/lib/integrations/outbox/eventTypes";
import type { HandlerReadiness } from "@/lib/integrations/outbox/handlerReadiness";

export type DispatchOutboxBatchInput = {
  workerId: string;
  limit: number;
};

export type DispatchEventResult =
  | { eventId: string; eventType: SupportedOutboxEventType; status: "processed" }
  | { eventId: string; eventType: SupportedOutboxEventType; status: "already_processed" }
  | {
      eventId: string;
      eventType: SupportedOutboxEventType | "unsupported";
      status: "failed";
      safeError: SafeOutboxError;
      ackCode: "OK" | "MAX_ATTEMPTS_REACHED";
    }
  | {
      eventId: string;
      eventType: SupportedOutboxEventType | "unsupported";
      status: "ack_failed";
      operation: "processed" | "failed";
      code: OutboxCode;
    };

export type DispatchOutboxBatchResult =
  | {
      ok: false;
      workerId: string;
      reason: "NOT_READY";
      claimed: 0;
      processed: 0;
      failed: 0;
      alreadyProcessed: 0;
      ackFailed: 0;
      results: [];
    }
  | {
      ok: true;
      workerId: string;
      claimed: number;
      processed: number;
      failed: number;
      alreadyProcessed: number;
      ackFailed: number;
      results: DispatchEventResult[];
    }
  | {
      ok: false;
      workerId: string;
      claimFailure: OutboxCode;
      claimed: 0;
      processed: 0;
      failed: 0;
      alreadyProcessed: 0;
      ackFailed: 0;
      results: [];
    };

type ProductionDependencies = {
  readiness: () => Promise<HandlerReadiness>;
  claim: typeof claimOutboxEvents;
  markProcessed: typeof markOutboxProcessed;
  markFailed: typeof markOutboxFailed;
  handleBookingPaymentConfirmed: typeof handleBookingPaymentConfirmed;
  handleLatePaidRequiresReview: typeof handleLatePaidRequiresReview;
};

const productionDependencies: ProductionDependencies = {
  readiness: async () => {
    const readiness = await Promise.all([
      getBookingPaymentConfirmedReadiness(),
      getLatePaidRequiresReviewReadiness(),
    ]);
    return readiness.every((handler) => handler.ready)
      ? { ready: true }
      : { ready: false, reason: "NOT_IMPLEMENTED" };
  },
  claim: claimOutboxEvents,
  markProcessed: markOutboxProcessed,
  markFailed: markOutboxFailed,
  handleBookingPaymentConfirmed,
  handleLatePaidRequiresReview,
};

const isWorkerId = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.trim().length <= 128;

const isLimit = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 100;

async function routeEvent(event: SupportedOutboxEvent): Promise<void> {
  switch (event.event_type) {
    case "booking.payment_confirmed":
      await productionDependencies.handleBookingPaymentConfirmed(event);
      return;
    case "payment.late_paid_requires_review":
      await productionDependencies.handleLatePaidRequiresReview(event);
      return;
  }
}

function safeEventType(event: OutboxEvent): SupportedOutboxEventType | "unsupported" {
  if (event.event_type === "booking.payment_confirmed") return "booking.payment_confirmed";
  if (event.event_type === "payment.late_paid_requires_review") return "payment.late_paid_requires_review";
  return "unsupported";
}

async function acknowledgeFailure(
  event: OutboxEvent,
  workerId: string,
  safeError: SafeOutboxError,
  eventType: SupportedOutboxEventType | "unsupported"
): Promise<DispatchEventResult> {
  let ack: OutboxAckResult;
  try {
    ack = await productionDependencies.markFailed(event.id, workerId, safeError);
  } catch {
    return { eventId: event.id, eventType, status: "ack_failed", operation: "failed", code: "INTERNAL_ERROR" };
  }

  if (ack.code === "OK" || ack.code === "MAX_ATTEMPTS_REACHED") {
    return { eventId: event.id, eventType, status: "failed", safeError, ackCode: ack.code };
  }
  return { eventId: event.id, eventType, status: "ack_failed", operation: "failed", code: ack.code };
}

/** Production entry point. Readiness and all side-effect dependencies are module-owned. */
export async function dispatchOutboxBatch(
  input: DispatchOutboxBatchInput
): Promise<DispatchOutboxBatchResult> {
  if (!isWorkerId(input?.workerId) || !isLimit(input?.limit)) {
    return {
      ok: false,
      workerId: isWorkerId(input?.workerId) ? input.workerId.trim() : "invalid",
      claimFailure: "INVALID_REQUEST",
      claimed: 0,
      processed: 0,
      failed: 0,
      alreadyProcessed: 0,
      ackFailed: 0,
      results: [],
    };
  }

  const workerId = input.workerId.trim();
  let readiness: HandlerReadiness;
  try {
    readiness = await productionDependencies.readiness();
  } catch {
    readiness = { ready: false, reason: "DEPENDENCY_UNAVAILABLE" };
  }

  if (!readiness.ready) {
    return {
      ok: false,
      workerId,
      reason: "NOT_READY",
      claimed: 0,
      processed: 0,
      failed: 0,
      alreadyProcessed: 0,
      ackFailed: 0,
      results: [],
    };
  }

  const claim = await productionDependencies.claim(input.limit, workerId);
  if (!claim.ok) {
    return {
      ok: false,
      workerId,
      claimFailure: claim.code,
      claimed: 0,
      processed: 0,
      failed: 0,
      alreadyProcessed: 0,
      ackFailed: 0,
      results: [],
    };
  }

  const results: DispatchEventResult[] = [];
  for (const event of claim.events) {
    const parsed = parseOutboxEvent(event);
    if (!parsed.ok) {
      const safeError = parsed.reason === "invalid_payload" ? "INVALID_RESPONSE" : "PROCESSING_FAILED";
      results.push(await acknowledgeFailure(
        event,
        workerId,
        safeError,
        parsed.reason === "unsupported_event" ? "unsupported" : safeEventType(event)
      ));
      continue;
    }

    try {
      await routeEvent(parsed.event);
    } catch {
      results.push(await acknowledgeFailure(event, workerId, "PROCESSING_FAILED", parsed.event.event_type));
      continue;
    }

    let ack: OutboxAckResult;
    try {
      ack = await productionDependencies.markProcessed(event.id, workerId);
    } catch {
      results.push({
        eventId: event.id,
        eventType: parsed.event.event_type,
        status: "ack_failed",
        operation: "processed",
        code: "INTERNAL_ERROR",
      });
      continue;
    }

    if (ack.ok && ack.code === "OK") {
      results.push({ eventId: event.id, eventType: parsed.event.event_type, status: "processed" });
    } else if (ack.ok && ack.code === "ALREADY_PROCESSED") {
      results.push({ eventId: event.id, eventType: parsed.event.event_type, status: "already_processed" });
    } else {
      results.push({
        eventId: event.id,
        eventType: parsed.event.event_type,
        status: "ack_failed",
        operation: "processed",
        code: ack.code,
      });
    }
  }

  return {
    ok: true,
    workerId,
    claimed: claim.events.length,
    processed: results.filter((result) => result.status === "processed").length,
    failed: results.filter((result) => result.status === "failed").length,
    alreadyProcessed: results.filter((result) => result.status === "already_processed").length,
    ackFailed: results.filter((result) => result.status === "ack_failed").length,
    results,
  };
}
