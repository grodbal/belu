import type {
  PaymentAttempt,
  PaymentReviewState,
} from "@/lib/payments/paymentTypes";
import { getAdminPaymentPresentation } from "@/lib/payments/adminPaymentPresentation";

type AdminBookingPaymentDetailsProps = {
  bookingId: string;
  bookingStatus: string;
  bookingPaymentStatus: string;
  holdExpiresAt: string | null;
  attempts: PaymentAttempt[];
  reviewAttemptIds: string[];
  attemptsUnavailable: boolean;
  reviewsUnavailable: boolean;
};

const paymentStatusLabels: Record<PaymentAttempt["status"], string> = {
  pending: "Pendiente",
  processing: "Procesando",
  paid: "Pagado",
  failed: "Fallido",
  expired: "Vencido",
  refunded: "Reembolsado",
  unknown: "Estado no disponible",
};

function formatAmount(attempt: PaymentAttempt) {
  const minor = Number(attempt.amount_minor);
  if (!Number.isFinite(minor)) return "Monto no disponible";
  const amount = minor / 100;
  return attempt.currency === "PEN"
    ? new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(amount)
    : `${amount.toFixed(2)} ${attempt.currency}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Lima",
  }).format(date);
}

function methodLabel(method: string | null) {
  if (!method) return null;
  if (method === "card") return "Tarjeta";
  if (method === "yape") return "Yape";
  if (method === "qr") return "QR";
  return method;
}

function reviewStateFor(attempt: PaymentAttempt, reviewIds: Set<string>): PaymentReviewState {
  return reviewIds.has(attempt.id) ? "required" : "none";
}

export default function AdminBookingPaymentDetails({
  bookingId,
  bookingStatus,
  bookingPaymentStatus,
  holdExpiresAt,
  attempts,
  reviewAttemptIds,
  attemptsUnavailable,
  reviewsUnavailable,
}: AdminBookingPaymentDetailsProps) {
  const latestAttempt = attempts[0];
  const reviewIds = new Set(reviewAttemptIds);
  const paymentPresentation = getAdminPaymentPresentation(
    bookingPaymentStatus,
    bookingStatus,
    latestAttempt,
    reviewIds
  );
  const lateAttempts = attempts.filter(
    (attempt) => reviewStateFor(attempt, reviewIds) === "required"
  );
  const expiredHold = bookingStatus === "cancelled" &&
    bookingPaymentStatus === "pending" &&
    attempts.some((attempt) => attempt.status === "expired");

  return (
    <section className="admin-booking-admin-block">
      <h4>Pago</h4>

      <span className={`admin-payment-badge ${paymentPresentation.state} mb-3`}>
        {paymentPresentation.label}
      </span>

      {bookingStatus === "payment_pending" ? (
        <div className="mb-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900">
          <p>Esperando confirmación de pago</p>
          {holdExpiresAt ? <p className="mt-1 text-xs font-medium">Reserva temporal hasta {formatDateTime(holdExpiresAt)}</p> : null}
        </div>
      ) : null}

      {expiredHold ? (
        <p className="mb-3 rounded-xl bg-neutral-100 p-3 text-sm font-bold text-neutral-800">
          Reserva vencida sin pago confirmado
        </p>
      ) : null}

      {attemptsUnavailable ? (
        <p className="text-sm text-red-700">No se pudo cargar el historial de intentos.</p>
      ) : latestAttempt ? (
        <>
          <dl className="space-y-1 text-sm text-neutral-700">
            <div><dt className="inline font-semibold">Último intento: </dt><dd className="inline">{paymentStatusLabels[latestAttempt.status]}</dd></div>
            {latestAttempt.method ? <div><dt className="inline font-semibold">Método: </dt><dd className="inline">{methodLabel(latestAttempt.method)}</dd></div> : null}
            <div><dt className="inline font-semibold">Monto del intento: </dt><dd className="inline">{formatAmount(latestAttempt)}</dd></div>
            {latestAttempt.provider ? <div><dt className="inline font-semibold">Proveedor: </dt><dd className="inline">{latestAttempt.provider}</dd></div> : null}
            {latestAttempt.paid_at ? <div><dt className="inline font-semibold">Fecha de pago: </dt><dd className="inline">{formatDateTime(latestAttempt.paid_at)}</dd></div> : null}
            {latestAttempt.provider_payment_id ? <div className="break-all"><dt className="inline font-semibold">ID proveedor: </dt><dd className="inline">{latestAttempt.provider_payment_id}</dd></div> : null}
          </dl>

          {lateAttempts.map((attempt) => (
            <div key={attempt.id} className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              <p className="font-black">Revisión requerida</p>
              <p className="mt-1">Pago recibido después del vencimiento de la reserva. Requiere revisión.</p>
              <dl className="mt-2 space-y-1 text-xs">
                <div className="break-all"><dt className="inline font-semibold">Booking ID: </dt><dd className="inline">{bookingId}</dd></div>
                <div className="break-all"><dt className="inline font-semibold">Payment attempt ID: </dt><dd className="inline">{attempt.id}</dd></div>
                <div><dt className="inline font-semibold">Monto: </dt><dd className="inline">{formatAmount(attempt)}</dd></div>
                <div><dt className="inline font-semibold">Proveedor: </dt><dd className="inline">{attempt.provider}</dd></div>
                {attempt.provider_payment_id ? <div className="break-all"><dt className="inline font-semibold">ID proveedor: </dt><dd className="inline">{attempt.provider_payment_id}</dd></div> : null}
                {attempt.paid_at ? <div><dt className="inline font-semibold">Fecha de pago: </dt><dd className="inline">{formatDateTime(attempt.paid_at)}</dd></div> : null}
              </dl>
            </div>
          ))}

          {attempts.length > 1 ? (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer font-bold text-neutral-700">Historial de intentos de pago ({attempts.length})</summary>
              <ol className="mt-2 space-y-2 border-l border-neutral-200 pl-4">
                {attempts.map((attempt) => (
                  <li key={attempt.id} className="text-xs text-neutral-600">
                    <p className="font-bold">{paymentStatusLabels[attempt.status]} · {formatAmount(attempt)}</p>
                    <p>{formatDateTime(attempt.created_at)}{methodLabel(attempt.method) ? ` · ${methodLabel(attempt.method)}` : ""}</p>
                    {attempt.provider_payment_id ? <p className="break-all">ID proveedor: {attempt.provider_payment_id}</p> : null}
                  </li>
                ))}
              </ol>
            </details>
          ) : null}
        </>
      ) : attemptsUnavailable ? null : (
        <p className="text-sm text-neutral-500">Sin intento de pago registrado. Puede tratarse de una reserva histórica.</p>
      )}

      {reviewsUnavailable ? <p className="mt-2 text-xs text-amber-800">No se pudo comprobar si hay eventos de pago tardío para revisión.</p> : null}
    </section>
  );
}
