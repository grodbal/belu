import Image from "next/image";
import { BeluIcon } from "../foundations/BeluIcon";
import styles from "./services.module.css";

export type ServiceCardData = {
  id: string;
  name: string;
  category: string;
  price: string;
  imageUrl?: string;
};

type ServiceCardProps = {
  service: ServiceCardData;
  onSelect: () => void;
};

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <article className={styles.card}>
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Ver ${service.name} en Servicios`}
      >
        <span className={styles.visual}>
          {service.imageUrl ? (
            <Image
              src={service.imageUrl}
              alt={service.name}
              fill
              sizes="(max-width: 767px) 76vw, 30vw"
              unoptimized
            />
          ) : (
            <span className={styles.fallback} aria-hidden="true">
              <b>{service.name.slice(0, 1).toUpperCase()}</b>
              <small>belu</small>
            </span>
          )}
          <span className={styles.arrow} aria-hidden="true">
            <BeluIcon name="arrow" size={18} />
          </span>
        </span>

        <span className={styles.info}>
          <span>{service.category}</span>
          <strong>{service.name}</strong>
          <small>Desde {service.price}</small>
        </span>
      </button>
    </article>
  );
}
