import "server-only";

import type { BookingPaymentConfirmedEvent } from "@/lib/integrations/outbox/eventTypes";
import type { HandlerReadiness } from "@/lib/integrations/outbox/handlerReadiness";

/** Fail closed until this handler is connected to a real delivery adapter. */
export function getBookingPaymentConfirmedReadiness(): HandlerReadiness {
  return { ready: false, reason: "NOT_IMPLEMENTED" };
}

/** Internal boundary for the validated event; external adapters belong to a later phase. */
export async function handleBookingPaymentConfirmed(
  event: BookingPaymentConfirmedEvent
): Promise<void> {
  // Keep the validated contract in scope without adding booking or payment side effects.
  void event;
}
