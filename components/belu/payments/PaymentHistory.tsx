import { BeluIcon } from "../foundations/BeluIcon";
import {
  StatusBadge,
  type StatusBadgeData,
} from "../feedback/StatusBadge";
import styles from "./payments.module.css";

export type PaymentHistoryItemData = {
  id: string;
  service: string;
  beluer: string;
  date: string;
  time: string;
  amount: string;
  status: StatusBadgeData;
  isExpress: boolean;
};

export type PaymentSummaryData = {
  total: string;
  bookingCount: number;
  latestStatus: StatusBadgeData | null;
};

type PaymentHistoryProps = {
  summary: PaymentSummaryData;
  items: PaymentHistoryItemData[];
};

export function PaymentHistory({ summary, items }: PaymentHistoryProps) {
  return (
    <section className={styles.page} aria-labelledby="payment-history-title">
      <header className={styles.intro}>
        <p>Tus movimientos</p>
        <h1 id="payment-history-title">Historial de pagos</h1>
        <span>
          Consulta los montos y estados registrados para cada una de tus
          reservas.
        </span>
      </header>

      <dl className={styles.summary}>
        <div className={styles.summaryPrimary}>
          <dt>Total registrado</dt>
          <dd>{summary.total}</dd>
        </div>
        <div>
          <dt>Reservas</dt>
          <dd>{summary.bookingCount}</dd>
        </div>
        <div>
          <dt>Último estado</dt>
          <dd>
            {summary.latestStatus ? (
              <StatusBadge {...summary.latestStatus} />
            ) : (
              "Sin pagos"
            )}
          </dd>
        </div>
      </dl>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <span aria-hidden="true">✦</span>
          <strong>Aún no tienes movimientos registrados</strong>
          <p>
            Los pagos asociados a tus próximas reservas aparecerán en esta
            sección.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          <div className={styles.listHeader} aria-hidden="true">
            <span>Reserva</span>
            <span>Fecha</span>
            <span>Estado</span>
            <span>Monto</span>
          </div>
          {items.map((item) => (
            <article className={styles.item} key={item.id}>
              <div className={styles.service}>
                <div className={styles.serviceMark} aria-hidden="true">
                  <BeluIcon name="card" size={18} aria-hidden="true" />
                </div>
                <div>
                  <div className={styles.serviceTitle}>
                    <h2>{item.service}</h2>
                    {item.isExpress ? <span>Express</span> : null}
                  </div>
                  <p>{item.beluer}</p>
                </div>
              </div>
              <div className={styles.date}>
                <span>{item.date}</span>
                <small>{item.time}</small>
              </div>
              <div className={styles.status}>
                <StatusBadge {...item.status} />
              </div>
              <strong className={styles.amount}>{item.amount}</strong>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
