"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import {
  BeluIcon,
  ClientBottomNav,
  ClientHeader,
  ClientShell,
  ClientSidebar,
  PrimaryButton,
  SecondaryButton,
  type BeluIconName,
  type ClientNavigationItem,
} from "@/components/belu";
import styles from "./cliente-home-v2.module.css";

type GoldenNavigationId = "home" | "services" | "booking" | "history" | "profile";

const desktopNav: ClientNavigationItem<GoldenNavigationId>[] = [
  { id: "home", label: "Inicio", icon: "home" },
  { id: "services", label: "Servicios", icon: "sparkles" },
  { id: "booking", label: "Reservar", icon: "calendar" },
  { id: "history", label: "Historial", icon: "clock" },
  { id: "profile", label: "Mi perfil", icon: "user" },
];

const mobileNav: ClientNavigationItem<GoldenNavigationId>[] = [
  { id: "home", label: "Inicio", icon: "home" },
  { id: "services", label: "Servicios", icon: "sparkles" },
  { id: "booking", label: "Reserva", icon: "calendar", prominent: true },
  { id: "history", label: "Historial", icon: "clock" },
  { id: "profile", label: "Perfil", icon: "user" },
];

const navigationTargets: Partial<Record<GoldenNavigationId, string>> = {
  home: "top",
  services: "servicios",
  booking: "servicios",
};

export function GoldenClientShell({ children }: { children: ReactNode }) {
  const [activeItem, setActiveItem] = useState<GoldenNavigationId>("home");

  function handleNavigate(itemId: GoldenNavigationId) {
    setActiveItem(itemId);
    const target = navigationTargets[itemId];

    if (target) {
      document.getElementById(target)?.scrollIntoView();
    }
  }

  return (
    <ClientShell
      id="top"
      sidebar={
        <ClientSidebar
          items={desktopNav}
          activeItem={activeItem}
          onNavigate={handleNavigate}
          onLogoClick={() => handleNavigate("home")}
          note={<><span aria-hidden="true">✦</span><p>Belleza experta,<br/>donde tú estés.</p></>}
          logout={<button type="button"><BeluIcon name="arrow"/><span>Cerrar sesión</span></button>}
        />
      }
      header={
        <ClientHeader
          clientName="Luciana"
          avatarText="L"
          eyebrow="Tu espacio belu"
          greeting={<>Hola, Luciana <span aria-hidden="true">✦</span></>}
          onLogoClick={() => handleNavigate("home")}
          onProfileClick={() => handleNavigate("profile")}
        />
      }
      bottomNav={
        <ClientBottomNav
          items={mobileNav}
          activeItem={activeItem}
          onNavigate={handleNavigate}
        />
      }
    >
      {children}
    </ClientShell>
  );
}

export function BookingHero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Image className={styles.heroImage} src="/prototipo/cliente-home-v2/hero-at-home.png" alt="Especialista belu realizando un servicio de pestañas a domicilio" fill priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1050px" />
      <div className={styles.heroShade}/>
      <div className={styles.heroContent}>
        <p className={styles.heroKicker}><span aria-hidden="true">✦</span> Tu momento, en casa</p>
        <h1 id="hero-title">Tu próxima sesión<br/>empieza aquí.</h1>
        <p>Elige tu servicio y recibe belleza experta sin salir de casa.</p>
        <div className={styles.heroActions}>
          <PrimaryButton href="#servicios">Reservar ahora<BeluIcon className={styles.icon} name="arrow" size={17}/></PrimaryButton>
          <SecondaryButton href="#servicios">Explorar servicios</SecondaryButton>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ title, linkLabel }: { title: string; linkLabel: string }) {
  return (
    <div className={styles.sectionHeader}>
      <h2>{title}</h2>
      <a href="#">{linkLabel}<BeluIcon className={styles.icon} name="arrow" size={16}/></a>
    </div>
  );
}

type ServiceCardProps = {
  title: string;
  category: string;
  price: string;
  image: string;
  imagePosition?: string;
};

export function ServiceCard({ title, category, price, image, imagePosition }: ServiceCardProps) {
  return (
    <article className={styles.serviceCard}>
      <a href="#" aria-label={`Ver ${title}`}>
        <div className={styles.serviceVisual}>
          <Image src={image} alt={title} fill sizes="(max-width: 768px) 76vw, 30vw" style={{ objectPosition: imagePosition }} />
          <span className={styles.cardArrow}><BeluIcon className={styles.icon} name="arrow" size={18}/></span>
        </div>
        <div className={styles.serviceInfo}>
          <p>{category}</p>
          <h3>{title}</h3>
          <span>Desde {price}</span>
        </div>
      </a>
    </article>
  );
}

type BeluerCardProps = {
  name: string;
  specialty: string;
  price: string;
  image: string;
  rating?: string;
  reviews?: string;
  fresh?: boolean;
  available?: boolean;
};

export function BeluerCard({ name, specialty, price, image, rating, reviews, fresh, available }: BeluerCardProps) {
  return (
    <article className={styles.beluerCard}>
      <div className={styles.beluerVisual}>
        <Image src={image} alt={`${name}, especialista belu`} fill sizes="(max-width: 768px) 74vw, 27vw" />
        {available && <span className={styles.availability}><i/> Disponible hoy</span>}
      </div>
      <a href="#" aria-label={`Ver perfil de ${name}`}>
        <div className={styles.beluerInfo}>
          <p className={styles.verified}>Verificada <span aria-hidden="true">✦</span></p>
          <div className={styles.beluerNameRow}><h3>{name}</h3><span>Desde {price}</span></div>
          <p className={styles.specialty}>{specialty}</p>
          <div className={styles.reputation}>
            {fresh ? <span className={styles.newBeluer}>Nueva en belu</span> : <><BeluIcon className={styles.icon} name="star" size={15}/><strong>{rating}</strong><span>{reviews}</span></>}
          </div>
        </div>
      </a>
    </article>
  );
}

const trustItems: { icon: BeluIconName; title: string; body: string }[] = [
  { icon: "shield", title: "Especialistas verificadas", body: "Perfiles evaluados por belu" },
  { icon: "card", title: "Pago protegido", body: "Tu compra siempre segura" },
  { icon: "pin", title: "Atención a domicilio", body: "Nosotras vamos hacia ti" },
];

export function TrustStrip() {
  return (
    <section className={styles.trust} aria-label="Beneficios de reservar con belu">
      <div className={styles.trustIntro}><span aria-hidden="true">✦</span><p>Belleza con la tranquilidad<br/>de estar en buenas manos.</p></div>
      <div className={styles.trustItems}>
        {trustItems.map((item) => <div className={styles.trustItem} key={item.title}><span><BeluIcon className={styles.icon} name={item.icon}/></span><div><h3>{item.title}</h3><p>{item.body}</p></div></div>)}
      </div>
    </section>
  );
}
