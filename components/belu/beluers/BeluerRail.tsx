import { BeluerCard, type BeluerCardData } from "./BeluerCard";
import styles from "./beluers.module.css";

type BeluerRailProps = {
  beluers: BeluerCardData[];
  onSelect: () => void;
};

export function BeluerRail({ beluers, onSelect }: BeluerRailProps) {
  return (
    <div className={styles.rail}>
      {beluers.map((beluer) => (
        <BeluerCard key={beluer.id} beluer={beluer} onSelect={onSelect} />
      ))}
    </div>
  );
}
