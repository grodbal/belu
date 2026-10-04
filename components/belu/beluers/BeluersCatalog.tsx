"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "../client/PageHeader";
import { EmptyState } from "../feedback/EmptyState";
import { FilterChips } from "../ui/FilterChips";
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
      <PageHeader
        eyebrow="Talento belu"
        accent
        title="Conoce a nuestras especialistas"
        description="Beluers verificadas para acompañarte en tu próxima sesión de belleza."
        titleId="beluers-catalog-title"
      />

      <div className={styles.catalogToolbar}>
        <FilterChips
          ariaLabel="Filtros de especialistas"
          items={filters}
          activeId={filter}
          onChange={setFilter}
          className={styles.filterRail}
        />
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
        <EmptyState
          className={styles.catalogEmpty}
          title="No encontramos especialistas en esta categoría."
          description="Explora todas las Beluers disponibles."
          actionLabel="Ver todas"
          onAction={() => setFilter("all")}
        />
      )}
    </section>
  );
}
