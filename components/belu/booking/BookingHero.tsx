"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { BeluIcon } from "../foundations/BeluIcon";
import { PrimaryButton, SecondaryButton } from "../ui/Button";
import styles from "./booking.module.css";

export type BookingHeroData = {
  id: string;
  service: string;
  status: string;
  date?: string;
  time?: string;
  district?: string;
  beluer?: string;
  total?: string;
};

type BookingHeroProps = {
  bookings: BookingHeroData[];
  onBook: () => void;
  onExploreServices: () => void;
  onViewHistory: () => void;
};

type BookingSlideProps = Omit<BookingHeroProps, "bookings"> & {
  booking: BookingHeroData | null;
  headingId: string;
  isActive?: boolean;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);

  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function subscribeToDocumentVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function getDocumentVisibilitySnapshot() {
  return document.visibilityState === "visible";
}

function getServerReducedMotionSnapshot() {
  return false;
}

function getServerDocumentVisibilitySnapshot() {
  return true;
}

function BookingSlide({
  booking,
  headingId,
  isActive = true,
  onBook,
  onExploreServices,
  onViewHistory,
}: BookingSlideProps) {
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
    <section className={styles.hero} aria-labelledby={headingId}>
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

        <h1 id={headingId}>
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
          <PrimaryButton
            className={styles.heroButton}
            onClick={booking ? onViewHistory : onBook}
            tabIndex={isActive ? undefined : -1}
          >
            {booking ? "Ver detalle" : "Reservar ahora"}
            <BeluIcon name="arrow" size={17} aria-hidden="true" />
          </PrimaryButton>
          <SecondaryButton
            className={styles.heroButton}
            onClick={booking ? onBook : onExploreServices}
            tabIndex={isActive ? undefined : -1}
          >
            {booking ? "Nueva reserva" : "Explorar servicios"}
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}

export function BookingHero({
  bookings,
  onBook,
  onExploreServices,
  onViewHistory,
}: BookingHeroProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplayRevision, setAutoplayRevision] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const [isPointerInteracting, setIsPointerInteracting] = useState(false);
  const isDocumentVisible = useSyncExternalStore(
    subscribeToDocumentVisibility,
    getDocumentVisibilitySnapshot,
    getServerDocumentVisibilitySnapshot
  );
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot
  );
  const lastIndex = Math.max(bookings.length - 1, 0);
  const visibleIndex = Math.min(activeIndex, lastIndex);

  const restartAutoplay = useCallback(() => {
    setAutoplayRevision((revision) => revision + 1);
  }, []);

  const showBooking = useCallback(
    (index: number) => {
      const nextIndex = Math.min(Math.max(index, 0), lastIndex);
      const viewport = viewportRef.current;

      viewport?.scrollTo({
        left: viewport.clientWidth * nextIndex,
      });
    },
    [lastIndex]
  );

  const showBookingManually = (index: number) => {
    restartAutoplay();
    showBooking(index);
  };

  useEffect(() => {
    if (
      bookings.length <= 1 ||
      isHovered ||
      hasFocusWithin ||
      isPointerInteracting ||
      !isDocumentVisible ||
      prefersReducedMotion
    ) {
      return;
    }

    const autoplayTimeout = window.setTimeout(() => {
      showBooking((visibleIndex + 1) % bookings.length);
    }, 4000);

    return () => {
      window.clearTimeout(autoplayTimeout);
    };
  }, [
    autoplayRevision,
    bookings.length,
    hasFocusWithin,
    isDocumentVisible,
    isHovered,
    isPointerInteracting,
    prefersReducedMotion,
    showBooking,
    visibleIndex,
  ]);

  if (bookings.length <= 1) {
    return (
      <BookingSlide
        booking={bookings[0] || null}
        headingId="client-home-hero-title"
        onBook={onBook}
        onExploreServices={onExploreServices}
        onViewHistory={onViewHistory}
      />
    );
  }

  return (
    <section
      className={styles.carousel}
      aria-label="Próximas citas"
      aria-roledescription="carrusel"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setIsHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setIsHovered(false);
      }}
      onFocusCapture={() => setHasFocusWithin(true)}
      onBlurCapture={(event) => {
        if (
          !event.currentTarget.contains(event.relatedTarget as Node | null)
        ) {
          setHasFocusWithin(false);
        }
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") setIsPointerInteracting(true);
        restartAutoplay();
      }}
      onPointerUp={() => setIsPointerInteracting(false)}
      onPointerCancel={() => setIsPointerInteracting(false)}
      onWheel={restartAutoplay}
    >
      <div
        ref={viewportRef}
        className={styles.carouselViewport}
        onScroll={(event) => {
          const viewport = event.currentTarget;
          const index = Math.round(viewport.scrollLeft / viewport.clientWidth);

          setActiveIndex(Math.min(index, lastIndex));
        }}
      >
        <div className={styles.carouselTrack}>
          {bookings.map((booking, index) => (
            <div
              key={booking.id}
              className={styles.carouselSlide}
              role="group"
              aria-label={`${index + 1} de ${bookings.length}`}
              aria-roledescription="diapositiva"
              aria-hidden={index !== visibleIndex}
            >
              <BookingSlide
                booking={booking}
                headingId={`client-home-booking-${index}`}
                isActive={index === visibleIndex}
                onBook={onBook}
                onExploreServices={onExploreServices}
                onViewHistory={onViewHistory}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.carouselNavigation}>
        <span className={styles.carouselCount} aria-live="polite">
          {visibleIndex + 1} de {bookings.length}
        </span>
        <button
          className={`${styles.carouselArrow} ${styles.carouselArrowPrevious}`}
          type="button"
          aria-label="Ver cita anterior"
          disabled={visibleIndex === 0}
          onClick={() => showBookingManually(visibleIndex - 1)}
        >
          <BeluIcon name="arrow" size={18} aria-hidden="true" />
        </button>
        <button
          className={styles.carouselArrow}
          type="button"
          aria-label="Ver cita siguiente"
          disabled={visibleIndex === lastIndex}
          onClick={() => showBookingManually(visibleIndex + 1)}
        >
          <BeluIcon name="arrow" size={18} aria-hidden="true" />
        </button>
      </div>

      <div
        className={styles.carouselDots}
        role="group"
        aria-label="Elegir próxima cita"
      >
        {bookings.map((booking, index) => (
          <button
            key={booking.id}
            className={styles.carouselDot}
            type="button"
            aria-label={`Ver cita ${index + 1} de ${bookings.length}`}
            aria-current={index === visibleIndex ? "true" : undefined}
            onClick={() => showBookingManually(index)}
          />
        ))}
      </div>
    </section>
  );
}
