"use client";

import type { ReactNode } from "react";
import {
  ClientBottomNav,
  ClientHeader,
  ClientShell,
  ClientSidebar,
} from "@/components/belu/navigation";
import type { BeluerSection } from "@/components/beluer-panel-original/beluerPanelTypes";
import { beluerMobileNavigation, beluerPrimaryNavigation } from "./beluerNavigation";
import styles from "./beluer-shell.module.css";

type BeluerShellAdapterProps = {
  activeSection: BeluerSection;
  onNavigate: (section: BeluerSection) => void;
  name: string;
  initials: string;
  logoutButton: ReactNode;
  children: ReactNode;
};

export function BeluerShellAdapter({
  activeSection,
  onNavigate,
  name,
  initials,
  logoutButton,
  children,
}: BeluerShellAdapterProps) {
  return (
    <ClientShell
      className={styles.shell}
      mainClassName={styles.main}
      sidebar={
        <ClientSidebar
          items={beluerPrimaryNavigation}
          activeItem={activeSection}
          onNavigate={onNavigate}
          onLogoClick={() => onNavigate("dashboard")}
          note={
            <>
              <span aria-hidden="true">✦</span>
              <p>Belleza experta,<br />donde tú estés.</p>
            </>
          }
          logout={logoutButton}
        />
      }
      header={
        <div className={styles.headerStack}>
          <ClientHeader
            clientName={name}
            avatarText={initials}
            eyebrow="Tu espacio de trabajo"
            greeting={<>Hola, <span>{name.split(" ")[0]}</span></>}
            onLogoClick={() => onNavigate("dashboard")}
            onProfileClick={() => onNavigate("perfil")}
          />
          <button
            className={styles.mobilePortfolioLink}
            onClick={() => onNavigate("portafolio")}
            type="button"
          >
            <span aria-hidden="true">↗</span> Abrir portafolio
          </button>
        </div>
      }
      bottomNav={
        <ClientBottomNav
          items={beluerMobileNavigation}
          activeItem={activeSection}
          onNavigate={onNavigate}
        />
      }
    >
      {children}
    </ClientShell>
  );
}
