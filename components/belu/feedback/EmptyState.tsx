"use client";

import { PrimaryButton } from "../ui/Button";
import styles from "./feedback.module.css";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={[styles.emptyState, className].filter(Boolean).join(" ")}>
      <span aria-hidden="true">✦</span>
      <strong>{title}</strong>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <PrimaryButton onClick={onAction}>{actionLabel}</PrimaryButton>
      ) : null}
    </div>
  );
}
