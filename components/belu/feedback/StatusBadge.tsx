import styles from "./feedback.module.css";

export type StatusBadgeTone =
  | "neutral"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "danger";

export type StatusBadgeData = {
  label: string;
  tone: StatusBadgeTone;
};

type StatusBadgeProps = StatusBadgeData & {
  className?: string;
};

export function StatusBadge({
  label,
  tone,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={[styles.badge, styles[tone], className]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </span>
  );
}
