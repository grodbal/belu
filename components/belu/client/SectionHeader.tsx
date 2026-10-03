import { BeluIcon } from "../foundations/BeluIcon";
import styles from "./client.module.css";

type SectionHeaderProps = {
  title: string;
  actionLabel: string;
  onAction: () => void;
};

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  return (
    <div className={styles.sectionHeader}>
      <h2>{title}</h2>
      <button type="button" onClick={onAction}>
        {actionLabel}
        <BeluIcon name="arrow" size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
