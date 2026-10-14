import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type OutboxEventType =
  | "booking.payment_confirmed"
  | "payment.late_paid_requires_review"
  | (string & {});

export type OutboxEvent = {
  id: string;
  event_type: OutboxEventType;
  aggregate_type: string;
  aggregate_id: string;
  payload: unknown;
  attempts: number;
  available_at: string;
};

export type OutboxCode =
  | "OK"
  | "ALREADY_PROCESSED"
  | "EVENT_NOT_FOUND"
  | "EVENT_NOT_PROCESSING"
  | "WORKER_MISMATCH"
  | "MAX_ATTEMPTS_REACHED"
  | "INVALID_REQUEST"
  | "INTERNAL_ERROR";

export type OutboxResult =
  | { ok: true; code: "OK"; events: OutboxEvent[] }
  | { ok: false; code: Exclude<OutboxCode, "OK">; events: [] };

export type OutboxAckResult =
  | { ok: true; code: "OK" | "ALREADY_PROCESSED"; events: [] }
  | {
      ok: false;
      code: Exclude<OutboxCode, "OK" | "ALREADY_PROCESSED">;
      events: [];
    };

export type SafeOutboxError =
  | "DELIVERY_TIMEOUT"
  | "DELIVERY_REJECTED"
  | "INVALID_RESPONSE"
  | "PROCESSING_FAILED"
  | "WORKER_LEASE_EXPIRED";

type ClaimRow = OutboxEvent & { result_code: string };
type CodeRow = { result_code: string };

const isWorkerId = (value: string): boolean =>
  value.trim().length > 0 && value.trim().length <= 128;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ERRORS: readonly SafeOutboxError[] = [
  "DELIVERY_TIMEOUT",
  "DELIVERY_REJECTED",
  "INVALID_RESPONSE",
  "PROCESSING_FAILED",
  "WORKER_LEASE_EXPIRED",
];

const isOutboxCode = (value: string): value is OutboxCode =>
  value === "OK" ||
  value === "ALREADY_PROCESSED" ||
  value === "EVENT_NOT_FOUND" ||
  value === "EVENT_NOT_PROCESSING" ||
  value === "WORKER_MISMATCH" ||
  value === "MAX_ATTEMPTS_REACHED" ||
  value === "INVALID_REQUEST";

export async function claimOutboxEvents(
  limit: number,
  workerId: string
): Promise<OutboxResult> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !isWorkerId(workerId)) {
    return { ok: false, code: "INVALID_REQUEST", events: [] };
  }

  let rows: ClaimRow[];
  try {
    const { data, error } = await createAdminClient().rpc(
      "claim_integration_outbox_events",
      { p_limit: limit, p_worker_id: workerId.trim() }
    );
    if (error) return { ok: false, code: "INTERNAL_ERROR", events: [] };
    rows = (data || []) as unknown as ClaimRow[];
  } catch {
    return { ok: false, code: "INTERNAL_ERROR", events: [] };
  }
  if (rows.length === 1 && rows[0].result_code === "INVALID_REQUEST") {
    return { ok: false, code: "INVALID_REQUEST", events: [] };
  }
  if (rows.some((row) => row.result_code !== "OK" || !row.id)) {
    return { ok: false, code: "INTERNAL_ERROR", events: [] };
  }

  return {
    ok: true,
    code: "OK",
    events: rows.map((row) => ({
      id: row.id,
      event_type: row.event_type,
      aggregate_type: row.aggregate_type,
      aggregate_id: row.aggregate_id,
      payload: row.payload,
      attempts: row.attempts,
      available_at: row.available_at,
    })),
  };
}

export async function markOutboxProcessed(
  eventId: string,
  workerId: string
): Promise<OutboxAckResult> {
  return acknowledgeOutbox(
    "mark_integration_outbox_processed",
    { p_event_id: eventId, p_worker_id: workerId },
    eventId,
    workerId
  );
}

export async function markOutboxFailed(
  eventId: string,
  workerId: string,
  safeError: SafeOutboxError
): Promise<OutboxAckResult> {
  return acknowledgeOutbox(
    "mark_integration_outbox_failed",
    {
      p_event_id: eventId,
      p_worker_id: workerId,
      p_safe_error: SAFE_ERRORS.includes(safeError) ? safeError : "PROCESSING_FAILED",
    },
    eventId,
    workerId
  );
}

async function acknowledgeOutbox(
  rpcName: "mark_integration_outbox_processed" | "mark_integration_outbox_failed",
  args: Record<string, string>,
  eventId: string,
  workerId: string
): Promise<OutboxAckResult> {
  if (!UUID_PATTERN.test(eventId) || !isWorkerId(workerId)) {
    return { ok: false, code: "INVALID_REQUEST", events: [] };
  }

  let rows: CodeRow[];
  try {
    const { data, error } = await createAdminClient().rpc(rpcName, args);
    if (error) return { ok: false, code: "INTERNAL_ERROR", events: [] };
    rows = (data || []) as unknown as CodeRow[];
  } catch {
    return { ok: false, code: "INTERNAL_ERROR", events: [] };
  }
  if (rows.length !== 1 || !isOutboxCode(rows[0].result_code)) {
    return { ok: false, code: "INTERNAL_ERROR", events: [] };
  }
  const code = rows[0].result_code;
  if (code === "OK" || code === "ALREADY_PROCESSED") {
    return { ok: true, code, events: [] };
  }
  return { ok: false, code, events: [] };
}
