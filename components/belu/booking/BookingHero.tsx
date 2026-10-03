import Image from "next/image";
import { BeluIcon } from "../foundations/BeluIcon";
import styles from "./booking.module.css";

export type BookingHeroData = {
  service: string;
  status: string;
  date?: string;
  time?: string;
  district?: string;
  beluer?: string;
  total?: string;
};

type BookingHeroProps = {
  booking: BookingHeroData | null;
  onBook: () => void;
  onExploreServices: () => void;
  onViewHistory: () => void;
};

export function BookingHero({
  booking,
  onBook,
  onExploreServices,
  onViewHistory,
}: BookingHeroProps) {
  const facts = booking
    ? [
        { label: "Fecha", value: booking.date },
        { label: "Hora", value: booking.time },
        { label: "Ubicación", value: booking.district },
        { label: "Beluer", value: booking.beluer },
        { label: "Total", value: booking.total },
      ].filter((fact): fact is { label: string; value: string } =>
        Boolean(fact.value)
      )
    : [];

  return (
    <section className={styles.hero} aria-labelledby="client-home-hero-title">
      <Image
        className={styles.heroImage}
        src="/prototipo/cliente-home-v2/hero-at-home.png"
        alt="Especialista belu realizando un servicio de belleza a domicilio"
        fill
        sizes="(max-width: 767px) 100vw, (max-width: 1180px) 75vw, 1050px"
      />
      <div className={styles.heroShade} aria-hidden="true" />

      <div className={styles.heroContent}>
        <p className={styles.kicker}>
          <span aria-hidden="true">✦</span>
          {booking ? `Próxima cita · ${booking.status}` : "Tu momento, en casa"}
        </p>

        <h1 id="client-home-hero-title">
          {booking ? booking.service : "Aún no tienes una cita activa"}
        </h1>

        {booking ? (
          facts.length > 0 ? (
            <dl className={styles.facts}>
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null
        ) : (
          <p className={styles.body}>
            Elige tu servicio y recibe belleza experta sin salir de casa.
          </p>
        )}

        <div className={styles.actions}>
          <button
            className={styles.primaryAction}
            type="button"
            onClick={booking ? onViewHistory : onBook}
          >
            {booking ? "Ver detalle" : "Reservar ahora"}
            <BeluIcon name="arrow" size={17} aria-hidden="true" />
          </button>
          <button
            className={styles.secondaryAction}
            type="button"
            onClick={booking ? onBook : onExploreServices}
          >
            {booking ? "Nueva reserva" : "Explorar servicios"}
          </button>
        </div>
      </div>
    </section>
  );
}
