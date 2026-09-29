import Image from "next/image";
import {
  BeluIcon,
  PrimaryButton,
  SecondaryButton,
  type BeluIconName,
} from "@/components/belu";
import styles from "./cliente-home-v2.module.css";

const desktopNav: { label: string; icon: BeluIconName; active?: boolean }[] = [
  { label: "Inicio", icon: "home", active: true },
  { label: "Servicios", icon: "sparkles" },
  { label: "Reservar", icon: "calendar" },
  { label: "Historial", icon: "clock" },
  { label: "Mi perfil", icon: "user" },
];

export function ClientSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <a className={styles.logo} href="#top" aria-label="belu, inicio">
          <Image src="/logo-belu-red.png" alt="belu" width={104} height={45} priority />
        </a>
        <nav className={styles.sideNav} aria-label="Navegación principal">
          {desktopNav.map((item) => (
            <a key={item.label} className={item.active ? styles.sideNavActive : styles.sideNavLink} href={item.active ? "#top" : "#"} aria-current={item.active ? "page" : undefined}>
              <BeluIcon className={styles.icon} name={item.icon}/><span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className={styles.sidebarNote}>
          <span className={styles.brandMark}>✦</span>
          <p>Belleza experta,<br/>donde tú estés.</p>
        </div>
        <button className={styles.logoutButton} type="button"><BeluIcon className={styles.icon} name="arrow"/><span>Cerrar sesión</span></button>
      </div>
    </aside>
  );
}

export function ClientHeader() {
  return (
    <header className={styles.header}>
      <a className={styles.mobileLogo} href="#top" aria-label="belu, inicio"><Image src="/logo-belu-red.png" alt="belu" width={82} height={36} priority /></a>
      <div className={styles.desktopGreeting}>
        <span className={styles.eyebrow}>Tu espacio belu</span>
        <p>Hola, Luciana <span aria-hidden="true">✦</span></p>
      </div>
      <button className={styles.avatarButton} type="button" aria-label="Abrir perfil de Luciana">
        <span className={styles.avatar}>L</span>
        <span className={styles.avatarName}>Luciana</span>
        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </header>
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

const mobileNav: { label: string; icon: BeluIconName; primary?: boolean; active?: boolean }[] = [
  { label: "Inicio", icon: "home", active: true },
  { label: "Servicios", icon: "sparkles" },
  { label: "Reserva", icon: "calendar", primary: true },
  { label: "Historial", icon: "clock" },
  { label: "Perfil", icon: "user" },
];

export function ClientBottomNav() {
  return (
    <nav className={styles.bottomNav} aria-label="Navegación móvil">
      {mobileNav.map((item) => <a key={item.label} className={`${styles.bottomNavItem} ${item.active ? styles.bottomNavActive : ""} ${item.primary ? styles.bottomNavPrimary : ""}`} href={item.active ? "#top" : "#"} aria-current={item.active ? "page" : undefined}><span><BeluIcon className={styles.icon} name={item.icon}/></span><em>{item.label}</em></a>)}
    </nav>
  );
}
