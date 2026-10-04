"use client";

import styles from "./ui.module.css";

type FilterChipItem<Id extends string> = {
  id: Id;
  label: string;
};

type FilterChipsProps<Id extends string> = {
  ariaLabel: string;
  items: readonly FilterChipItem<Id>[];
  activeId: Id;
  onChange: (id: Id) => void;
  className?: string;
};

export function FilterChips<Id extends string>({
  ariaLabel,
  items,
  activeId,
  onChange,
  className,
}: FilterChipsProps<Id>) {
  return (
    <div
      className={[styles.filterChips, className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const isActive = activeId === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={isActive ? styles.activeFilterChip : undefined}
            aria-pressed={isActive}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
