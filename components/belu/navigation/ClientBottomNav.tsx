"use client";

import { BeluIcon } from "../foundations/BeluIcon";
import type {
  ClientNavigationHandler,
  ClientNavigationItem,
} from "./client-navigation.types";
import styles from "./navigation.module.css";

export type ClientBottomNavProps<ItemId extends string = string> = {
  items: ClientNavigationItem<ItemId>[];
  activeItem: ItemId;
  onNavigate: ClientNavigationHandler<ItemId>;
};

export function ClientBottomNav<ItemId extends string = string>({
  items,
  activeItem,
  onNavigate,
}: ClientBottomNavProps<ItemId>) {
  return (
    <nav className={styles.bottomNav} aria-label="Navegación móvil">
      {items.map((item) => {
        const isActive = item.id === activeItem;
        const className = [
          styles.bottomNavItem,
          isActive ? styles.bottomNavActive : undefined,
          item.prominent ? styles.bottomNavPrimary : undefined,
        ].filter(Boolean).join(" ");

        return (
          <button
            aria-current={isActive ? "page" : undefined}
            className={className}
            key={item.id}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            <span><BeluIcon className={styles.icon} name={item.icon} /></span>
            <em>{item.label}</em>
          </button>
        );
      })}
    </nav>
  );
}
