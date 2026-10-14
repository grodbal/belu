import "server-only";

import type { LatePaidRequiresReviewEvent } from "@/lib/integrations/outbox/eventTypes";
import type { HandlerReadiness } from "@/lib/integrations/outbox/handlerReadiness";

/** Fail closed until this handler is connected to a real delivery adapter. */
export function getLatePaidRequiresReviewReadiness(): HandlerReadiness {
  return { ready: false, reason: "NOT_IMPLEMENTED" };
}

/** Internal reconciliation boundary; this handler does not mutate payment or booking state. */
export async function handleLatePaidRequiresReview(
  event: LatePaidRequiresReviewEvent
): Promise<void> {
  // Keep the validated contract in scope without creating an alert or external side effect.
  void event;
}
