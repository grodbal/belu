import type { ReactNode } from "react";
import styles from "./navigation.module.css";

export type ClientShellProps = {
  sidebar: ReactNode;
  header: ReactNode;
  bottomNav: ReactNode;
  children: ReactNode;
  id?: string;
  className?: string;
  mainClassName?: string;
};

export function ClientShell({
  sidebar,
  header,
  bottomNav,
  children,
  id,
  className,
  mainClassName,
}: ClientShellProps) {
  return (
    <div className={[styles.shell, className].filter(Boolean).join(" ")} id={id}>
      {sidebar}
      <div className={styles.pageColumn}>
        {header}
        <main className={[styles.main, mainClassName].filter(Boolean).join(" ")}>
          {children}
        </main>
      </div>
      {bottomNav}
    </div>
  );
}
