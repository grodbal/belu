import type { Metadata } from "next";
import {
  BeluerCard,
  BookingHero,
  GoldenClientShell,
  SectionHeader,
  ServiceCard,
  TrustStrip,
} from "./components";
import styles from "./cliente-home-v2.module.css";

export const metadata: Metadata = {
  title: "Home clienta — Propuesta visual | belu",
  description: "Propuesta visual aislada del home de clienta de belu.",
  robots: { index: false, follow: false },
};

const services = [
  { title: "Extensiones de pestañas", category: "Lashes", price: "S/ 120", image: "/prototipo/cliente-home-v2/service-lashes.png", imagePosition: "60% center" },
  { title: "Retoques", category: "Lashes", price: "S/ 80", image: "/prototipo/cliente-home-v2/service-retouch-v2.png", imagePosition: "center" },
  { title: "Manicure gel", category: "Nails", price: "S/ 65", image: "/prototipo/cliente-home-v2/service-nails.png", imagePosition: "center" },
];

const beluers = [
  { name: "Camila R.", specialty: "Lash artist · Efecto natural", price: "S/ 95", image: "/prototipo/cliente-home-v2/beluer-camila-v2.png", rating: "4.9", reviews: "(48)", available: true },
  { name: "Valeria M.", specialty: "Nail artist · Gel & soft gel", price: "S/ 65", image: "/prototipo/cliente-home-v2/beluer-valeria-v2.png", fresh: true },
  { name: "Andrea P.", specialty: "Lash artist · Volumen ligero", price: "S/ 120", image: "/prototipo/cliente-home-v2/beluer-andrea-v2.png", rating: "5.0", reviews: "(32)" },
];

export default function ClienteHomeV2Page() {
  return (
    <GoldenClientShell>
      <h1 className={styles.mobileGreeting}>Hola, Luciana <span aria-hidden="true">✦</span></h1>
      <BookingHero />

      <section className={styles.contentSection} id="servicios" aria-label="Explora servicios">
        <SectionHeader title="Explora servicios" linkLabel="Ver todos" />
        <div className={styles.serviceRail}>
          {services.map((service) => <ServiceCard key={service.title} {...service} />)}
        </div>
      </section>

      <section className={styles.contentSection} aria-label="Beluers para ti">
        <SectionHeader title="Beluers para ti" linkLabel="Conocer más" />
        <div className={styles.beluerRail}>
          {beluers.map((beluer) => <BeluerCard key={beluer.name} {...beluer} />)}
        </div>
      </section>

      <TrustStrip />
      <footer className={styles.footer}><span>belu</span><p>luce increíble, cuando quieras</p></footer>
    </GoldenClientShell>
  );
}
