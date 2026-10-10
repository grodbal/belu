import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  CreatePaymentAttemptErrorCode,
  CreatePaymentAttemptInput,
  PaymentAttemptResult,
  PaymentAttemptStatus,
  PaymentMethod,
  PaymentProvider,
} from "@/lib/payments/paymentTypes";

type PaymentAttemptRow = {
  result_code: string;
  payment_attempt_id: string | null;
  booking_id: string | null;
  amount_minor: number | string | null;
  currency: string | null;
  method: string | null;
  provider: string | null;
  expires_at: string | null;
  status: string | null;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isProvider = (value: unknown): value is PaymentProvider =>
  value === "culqi";

const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  value === "card" || value === "yape" || value === "qr";

const isPaymentAttemptStatus = (
  value: unknown
): value is PaymentAttemptStatus =>
  value === "pending" ||
  value === "processing" ||
  value === "paid" ||
  value === "failed" ||
  value === "expired" ||
  value === "refunded";

const isErrorCode = (
  value: string
): value is CreatePaymentAttemptErrorCode =>
  value === "INVALID_REQUEST" ||
  value === "UNAUTHORIZED" ||
  value === "CLIENT_PROFILE_NOT_FOUND" ||
  value === "BOOKING_NOT_FOUND" ||
  value === "BOOKING_NOT_OWNED" ||
  value === "BOOKING_NOT_PAYMENT_PENDING" ||
  value === "BOOKING_BELUER_UNASSIGNED" ||
  value === "PAYMENT_ALREADY_COMPLETED" ||
  value === "PAYMENT_HOLD_INVALID" ||
  value === "PAYMENT_HOLD_EXPIRED" ||
  value === "PAYMENT_ATTEMPT_ALREADY_ACTIVE" ||
  value === "PAYMENT_ATTEMPT_NOT_REUSABLE" ||
  value === "IDEMPOTENCY_KEY_REUSED" ||
  value === "PAYMENT_AMOUNT_INVALID" ||
  value === "INTERNAL_ERROR";

const publicErrors: Record<CreatePaymentAttemptErrorCode, string> = {
  INVALID_REQUEST: "No pudimos validar la solicitud de pago.",
  UNAUTHORIZED: "Inicia sesión como clienta para continuar.",
  CLIENT_PROFILE_NOT_FOUND: "No encontramos tu perfil de clienta.",
  BOOKING_NOT_FOUND: "No encontramos esa reserva.",
  BOOKING_NOT_OWNED: "No puedes iniciar el pago de esa reserva.",
  BOOKING_NOT_PAYMENT_PENDING: "Esta reserva ya no está pendiente de pago.",
  BOOKING_BELUER_UNASSIGNED: "La reserva ya no tiene una especialista asignada.",
  PAYMENT_ALREADY_COMPLETED: "Esta reserva ya tiene el pago confirmado.",
  PAYMENT_HOLD_INVALID: "La reserva no tiene una retención de pago válida.",
  PAYMENT_HOLD_EXPIRED: "El tiempo para pagar esta reserva venció.",
  PAYMENT_ATTEMPT_ALREADY_ACTIVE:
    "Ya existe un intento de pago activo para esta reserva.",
  PAYMENT_ATTEMPT_NOT_REUSABLE:
    "El intento anterior ya no se puede reutilizar. Inicia un nuevo intento.",
  IDEMPOTENCY_KEY_REUSED:
    "No pudimos validar el intento. Actualiza la página e inténtalo nuevamente.",
  PAYMENT_AMOUNT_INVALID: "No pudimos validar el monto de la reserva.",
  INTERNAL_ERROR: "No pudimos iniciar el intento de pago. Inténtalo nuevamente.",
};

function failure(code: CreatePaymentAttemptErrorCode): PaymentAttemptResult {
  return { ok: false, code, message: publicErrors[code] };
}

function mapRpcRow(row: PaymentAttemptRow): PaymentAttemptResult {
  if (row.result_code !== "OK") {
    return failure(
      isErrorCode(row.result_code) ? row.result_code : "INTERNAL_ERROR"
    );
  }

  const amountMinor = Number(row.amount_minor);
  if (
    !row.payment_attempt_id ||
    !row.booking_id ||
    !Number.isSafeInteger(amountMinor) ||
    amountMinor <= 0 ||
    row.currency !== "PEN" ||
    !isProvider(row.provider) ||
    !isPaymentMethod(row.method) ||
    !row.expires_at ||
    !isPaymentAttemptStatus(row.status)
  ) {
    return failure("INTERNAL_ERROR");
  }

  if (row.status === "paid") return failure("PAYMENT_ALREADY_COMPLETED");
  if (row.status === "expired") return failure("PAYMENT_HOLD_EXPIRED");
  if (row.status === "failed" || row.status === "refunded") {
    return failure("PAYMENT_ATTEMPT_NOT_REUSABLE");
  }

  return {
    ok: true,
    paymentAttemptId: row.payment_attempt_id,
    bookingId: row.booking_id,
    amountMinor,
    currency: "PEN",
    method: row.method,
    provider: row.provider,
    expiresAt: row.expires_at,
  };
}

export async function createPaymentAttempt(
  rawInput: CreatePaymentAttemptInput
): Promise<PaymentAttemptResult> {
  const input = rawInput as CreatePaymentAttemptInput | null;
  if (
    !input ||
    typeof input.bookingId !== "string" ||
    !UUID_PATTERN.test(input.bookingId) ||
    typeof input.idempotencyKey !== "string" ||
    !UUID_PATTERN.test(input.idempotencyKey) ||
    !isProvider(input.provider) ||
    !isPaymentMethod(input.method)
  ) {
    return failure("INVALID_REQUEST");
  }

  const authClient = await createClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) return failure("UNAUTHORIZED");

  const supabase = createAdminClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("createPaymentAttempt: profile lookup failed", profileError);
    return failure("INTERNAL_ERROR");
  }
  if (!profile) return failure("CLIENT_PROFILE_NOT_FOUND");
  if (profile.role !== "cliente") return failure("UNAUTHORIZED");

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "create_payment_attempt_with_hold_lock",
    {
      p_booking_id: input.bookingId,
      p_client_profile_id: profile.id,
      p_provider: input.provider,
      p_method: input.method,
      p_idempotency_key: input.idempotencyKey,
    }
  );

  if (rpcError) {
    console.error("createPaymentAttempt: RPC failed", rpcError);
    return failure("INTERNAL_ERROR");
  }

  const rows = rpcData as unknown as PaymentAttemptRow[] | null;
  if (!rows || rows.length !== 1) return failure("INTERNAL_ERROR");

  return mapRpcRow(rows[0]);
}
