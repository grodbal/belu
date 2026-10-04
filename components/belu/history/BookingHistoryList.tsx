import { BeluIcon } from "../foundations/BeluIcon";
import { PageHeader } from "../client/PageHeader";
import { EmptyState } from "../feedback/EmptyState";
import {
  StatusBadge,
  type StatusBadgeData,
} from "../feedback/StatusBadge";
import { PrimaryButton } from "../ui/Button";
import styles from "./history.module.css";

export type BookingHistoryItemData = {
  id: string;
  service: string;
  beluer: string;
  date: string;
  time: string;
  location: string;
  amount: string;
  status: StatusBadgeData;
  paymentStatus: StatusBadgeData;
  isExpress: boolean;
};

export type BookingHistoryDetailData = BookingHistoryItemData & {
  district: string;
  address: string;
  breakdown: Array<{
    label: string;
    value: string;
    isTotal?: boolean;
  }>;
};

type BookingHistoryListProps = {
  items: BookingHistoryItemData[];
  selectedItem: BookingHistoryDetailData | null;
  onBook: () => void;
  onViewDetails: (bookingId: string) => void;
  onCloseDetails: () => void;
};

export function BookingHistoryList({
  items,
  selectedItem,
  onBook,
  onViewDetails,
  onCloseDetails,
}: BookingHistoryListProps) {
  return (
    <section className={styles.page} aria-labelledby="booking-history-title">
      <PageHeader
        eyebrow="Tus reservas"
        title="Tu historial"
        description="Revisa tus servicios, especialistas y estados en un solo lugar."
        titleId="booking-history-title"
      />

      {items.length > 0 ? (
        <div className={styles.toolbar}>
          <p>
            <strong>{items.length}</strong>{" "}
            {items.length === 1
              ? "reserva registrada"
              : "reservas registradas"}
          </p>
          <PrimaryButton className={styles.toolbarAction} onClick={onBook}>
            Nueva reserva
            <BeluIcon name="arrow" size={16} aria-hidden="true" />
          </PrimaryButton>
        </div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          className={styles.pageEmpty}
          title="Tu historia con belu empieza aquí"
          description="Cuando reserves un servicio, podrás consultar sus detalles aquí."
          actionLabel="Reservar ahora"
          onAction={onBook}
        />
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <article className={styles.item} key={item.id}>
              <div className={styles.dateBlock}>
                <BeluIcon name="calendar" size={18} aria-hidden="true" />
                <span>{item.date}</span>
                <small>{item.time}</small>
              </div>

              <div className={styles.main}>
                <div className={styles.badges}>
                  <StatusBadge {...item.status} />
                  {item.isExpress ? (
                    <StatusBadge label="Belu Express" tone="accent" />
                  ) : null}
                </div>
                <h2>{item.service}</h2>
                <dl className={styles.metadata}>
                  <div>
                    <dt>
                      <BeluIcon name="user" size={15} aria-hidden="true" />
                      Beluer
                    </dt>
                    <dd>{item.beluer}</dd>
                  </div>
                  <div>
                    <dt>
                      <BeluIcon name="pin" size={15} aria-hidden="true" />
                      Ubicación
                    </dt>
                    <dd>{item.location}</dd>
                  </div>
                </dl>
                <div className={styles.paymentState}>
                  <StatusBadge {...item.paymentStatus} />
                </div>
              </div>

              <div className={styles.aside}>
                <span>Total</span>
                <strong>{item.amount}</strong>
                <button
                  type="button"
                  onClick={() => onViewDetails(item.id)}
                  aria-label={`Ver detalle de ${item.service}`}
                >
                  Ver detalle
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedItem ? (
        <div className={styles.modalOverlay}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-detail-title"
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={onCloseDetails}
              aria-label="Cerrar detalle de reserva"
            >
              ×
            </button>
            <p className={styles.modalEyebrow}>Detalle de reserva</p>
            <h2 id="booking-detail-title">{selectedItem.service}</h2>
            <div className={styles.modalBadges}>
              <StatusBadge {...selectedItem.status} />
              <StatusBadge {...selectedItem.paymentStatus} />
            </div>

            <dl className={styles.detailFacts}>
              <div>
                <dt>Beluer</dt>
                <dd>{selectedItem.beluer}</dd>
              </div>
              <div>
                <dt>Fecha y hora</dt>
                <dd>
                  {selectedItem.date} · {selectedItem.time}
                </dd>
              </div>
              <div>
                <dt>Distrito</dt>
                <dd>{selectedItem.district}</dd>
              </div>
              <div>
                <dt>Dirección</dt>
                <dd>{selectedItem.address}</dd>
              </div>
            </dl>

            <dl className={styles.breakdown}>
              {selectedItem.breakdown.map((line) => (
                <div
                  className={line.isTotal ? styles.breakdownTotal : undefined}
                  key={line.label}
                >
                  <dt>{line.label}</dt>
                  <dd>{line.value}</dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              className={styles.modalAction}
              onClick={onCloseDetails}
            >
              Cerrar
            </button>
          </section>
        </div>
      ) : null}
    </section>
  );
}
