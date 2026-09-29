"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { BeluIcon } from "../foundations/BeluIcon";
import type {
  ClientNavigationHandler,
  ClientNavigationItem,
} from "./client-navigation.types";
import styles from "./navigation.module.css";

export type ClientSidebarProps<ItemId extends string = string> = {
  items: ClientNavigationItem<ItemId>[];
  secondaryItems?: ClientNavigationItem<ItemId>[];
  activeItem: ItemId;
  onNavigate: ClientNavigationHandler<ItemId>;
  onLogoClick?: () => void;
  note?: ReactNode;
  logout?: ReactNode;
};

type SidebarItemsProps<ItemId extends string> = {
  items: ClientNavigationItem<ItemId>[];
  activeItem: ItemId;
  onNavigate: ClientNavigationHandler<ItemId>;
};

function SidebarItems<ItemId extends string>({
  items,
  activeItem,
  onNavigate,
}: SidebarItemsProps<ItemId>) {
  return items.map((item) => {
    const isActive = item.id === activeItem;

    return (
      <button
        aria-current={isActive ? "page" : undefined}
        className={isActive ? styles.sideNavActive : styles.sideNavLink}
        key={item.id}
        onClick={() => onNavigate(item.id)}
        type="button"
      >
        <BeluIcon className={styles.icon} name={item.icon} />
        <span>{item.label}</span>
      </button>
    );
  });
}

export function ClientSidebar<ItemId extends string = string>({
  items,
  secondaryItems,
  activeItem,
  onNavigate,
  onLogoClick,
  note,
  logout,
}: ClientSidebarProps<ItemId>) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <button
          aria-label="belu, inicio"
          className={styles.logo}
          onClick={onLogoClick}
          type="button"
        >
          <Image
            src="/logo-belu-red.png"
            alt="belu"
            width={104}
            height={45}
            priority
          />
        </button>
        <nav className={styles.sideNav} aria-label="Navegación principal">
          <SidebarItems
            items={items}
            activeItem={activeItem}
            onNavigate={onNavigate}
          />
        </nav>
        {secondaryItems?.length ? (
          <nav className={styles.secondaryNav} aria-label="Navegación secundaria">
            <SidebarItems
              items={secondaryItems}
              activeItem={activeItem}
              onNavigate={onNavigate}
            />
          </nav>
        ) : null}
        {note ? <div className={styles.sidebarNote}>{note}</div> : null}
        {logout ? <div className={styles.logoutSlot}>{logout}</div> : null}
      </div>
    </aside>
  );
}
