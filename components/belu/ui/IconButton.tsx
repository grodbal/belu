"use client";

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import styles from "./ui.module.css";

export type IconButtonProps = {
  "aria-label": string;
  icon: ReactNode;
  size?: number;
  className?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function IconButton({
  "aria-label": ariaLabel,
  icon,
  size = 44,
  className,
  disabled,
  onClick,
}: IconButtonProps) {
  const controlSize = Math.max(44, size);
  const style = {
    "--belu-icon-button-size": `${controlSize}px`,
  } as CSSProperties;

  return (
    <button
      aria-label={ariaLabel}
      className={[styles.iconButton, className].filter(Boolean).join(" ")}
      disabled={disabled}
      onClick={onClick}
      style={style}
      type="button"
    >
      {icon}
    </button>
  );
}
