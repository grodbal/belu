import { BeluIcon } from "../foundations/BeluIcon";
import { PageHeader } from "../client/PageHeader";
import { EmptyState } from "../feedback/EmptyState";
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
      <PageHeader
        eyebrow="Tus movimientos"
        title="Historial de pagos"
        description="Consulta los montos y estados registrados para cada una de tus reservas."
        titleId="payment-history-title"
      />

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
        <EmptyState
          className={styles.pageEmpty}
          title="Aún no tienes movimientos registrados"
          description="Los pagos asociados a tus próximas reservas aparecerán en esta sección."
        />
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
                    {item.isExpress ? (
                      <StatusBadge label="Express" tone="accent" />
                    ) : null}
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
