"use client";

import { useMemo, useState } from "react";
import { ServiceCard, type ServiceCardData } from "./ServiceCard";
import styles from "./services.module.css";

type ServiceCatalogFilter = "all" | "featured" | "lashes" | "nails";

export type ServiceCatalogItem = ServiceCardData & {
  categoryKey: "lashes" | "nails";
};

type ServicesCatalogProps = {
  services: ServiceCatalogItem[];
  onViewService: (serviceId: string) => void;
};

const filters: { id: ServiceCatalogFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "featured", label: "Destacados ✦" },
  { id: "lashes", label: "Lashes" },
  { id: "nails", label: "Nails" },
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function ServicesCatalog({
  services,
  onViewService,
}: ServicesCatalogProps) {
  const [filter, setFilter] = useState<ServiceCatalogFilter>("all");
  const [search, setSearch] = useState("");
  const normalizedSearch = normalizeText(search);

  const filteredServices = useMemo(
    () =>
      services.filter((service) => {
        if (filter === "featured" && !service.isFeatured) return false;
        if (
          (filter === "lashes" || filter === "nails") &&
          service.categoryKey !== filter
        ) {
          return false;
        }

        if (!normalizedSearch) return true;

        return normalizeText(
          `${service.name} ${service.description || ""} ${service.category}`
        ).includes(normalizedSearch);
      }),
    [filter, normalizedSearch, services]
  );

  const featuredSection = {
    id: "featured",
    eyebrow: "Selección belu",
    title: "Destacados ✦",
    services: filteredServices.filter((service) => service.isFeatured),
  };
  const categorySections = [
    {
      id: "lashes",
      eyebrow: "Pestañas",
      title: "Lashes",
      services: filteredServices.filter(
        (service) => service.categoryKey === "lashes"
      ),
    },
    {
      id: "nails",
      eyebrow: "Manos",
      title: "Nails",
      services: filteredServices.filter(
        (service) => service.categoryKey === "nails"
      ),
    },
  ];
  const sections = (
    filter === "featured" ? [featuredSection] : categorySections
  ).filter((section) => section.services.length > 0);

  function clearFilters() {
    setFilter("all");
    setSearch("");
  }

  return (
    <section className={styles.catalog} aria-labelledby="services-catalog-title">
      <header className={styles.catalogHeader}>
        <p>Catálogo <span aria-hidden="true">✦</span></p>
        <h1 id="services-catalog-title">Explora servicios</h1>
        <span>Lashes y nails a domicilio, cuando quieras.</span>
      </header>

      <div className={styles.catalogTools}>
        <label className={styles.searchField}>
          <span>Buscar servicio</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busca por nombre o categoría"
          />
        </label>

        <div className={styles.filterRail} aria-label="Filtros de servicios">
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

        <div className={styles.catalogSummary} aria-live="polite">
          <strong>{filteredServices.length} servicios</strong>
          <span>Elige uno para ver sus fotos y reservar.</span>
        </div>
      </div>

      {sections.length > 0 ? (
        <div className={styles.catalogSections}>
          {sections.map((section) => (
            <section className={styles.catalogGroup} key={section.id}>
              <header className={styles.groupHeader}>
                <p>{section.eyebrow}</p>
                <h2>{section.title}</h2>
              </header>
              <div className={styles.catalogGrid}>
                {section.services.map((service) => (
                  <ServiceCard
                    key={`${section.id}-${service.id}`}
                    service={service}
                    variant="catalog"
                    onSelect={() => onViewService(service.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span aria-hidden="true">✦</span>
          <strong>No encontramos servicios con esos filtros.</strong>
          <p>Prueba con otra búsqueda o vuelve a ver todo el catálogo.</p>
          <button type="button" onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      )}
    </section>
  );
}
