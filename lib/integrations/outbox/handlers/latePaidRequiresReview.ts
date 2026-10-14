import "server-only";

import type { LatePaidRequiresReviewEvent } from "@/lib/integrations/outbox/eventTypes";

/** Internal reconciliation boundary; this handler does not mutate payment or booking state. */
export async function handleLatePaidRequiresReview(
  event: LatePaidRequiresReviewEvent
): Promise<void> {
  // Keep the validated contract in scope without creating an alert or external side effect.
  void event;
}
