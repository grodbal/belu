import { BookingHero, type BookingHeroData } from "../booking";
import { BeluerRail, type BeluerCardData } from "../beluers";
import { ServiceRail, type ServiceCardData } from "../services";
import { SectionHeader } from "./SectionHeader";
import { TrustStrip } from "./TrustStrip";
import styles from "./client.module.css";

type ClientHomeProps = {
  clientFirstName: string;
  bookings: BookingHeroData[];
  services: ServiceCardData[];
  beluers: BeluerCardData[];
  onBook: () => void;
  onExploreServices: () => void;
  onViewHistory: () => void;
  onViewBeluers: () => void;
};

export function ClientHome({
  clientFirstName,
  bookings,
  services,
  beluers,
  onBook,
  onExploreServices,
  onViewHistory,
  onViewBeluers,
}: ClientHomeProps) {
  return (
    <section className={styles.home} aria-label="Inicio de clienta">
      <p className={styles.mobileGreeting}>
        Hola, {clientFirstName} <span aria-hidden="true">✦</span>
      </p>

      <BookingHero
        bookings={bookings}
        onBook={onBook}
        onExploreServices={onExploreServices}
        onViewHistory={onViewHistory}
      />

      {services.length > 0 ? (
        <section className={styles.contentSection} aria-label="Explora servicios">
          <SectionHeader
            title="Explora servicios"
            actionLabel="Ver todo"
            onAction={onExploreServices}
          />
          <ServiceRail services={services} onSelect={onExploreServices} />
        </section>
      ) : null}

      {beluers.length > 0 ? (
        <section className={styles.contentSection} aria-label="Beluers para ti">
          <SectionHeader
            title="Beluers para ti"
            actionLabel="Ver todas"
            onAction={onViewBeluers}
          />
          <BeluerRail beluers={beluers} onSelect={onViewBeluers} />
        </section>
      ) : null}

      <TrustStrip />
    </section>
  );
}
