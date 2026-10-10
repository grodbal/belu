import "server-only";

export type CommissionLockEvent =
  | "admin_assigned"
  | "client_selected_beluer";

type BookingFinancialSnapshotInput = {
  beluerLevel: string | null | undefined;
  servicePriceSnapshot?: number | null;
  basePrice: number;
  logisticFee: number;
  expressFee: number;
  lockEvent: CommissionLockEvent;
};

function normalizeBeluerLevel(level: string | null | undefined) {
  return String(level || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveBeluerCommissionRate(level: string | null | undefined) {
  const normalizedLevel = normalizeBeluerLevel(level);
  const levelSnapshot = String(level || "").trim();
  const topLevels = new Set([
    "top",
    "beluer_top",
    "beluer top",
    "top ✦",
    "beluer top ✦",
  ]);
  const premiumLevels = new Set([
    "verified",
    "verificada",
    "beluer_verificada",
    "beluer verificada",
    "premium",
  ]);
  const standardLevels = new Set([
    "new",
    "nueva",
    "beluer_nueva",
    "beluer nueva",
    "standard",
    "estandar",
  ]);

  if (topLevels.has(normalizedLevel)) {
    return {
      levelSnapshot: levelSnapshot || "top",
      rateDecimal: 0.08,
      legacyRate: 8,
    };
  }

  if (premiumLevels.has(normalizedLevel)) {
    return {
      levelSnapshot: levelSnapshot || "premium",
      rateDecimal: 0.1,
      legacyRate: 10,
    };
  }

  if (standardLevels.has(normalizedLevel)) {
    return {
      levelSnapshot: levelSnapshot || "standard",
      rateDecimal: 0.13,
      legacyRate: 13,
    };
  }

  return {
    levelSnapshot: "standard",
    rateDecimal: 0.13,
    legacyRate: 13,
  };
}

function toSafeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function roundMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function buildBookingFinancialSnapshots({
  beluerLevel,
  servicePriceSnapshot,
  basePrice,
  logisticFee,
  expressFee,
  lockEvent,
}: BookingFinancialSnapshotInput) {
  const commission = resolveBeluerCommissionRate(beluerLevel);
  const safeBasePrice = toSafeNumber(servicePriceSnapshot ?? basePrice);
  const safeLogisticFee = toSafeNumber(logisticFee);
  const safeExpressFee = toSafeNumber(expressFee);
  const beluCommissionAmount = roundMoney(
    safeBasePrice * commission.rateDecimal
  );
  const beluerServicePayoutAmount = roundMoney(
    safeBasePrice - beluCommissionAmount
  );
  const beluerLogisticPayoutAmount = roundMoney(safeLogisticFee);
  const beluerExpressPayoutAmount = roundMoney(safeExpressFee);
  const beluerTotalPayoutAmount = roundMoney(
    beluerServicePayoutAmount +
      beluerLogisticPayoutAmount +
      beluerExpressPayoutAmount
  );
  const commissionLockedAt = new Date().toISOString();

  return {
    beluer_level_snapshot: commission.levelSnapshot,
    commission_rate_snapshot: commission.rateDecimal,
    belu_commission_rate: commission.legacyRate,
    belu_commission_amount: beluCommissionAmount,
    beluer_service_payout_amount: beluerServicePayoutAmount,
    beluer_logistic_payout_amount: beluerLogisticPayoutAmount,
    beluer_express_payout_amount: beluerExpressPayoutAmount,
    beluer_total_payout_amount: beluerTotalPayoutAmount,
    beluer_payment_amount: beluerTotalPayoutAmount,
    commission_locked_at: commissionLockedAt,
    commission_locked_event: lockEvent,
  };
}
