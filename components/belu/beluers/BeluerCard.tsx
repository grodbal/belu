import Image from "next/image";
import styles from "./beluers.module.css";

export type BeluerCardData = {
  id: string;
  name: string;
  specialty: string;
  imageUrl?: string;
  isNew?: boolean;
};

type BeluerCardProps = {
  beluer: BeluerCardData;
  onSelect: () => void;
};

export function BeluerCard({ beluer, onSelect }: BeluerCardProps) {
  return (
    <article className={styles.card}>
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Ver a ${beluer.name} en Especialistas`}
      >
        <span className={styles.visual}>
          {beluer.imageUrl ? (
            <Image
              src={beluer.imageUrl}
              alt={`${beluer.name}, especialista belu`}
              fill
              sizes="(max-width: 767px) 75vw, 27vw"
              unoptimized
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
            Verificada <i aria-hidden="true">✦</i>
          </span>
          <strong>{beluer.name}</strong>
          <span className={styles.specialty}>{beluer.specialty}</span>
          {beluer.isNew ? (
            <span className={styles.newBeluer}>Nueva en belu</span>
          ) : null}
        </span>
      </button>
    </article>
  );
}
