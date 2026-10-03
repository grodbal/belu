"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./beluers.module.css";

export type BeluerCardData = {
  id: string;
  name: string;
  specialty: string;
  imageUrl?: string;
  isNew?: boolean;
  level?: string;
  services?: string[];
};

type BeluerCardProps = {
  beluer: BeluerCardData;
  onSelect: () => void;
  variant?: "home" | "catalog";
};

export function BeluerCard({
  beluer,
  onSelect,
  variant = "home",
}: BeluerCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const isCatalog = variant === "catalog";

  return (
    <article
      className={`${styles.card} ${isCatalog ? styles.catalogCard : ""}`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Ver a ${beluer.name} en Especialistas`}
      >
        <span className={styles.visual}>
          {beluer.imageUrl && !imageFailed ? (
            <Image
              src={beluer.imageUrl}
              alt={`${beluer.name}, especialista belu`}
              fill
              sizes={
                isCatalog
                  ? "(max-width: 767px) calc(100vw - 36px), (max-width: 1180px) 45vw, 30vw"
                  : "(max-width: 767px) 75vw, 27vw"
              }
              unoptimized
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className={styles.fallback} aria-hidden="true">
              <b>{beluer.name.slice(0, 1).toUpperCase()}</b>
              <small>Especialista belu</small>
            </span>
          )}
        </span>

        <span className={styles.info}>
          <span className={styles.verified}>
            {beluer.level || "Verificada"} <i aria-hidden="true">✦</i>
          </span>
          <strong>{beluer.name}</strong>
          <span className={styles.specialty}>{beluer.specialty}</span>
          {beluer.isNew ? (
            <span className={styles.newBeluer}>Nueva en belu</span>
          ) : null}
          {isCatalog && beluer.services && beluer.services.length > 0 ? (
            <span className={styles.services}>
              {beluer.services.slice(0, 3).map((service) => (
                <span key={service}>{service}</span>
              ))}
            </span>
          ) : null}
          {isCatalog ? (
            <span className={styles.action}>Ver servicios</span>
          ) : null}
        </span>
      </button>
    </article>
  );
}
