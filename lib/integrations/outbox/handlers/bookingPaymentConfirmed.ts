import "server-only";

import type { BookingPaymentConfirmedEvent } from "@/lib/integrations/outbox/eventTypes";

/** Internal boundary for the validated event; external adapters belong to a later phase. */
export async function handleBookingPaymentConfirmed(
  event: BookingPaymentConfirmedEvent
): Promise<void> {
  // Keep the validated contract in scope without adding booking or payment side effects.
  void event;
}
