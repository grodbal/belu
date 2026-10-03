"use client";

import Image from "next/image";
import { useState } from "react";
import { BeluIcon } from "../foundations/BeluIcon";
import styles from "./services.module.css";

export type ServiceCardData = {
  id: string;
  name: string;
  category: string;
  price: string;
  imageUrl?: string;
  description?: string;
  duration?: string;
  isFeatured?: boolean;
  isSelected?: boolean;
};

type ServiceCardProps = {
  service: ServiceCardData;
  onSelect: () => void;
  variant?: "home" | "catalog";
};

export function ServiceCard({
  service,
  onSelect,
  variant = "home",
}: ServiceCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const isCatalog = variant === "catalog";

  return (
    <article
      className={`${styles.card} ${isCatalog ? styles.catalogCard : ""} ${
        service.isSelected ? styles.selectedCard : ""
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Ver ${service.name} en Servicios`}
      >
        <span className={styles.visual}>
          {service.imageUrl && !imageFailed ? (
            <Image
              src={service.imageUrl}
              alt={service.name}
              fill
              sizes={
                isCatalog
                  ? "(max-width: 767px) calc(100vw - 36px), (max-width: 1180px) 45vw, 30vw"
                  : "(max-width: 767px) 76vw, 30vw"
              }
              unoptimized
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className={styles.fallback} aria-hidden="true">
              <small>{service.category}</small>
              <span className={styles.fallbackMark}>
                <i>✦</i>
                <b>{service.name.slice(0, 1).toUpperCase()}</b>
              </span>
            </span>
          )}
          {isCatalog && service.isFeatured ? (
            <span className={styles.featured}>Destacado ✦</span>
          ) : null}
          {isCatalog && service.isSelected ? (
            <span className={styles.selected}>Seleccionado</span>
          ) : null}
          <span className={styles.arrow} aria-hidden="true">
            <BeluIcon name="arrow" size={18} />
          </span>
        </span>

        <span className={styles.info}>
          <span>{service.category}</span>
          <strong>{service.name}</strong>
          {isCatalog && service.description ? (
            <span className={styles.description}>{service.description}</span>
          ) : null}
          <small>Desde {service.price}</small>
          {isCatalog && service.duration ? (
            <span className={styles.duration}>{service.duration}</span>
          ) : null}
        </span>
      </button>
    </article>
  );
}
