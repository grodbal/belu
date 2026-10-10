type MoneyValue = number | string | null | undefined;

type BookingPriceFields = {
  service_price_snapshot?: MoneyValue;
  base_price?: MoneyValue;
};

export function getBookingServicePrice(booking: BookingPriceFields) {
  // public_price remains stored for compatibility, but is not a service-price fallback.
  const amount = Number(booking.service_price_snapshot ?? booking.base_price ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

export function getBookingClientTotal(
  booking: BookingPriceFields & {
    logistic_fee?: MoneyValue;
    express_fee?: MoneyValue;
  }
) {
  const servicePrice = getBookingServicePrice(booking);
  const logisticFee = toMoney(booking.logistic_fee);
  const expressFee = toMoney(booking.express_fee);

  return {
    servicePrice,
    logisticFee,
    expressFee,
    total: servicePrice + logisticFee + expressFee,
  };
}

export function getBookingServiceName(
  snapshot: string | null | undefined,
  currentName: string | null | undefined
) {
  return snapshot || currentName || "Servicio belu";
}

export function getBookingServiceCategory(
  snapshot: string | null | undefined,
  currentCategory: string | null | undefined
) {
  return snapshot || currentCategory || null;
}

function toMoney(value: MoneyValue) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}
