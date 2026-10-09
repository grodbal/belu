import { PrimaryButton, StatusBadge } from "@/components/belu";
import type { ReservaBeluer } from "@/components/beluer-panel-original/beluerPanelTypes";
import { getStatus } from "./BeluerBookings";
import styles from "./bookings.module.css";

type Props = { reserva: ReservaBeluer; onClose: () => void; onAceptar: (id: string) => void; onRechazar: (id: string) => void };

export function BookingDetail({ reserva, onClose, onAceptar, onRechazar }: Props) {
  const payout = reserva.totalBeluer ?? reserva.total;
  const rows = [
    ["Servicio", reserva.servicio], ["Clienta", reserva.clienta], ["Fecha", reserva.fecha], ["Hora", reserva.hora],
    ["Dirección", reserva.direccion], ["Distrito", reserva.distrito], ["Notas", reserva.instrucciones],
    ["Modalidad", reserva.bookingMode === "managed" ? "Gestionada por belu" : "Libre"],
  ].filter((row) => row[1]);

  return (
    <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="booking-detail-title">
        <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar detalle">×</button>
        <div className={styles.badges}><StatusBadge {...getStatus(reserva.status)} />{(reserva.expressFee ?? 0) > 0 && <StatusBadge label="Express" tone="accent" />}</div>
        <h2 id="booking-detail-title">Detalle de la reserva</h2>
        <dl className={styles.detailGrid}>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <section className={styles.payment} aria-label="Pago de la clienta"><h3>Pago de la clienta</h3><p>{paymentLabel(reserva.paymentStatus)}</p>{reserva.metodoPago && <small>{reserva.metodoPago}</small>}</section>
        <section className={styles.payoutDetail} aria-labelledby="booking-finance-title">
          <h3 id="booking-finance-title">Resumen financiero</h3>
          <div className={styles.financeSummary}>
            <div className={styles.financeRow}><span>Total para la clienta</span><strong>{formatAmount(reserva.publicPrice)}</strong></div>
          </div>
          {(reserva.basePrice != null || reserva.logisticFee != null || (reserva.expressFee ?? 0) > 0) && <h4 className={styles.breakdownTitle}>Desglose</h4>}
          <dl className={styles.breakdown}>{[
            ["Servicio", reserva.basePrice], ["Movilidad / logística", reserva.logisticFee], ["Express", (reserva.expressFee ?? 0) > 0 ? reserva.expressFee : null],
          ].filter((row) => row[1] != null).map(([label, value]) => <div key={label as string}><dt>{label}</dt><dd>S/ {(value as number).toFixed(2)}</dd></div>)}</dl>
          <div className={`${styles.financeRow} ${styles.commissionRow}`}><span>Comisión plataforma{formatCommissionRate(reserva.comisionAplicada)}</span><strong>{formatDeduction(reserva.comisionBelu)}</strong></div>
          <div className={`${styles.financeRow} ${styles.payoutTotal}`}><span>Tú recibes</span><strong>{formatAmount(payout)}</strong></div>
          {(reserva.nivelAplicado || reserva.commissionLockedAt) && <p className={styles.snapshot}>{reserva.nivelAplicado && `Nivel: ${reserva.nivelAplicado}`}{reserva.commissionLockedAt && " · Comisión congelada"}</p>}
        </section>
        {reserva.status === "assigned" && <div className={styles.detailActions}><button type="button" className={styles.reject} onClick={() => onRechazar(reserva.id)}>Rechazar</button><PrimaryButton onClick={() => onAceptar(reserva.id)}>Aceptar solicitud</PrimaryButton></div>}
        {reserva.status !== "assigned" && <div className={styles.detailActions}><button type="button" className={styles.viewDetail} onClick={onClose}>Cerrar</button></div>}
      </section>
    </div>
  );
}

function formatAmount(value: number | null | undefined) {
  return value == null ? "Por calcular" : `S/ ${value.toFixed(2)}`;
}

function formatDeduction(value: number | null | undefined) {
  if (value == null) return "Por calcular";

  return `${value > 0 ? "-" : ""}S/ ${value.toFixed(2)}`;
}

function formatCommissionRate(value: number | null | undefined) {
  if (value == null) return "";

  const percentage = value > 1 ? value : value * 100;
  return ` (${percentage.toFixed(2).replace(/\.00$/, "")}%)`;
}

function paymentLabel(status: ReservaBeluer["paymentStatus"]) {
  const labels = { pending: "Pendiente", paid: "Pagado", failed: "Fallido", refunded: "Reembolsado" };
  return labels[status];
}
