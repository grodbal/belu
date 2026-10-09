import { EmptyState, FilterChips, PrimaryButton, StatusBadge } from "@/components/belu";
import type { ReservaBeluer } from "@/components/beluer-panel-original/beluerPanelTypes";
import { isBookingInFuture } from "./bookingTime";
import styles from "./bookings.module.css";

export type BeluerBookingFilter = "all" | "requests" | "upcoming" | "inProgress" | "completed" | "history";

const filterItems: { id: BeluerBookingFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "requests", label: "Solicitudes" },
  { id: "upcoming", label: "Próximas" },
  { id: "inProgress", label: "En curso" },
  { id: "completed", label: "Completadas" },
  { id: "history", label: "Historial" },
];

type Props = {
  reservas: ReservaBeluer[];
  dataAvailable: boolean;
  activeFilter: BeluerBookingFilter;
  counts: Record<BeluerBookingFilter, number>;
  upcomingAt: number;
  onFilterChange: (filter: BeluerBookingFilter) => void;
  onVerDetalle: (reserva: ReservaBeluer) => void;
  onAceptar: (id: string) => void;
  onRechazar: (id: string) => void;
};

export function BeluerBookings({ reservas, dataAvailable, activeFilter, counts, upcomingAt, onFilterChange, onVerDetalle, onAceptar, onRechazar }: Props) {
  const visible = reservas.filter((reserva) => {
    switch (activeFilter) {
      case "requests": return reserva.status === "assigned";
      case "upcoming": return reserva.status === "confirmed" && isBookingInFuture(reserva.fecha, reserva.hora, upcomingAt);
      case "inProgress": return reserva.status === "in_progress";
      case "completed": return reserva.status === "completed";
      case "history": return ["cancelled", "redo_requested", "redo_approved"].includes(reserva.status);
      default: return true;
    }
  });

  const emptyCopy: Record<BeluerBookingFilter, { title: string; description: string }> = {
    all: { title: "Aún no tienes reservas", description: "Aquí aparecerán tus solicitudes y citas." },
    requests: { title: "No tienes solicitudes pendientes.", description: "Cuando belu te asigne una reserva, aparecerá aquí." },
    upcoming: { title: "No tienes próximas citas por ahora.", description: "Tus citas confirmadas aparecerán aquí." },
    inProgress: { title: "No tienes servicios en curso.", description: "" },
    completed: { title: "Aún no tienes servicios completados.", description: "" },
    history: { title: "Tu historial está vacío.", description: "Las cancelaciones y retoques aparecerán aquí." },
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><span className={styles.kicker}>Panel Beluer</span><h1>Reservas</h1><p>Organiza tus solicitudes y citas en un solo lugar.</p></div>
        <div className={styles.total}><span>Reservas</span><strong>{dataAvailable ? reservas.length : "—"}</strong></div>
      </header>

      <FilterChips
        ariaLabel="Filtrar reservas"
        items={filterItems.map((item) => ({ ...item, label: `${item.label} (${counts[item.id]})` }))}
        activeId={activeFilter}
        onChange={onFilterChange}
        className={styles.filters}
      />

      {!dataAvailable ? (
        <EmptyState title="No pudimos cargar tus reservas" description="Inténtalo de nuevo más tarde." className={styles.empty} />
      ) : visible.length === 0 ? (
        <EmptyState {...emptyCopy[activeFilter]} actionLabel={activeFilter === "all" ? undefined : "Ver todas"} onAction={activeFilter === "all" ? undefined : () => onFilterChange("all")} className={styles.empty} />
      ) : (
        <div className={styles.list}>
          {visible.map((reserva) => <BookingCard key={reserva.id} reserva={reserva} onVerDetalle={onVerDetalle} onAceptar={onAceptar} onRechazar={onRechazar} />)}
        </div>
      )}
    </main>
  );
}

function BookingCard({ reserva, onVerDetalle, onAceptar, onRechazar }: Pick<Props, "onVerDetalle" | "onAceptar" | "onRechazar"> & { reserva: ReservaBeluer }) {
  const status = getStatus(reserva.status);
  const payout = reserva.totalBeluer ?? reserva.total;
  const express = (reserva.expressFee ?? 0) > 0;
  const isAssigned = reserva.status === "assigned";

  return (
    <article className={`${styles.card} ${isAssigned ? styles.request : ""} ${reserva.status === "completed" ? styles.completed : ""}`}>
      <div className={styles.cardTop}>
        <div className={styles.badges}><StatusBadge label={status.label} tone={status.tone} />{express && <StatusBadge label="Express" tone="accent" />}</div>
        <span className={styles.payout}><small>Tú recibes</small><strong>{payout == null ? "Por calcular" : `S/ ${payout.toFixed(2)}`}</strong></span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.mainInfo}><h2>{reserva.servicio || "Servicio"}</h2><p>{reserva.clienta || "Clienta"}</p></div>
        <dl className={styles.meta}><div><dt>Fecha y hora</dt><dd>{reserva.fecha} · {reserva.hora}</dd></div><div><dt>Distrito</dt><dd>{reserva.distrito || "No indicado"}</dd></div></dl>
      </div>
      {isAssigned && <p className={styles.reassign}>Si no puedes tomarla, belu la devolverá para reasignarla.</p>}
      <div className={styles.actions}>
        <button type="button" className={styles.viewDetail} onClick={() => onVerDetalle(reserva)}>Ver detalle</button>
        {isAssigned && <><button type="button" className={styles.reject} onClick={() => onRechazar(reserva.id)}>Rechazar</button><PrimaryButton onClick={() => onAceptar(reserva.id)}>Aceptar</PrimaryButton></>}
      </div>
    </article>
  );
}

export function getStatus(status: ReservaBeluer["status"]) {
  const labels = {
    pending: { label: "Pendiente de asignación", tone: "neutral" },
    assigned: { label: "Solicitud", tone: "warning" },
    confirmed: { label: "Cita confirmada", tone: "info" },
    in_progress: { label: "En curso", tone: "accent" },
    completed: { label: "Completada", tone: "success" },
    cancelled: { label: "Cancelada", tone: "neutral" },
    redo_requested: { label: "Retoque solicitado", tone: "warning" },
    redo_approved: { label: "Retoque aprobado", tone: "info" },
  } as const;
  return labels[status];
}
