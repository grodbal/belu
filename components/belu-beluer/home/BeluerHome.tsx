"use client";

import { EmptyState } from "@/components/belu/feedback/EmptyState";
import { StatusBadge } from "@/components/belu/feedback/StatusBadge";
import { PageHeader } from "@/components/belu/client/PageHeader";
import { BeluIcon } from "@/components/belu/foundations/BeluIcon";
import { PrimaryButton } from "@/components/belu/ui/Button";
import type {
  BeluerPanelProfile,
  BeluerPanelReadState,
  BeluerSection,
  ReservaBeluer,
} from "@/components/beluer-panel-original/beluerPanelTypes";
import styles from "./home.module.css";

type BeluerHomeProps = {
  profile: BeluerPanelProfile;
  readState: BeluerPanelReadState;
  pendingRequests: ReservaBeluer[];
  monthlyProgress: number | null;
  onNavigate: (section: BeluerSection) => void;
};

function formatDate(date: string) {
  const limaDate = new Date(`${date}T12:00:00-05:00`);
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Lima",
  }).format(limaDate);
}

function formatMoney(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

function payoutLabel(value: number, missingCount: number) {
  if (!missingCount) return formatMoney(value);
  if (value === 0) return "Por calcular";

  return `${formatMoney(value)} + ${missingCount} por calcular`;
}

export function BeluerHome({
  profile,
  readState,
  pendingRequests,
  monthlyProgress,
  onNavigate,
}: BeluerHomeProps) {
  const nextBooking = profile.nextConfirmedBooking;
  const hasAssignedRequests = profile.assignedRequestsCount > 0;

  return (
    <div className={styles.home}>
      <PageHeader
        eyebrow="Tu jornada belu"
        title={`Hola, ${profile.firstName}`}
        description="Tu espacio para organizar las citas y el trabajo de hoy."
        titleId="beluer-home-title"
        accent
        className={styles.pageHeader}
      />

      <div className={styles.identityLine}>
        <StatusBadge
          label={profile.levelLabel}
          tone={profile.levelLabel.includes("Top") ? "accent" : "neutral"}
        />
        <StatusBadge
          label={profile.statusLabel}
          tone={profile.statusLabel === "Activo" ? "success" : "warning"}
        />
      </div>

      <section className={styles.homeGrid} aria-labelledby="beluer-home-title">
        <article className={styles.nextBooking}>
          <div className={styles.cardTopline}>
            <span className={styles.eyebrow}>Tu próxima cita</span>
            {nextBooking ? (
              <StatusBadge
                label={nextBooking.status === "in_progress" ? "En curso" : "Confirmada"}
                tone={nextBooking.status === "in_progress" ? "info" : "success"}
              />
            ) : null}
          </div>

          {readState.bookings === "unavailable" ? (
            <EmptyState
              title="No pudimos cargar tu agenda"
              description="Inténtalo nuevamente más tarde."
              actionLabel="Ir a Reservas"
              onAction={() => onNavigate("reservas")}
              className={styles.compactEmpty}
            />
          ) : nextBooking ? (
            <>
              <p className={styles.bookingDate}>{formatDate(nextBooking.fecha)}</p>
              <h2>{nextBooking.servicio}</h2>
              <div className={styles.bookingDetails}>
                <span><BeluIcon name="clock" size={17} /> {nextBooking.hora}</span>
                <span><BeluIcon name="pin" size={17} /> {nextBooking.distrito}</span>
                {readState.clients === "ready" ? (
                  <span><BeluIcon name="user" size={17} /> {nextBooking.clienta}</span>
                ) : null}
              </div>
              <PrimaryButton onClick={() => onNavigate("reservas")}>
                Ver mis reservas <BeluIcon name="arrow" size={17} />
              </PrimaryButton>
            </>
          ) : (
            <EmptyState
              title="No tienes una cita confirmada próxima."
              description="Cuando una reserva quede confirmada, la verás aquí con los datos para prepararte."
              actionLabel="Ver Reservas"
              onAction={() => onNavigate("reservas")}
              className={styles.compactEmpty}
            />
          )}
          <span className={styles.heroMark} aria-hidden="true">✦</span>
        </article>

        <article className={`${styles.requestsCard} ${hasAssignedRequests ? styles.requestsCardActive : ""}`}>
          <div className={styles.cardTopline}>
            <span className={styles.eyebrow}>Solicitudes</span>
            {readState.bookings === "ready" ? (
              <span className={`${styles.requestCount} ${hasAssignedRequests ? styles.requestCountActive : ""}`}>{profile.assignedRequestsCount}</span>
            ) : null}
          </div>
          {readState.bookings === "unavailable" ? (
            <p className={styles.muted}>No fue posible consultar tus solicitudes.</p>
          ) : profile.assignedRequestsCount > 0 ? (
            <>
              <h2>{profile.assignedRequestsCount === 1 ? "Nueva solicitud por responder" : `Tienes ${profile.assignedRequestsCount} solicitudes por responder`}</h2>
              <ul className={styles.requestList}>
                {pendingRequests.slice(0, 2).map((booking) => (
                  <li key={booking.id}>
                    <span>{booking.servicio}</span>
                    <small>{booking.fecha} · {booking.distrito}</small>
                  </li>
                ))}
                {profile.assignedRequestsCount > pendingRequests.length ? (
                  <li className={styles.moreRequests}>
                    +{profile.assignedRequestsCount - pendingRequests.length} más
                  </li>
                ) : null}
              </ul>
              <button className={styles.requestAction} onClick={() => onNavigate("reservas")} type="button">
                Revisar solicitud <BeluIcon name="arrow" size={16} />
              </button>
            </>
          ) : (
            <>
              <h2>Sin solicitudes nuevas</h2>
              <p className={styles.muted}>Aquí aparecerán las reservas que te asigne belu.</p>
              <button className={styles.textAction} onClick={() => onNavigate("reservas")} type="button">
                Abrir Reservas <BeluIcon name="arrow" size={16} />
              </button>
            </>
          )}
        </article>

        <article className={styles.earningsCard}>
          <div className={styles.cardTopline}>
            <span className={styles.eyebrow}>Este mes</span>
            <BeluIcon name="card" size={20} />
          </div>
          <h2>Ingreso realizado</h2>
          <strong className={styles.amount}>
            {readState.bookings === "ready"
              ? payoutLabel(
                  profile.monthlyRealizedIncome,
                  profile.monthlyUncalculatedCompletedCount
                )
              : "No disponible"}
          </strong>
          {readState.bookings === "unavailable" ? (
            <p className={styles.note}>No fue posible calcular el ingreso este mes.</p>
          ) : profile.monthlyUncalculatedCompletedCount > 0 ? (
            <p className={styles.note}>
              {profile.monthlyUncalculatedCompletedCount === 1
                ? "Un servicio completado está por calcular."
                : `${profile.monthlyUncalculatedCompletedCount} servicios completados están por calcular.`}
            </p>
          ) : (
            <p className={styles.muted}>Considera servicios completados con payout disponible.</p>
          )}
          {profile.monthlyIncomeGoal > 0 && monthlyProgress != null ? (
            <div className={styles.goal}>
              <div className={styles.goalLabels}>
                <span>Meta mensual</span>
                <span>{formatMoney(profile.monthlyIncomeGoal)}</span>
              </div>
              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-label="Avance de la meta mensual"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(monthlyProgress)}
              >
                <span style={{ width: `${monthlyProgress}%` }} />
              </div>
              <small>{Math.round(monthlyProgress)}% de tu meta</small>
            </div>
          ) : profile.monthlyIncomeGoal <= 0 ? (
            <p className={styles.note}>Aún no hay una meta mensual configurada.</p>
          ) : readState.bookings === "unavailable" ? (
            <p className={styles.note}>No fue posible calcular el avance de tu meta.</p>
          ) : (
            <p className={styles.note}>El avance estará disponible cuando se calculen los servicios completados.</p>
          )}
          <button className={styles.textAction} onClick={() => onNavigate("ingresos")} type="button">
            Ver ingresos <BeluIcon name="arrow" size={16} />
          </button>
        </article>

        <article className={styles.availabilityCard}>
          <div className={styles.cardTopline}>
            <span className={styles.eyebrow}>Disponibilidad</span>
            <span className={profile.isAvailable ? styles.availabilityDot : styles.availabilityDotOff} />
          </div>
          <h2>{profile.isAvailable ? "Disponible" : "No disponible"}</h2>
          <p className={styles.muted}>Este estado es informativo y lo gestiona Admin.</p>
        </article>

        <article className={styles.levelCard}>
          <div className={styles.cardTopline}>
            <span className={styles.eyebrow}>Tu perfil belu</span>
            <BeluIcon name="star" size={20} />
          </div>
          <h2>{profile.levelLabel}</h2>
          <p className={styles.rating}>
            <BeluIcon name="star" size={17} />
            {profile.rating == null ? "Sin calificación" : profile.rating.toFixed(1)}
          </p>
          <p className={styles.muted}>Tu nivel y calificación se muestran según tus datos reales.</p>
        </article>

        <article className={styles.coverageCard}>
          <div className={styles.cardTopline}>
            <span className={styles.eyebrow}>Cobertura</span>
            <span className={styles.zoneCount}>{profile.districtsCount} zonas</span>
          </div>
          <h2>Tus zonas de atención</h2>
          <div className={styles.districts}>
            {profile.districts.slice(0, 3).map((district) => (
              <span key={district}>{district}</span>
            ))}
            {profile.districtsCount > 3 ? (
              <span className={styles.moreDistricts}>+{profile.districtsCount - 3}</span>
            ) : null}
            {profile.districtsCount === 0 ? <span>Sin zonas configuradas</span> : null}
          </div>
          <button className={styles.textAction} onClick={() => onNavigate("perfil")} type="button">
            Editar cobertura <BeluIcon name="arrow" size={16} />
          </button>
        </article>
      </section>

      <nav className={styles.quickLinks} aria-label="Accesos rápidos">
        <button type="button" onClick={() => onNavigate("reservas")}>
          <BeluIcon name="calendar" size={18} /> Reservas
        </button>
        <button type="button" onClick={() => onNavigate("ingresos")}>
          <BeluIcon name="card" size={18} /> Ingresos
        </button>
        <button type="button" onClick={() => onNavigate("perfil")}>
          <BeluIcon name="user" size={18} /> Mi perfil
        </button>
      </nav>
    </div>
  );
}
