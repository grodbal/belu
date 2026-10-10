import { getBookingClientTotal } from "@/lib/bookings/bookingDisplayFinance";

type BookingPaymentAmountFields = {
  service_price_snapshot: number | string | null;
  base_price: number | string | null;
  logistic_fee: number | string | null;
  express_fee: number | string | null;
};

export function getBookingPaymentAmountMinor(
  booking: BookingPaymentAmountFields
) {
  // Parity helper for the SQL RPC: snapshot -> base_price, plus logistics and
  // Express, rounded to PEN minor units. The RPC is authoritative for inserts.
  const total = getBookingClientTotal(booking).total;

  if (!Number.isFinite(total) || total <= 0) return null;

  const amountMinor = Math.round(total * 100);

  return Number.isSafeInteger(amountMinor) && amountMinor > 0
    ? amountMinor
    : null;
}
