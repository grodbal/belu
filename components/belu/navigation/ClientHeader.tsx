"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./navigation.module.css";

export type ClientHeaderProps = {
  clientName: string;
  avatarText: string;
  eyebrow?: string;
  greeting?: ReactNode;
  onLogoClick?: () => void;
  onProfileClick?: () => void;
};

export function ClientHeader({
  clientName,
  avatarText,
  eyebrow,
  greeting,
  onLogoClick,
  onProfileClick,
}: ClientHeaderProps) {
  return (
    <header className={styles.header}>
      <button
        aria-label="belu, inicio"
        className={styles.mobileLogo}
        onClick={onLogoClick}
        type="button"
      >
        <Image
          src="/logo-belu-red.png"
          alt="belu"
          width={82}
          height={36}
          priority
        />
      </button>
      {eyebrow || greeting ? (
        <div className={styles.desktopGreeting}>
          {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
          {greeting ? <p>{greeting}</p> : null}
        </div>
      ) : null}
      <button
        className={styles.avatarButton}
        type="button"
        aria-label={`Abrir perfil de ${clientName}`}
        onClick={onProfileClick}
      >
        <span className={styles.avatar}>{avatarText}</span>
        <span className={styles.avatarName}>{clientName}</span>
        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 12 12" fill="none">
          <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </header>
  );
}
