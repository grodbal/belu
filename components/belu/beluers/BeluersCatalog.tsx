"use client";

import { useMemo, useState } from "react";
import { BeluerCard, type BeluerCardData } from "./BeluerCard";
import styles from "./beluers.module.css";

type BeluerCategory = "all" | "lashes" | "nails" | "mixta";

export type BeluerCatalogItem = BeluerCardData & {
  categoryKey: Exclude<BeluerCategory, "all">;
};

type BeluersCatalogProps = {
  beluers: BeluerCatalogItem[];
  onViewServices: (beluerId: string) => void;
};

const filters: { id: BeluerCategory; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "lashes", label: "Lashes" },
  { id: "nails", label: "Nails" },
  { id: "mixta", label: "Mixtas" },
];

export function BeluersCatalog({
  beluers,
  onViewServices,
}: BeluersCatalogProps) {
  const [filter, setFilter] = useState<BeluerCategory>("all");
  const filteredBeluers = useMemo(
    () =>
      filter === "all"
        ? beluers
        : beluers.filter((beluer) => beluer.categoryKey === filter),
    [beluers, filter]
  );

  return (
    <section className={styles.catalog} aria-labelledby="beluers-catalog-title">
      <header className={styles.catalogHeader}>
        <p>Talento belu <span aria-hidden="true">✦</span></p>
        <h1 id="beluers-catalog-title">Conoce a nuestras especialistas</h1>
        <span>
          Beluers verificadas para acompañarte en tu próxima sesión de belleza.
        </span>
      </header>

      <div className={styles.catalogToolbar}>
        <div className={styles.filterRail} aria-label="Filtros de especialistas">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              className={filter === item.id ? styles.activeFilter : ""}
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span aria-live="polite">
          {filteredBeluers.length} especialistas
        </span>
      </div>

      {filteredBeluers.length > 0 ? (
        <div className={styles.catalogGrid}>
          {filteredBeluers.map((beluer) => (
            <BeluerCard
              key={beluer.id}
              beluer={beluer}
              variant="catalog"
              onSelect={() => onViewServices(beluer.id)}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span aria-hidden="true">✦</span>
          <strong>No encontramos especialistas en esta categoría.</strong>
          <p>Explora todas las Beluers disponibles.</p>
          <button type="button" onClick={() => setFilter("all")}>
            Ver todas
          </button>
        </div>
      )}
    </section>
  );
}
