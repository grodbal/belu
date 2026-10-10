"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EmptyState, PageHeader, StatusBadge } from "@/components/belu";
import {
  disableBeluerService,
  setBeluerServiceOffer,
  type BeluerServiceCatalogItem,
  type ServiceCategory,
  type ServiceOfferErrorCode,
} from "@/app/actions/beluer/serviceOffers";
import styles from "./services.module.css";

type Props = {
  servicios: BeluerServiceCatalogItem[];
  dataAvailable: boolean;
  approvedCategories: ServiceCategory[];
};

const categories = [
  { key: "lashes", label: "Pestañas" },
  { key: "brows", label: "Cejas" },
  { key: "nails", label: "Uñas" },
] as const;

const errorMessages: Record<ServiceOfferErrorCode, string> = {
  UNAUTHORIZED: "Tu sesión no permite actualizar este servicio.",
  PROFILE_NOT_FOUND: "No encontramos tu perfil. Vuelve a iniciar sesión.",
  BELUER_NOT_FOUND: "No encontramos tu perfil de Beluer.",
  BELUER_NOT_APPROVED: "Tu perfil debe estar aprobado para activar servicios.",
  SERVICE_NOT_FOUND: "Este servicio ya no está disponible.",
  SERVICE_NOT_ACTIVE: "Este servicio ya no está activo en el catálogo.",
  MINIMUM_PRICE_NOT_FOUND: "Este servicio no tiene un precio mínimo configurado.",
  CATEGORY_NOT_APPROVED: "Esta categoría no está habilitada para tu perfil.",
  INVALID_PRICE: "Ingresa un precio válido con hasta dos decimales.",
  PRICE_BELOW_MINIMUM: "El precio debe ser igual o mayor al mínimo BELU.",
  INTERNAL_ERROR: "No pudimos guardar el cambio. Inténtalo nuevamente.",
};

function money(value: number) {
  return value.toFixed(2);
}

function durationLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours && remaining) return `${hours} h ${remaining} min`;
  if (hours) return `${hours} h`;
  return `${remaining} min`;
}

export function BeluerServices({
  servicios,
  dataAvailable,
  approvedCategories,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState(servicios);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, { error?: string; success?: string }>>({});
  const [isPending, startTransition] = useTransition();

  const itemsByCategory = useMemo(() => {
    return categories.filter((category) => approvedCategories.includes(category.key)).map((category) => ({
      ...category,
      items: items
        .filter((item) => item.category === category.key)
        .sort((a, b) => {
          if (a.serviceType !== b.serviceType) return a.serviceType === "primary" ? -1 : 1;
          return a.name.localeCompare(b.name, "es");
        }),
    }));
  }, [items, approvedCategories]);

  const updatePriceInput = (item: BeluerServiceCatalogItem, value: string) => {
    setPriceInputs((current) => ({
      ...current,
      [item.serviceId]: value,
    }));
    setFeedback((current) => ({ ...current, [item.serviceId]: {} }));
  };

  const saveOffer = async (item: BeluerServiceCatalogItem, valueOverride?: string) => {
    const value = valueOverride ?? priceInputs[item.serviceId] ?? (item.beluerPrice == null ? "" : String(item.beluerPrice));
    if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim()) || Number(value) <= 0) {
      setFeedback((current) => ({
        ...current,
        [item.serviceId]: { error: "Ingresa un precio válido con hasta dos decimales." },
      }));
      return;
    }
    if (Number(value) < item.minimumPrice) {
      setFeedback((current) => ({
        ...current,
        [item.serviceId]: { error: `El precio mínimo para este servicio es S/ ${money(item.minimumPrice)}.` },
      }));
      return;
    }

    setBusyId(item.serviceId);
    setFeedback((current) => ({ ...current, [item.serviceId]: {} }));
    const result = await setBeluerServiceOffer({ serviceId: item.serviceId, beluerPrice: value }).catch(() => null);
    setBusyId(null);
    if (!result) {
      setFeedback((current) => ({ ...current, [item.serviceId]: { error: errorMessages.INTERNAL_ERROR } }));
      return;
    }
    if (!result.ok) {
      setFeedback((current) => ({ ...current, [item.serviceId]: { error: errorMessages[result.error.code] } }));
      return;
    }

    setItems((current) => current.map((entry) => entry.serviceId === item.serviceId
      ? { ...entry, offeringStatus: "active", beluerPrice: Number(value) }
      : entry));
    setPriceInputs((current) => ({ ...current, [item.serviceId]: value }));
    setEditingId(null);
    setFeedback((current) => ({ ...current, [item.serviceId]: { success: "Servicio actualizado." } }));
    startTransition(() => router.refresh());
  };

  const deactivate = async (item: BeluerServiceCatalogItem) => {
    setBusyId(item.serviceId);
    setFeedback((current) => ({ ...current, [item.serviceId]: {} }));
    const result = await disableBeluerService({ serviceId: item.serviceId }).catch(() => null);
    setBusyId(null);
    if (!result) {
      setFeedback((current) => ({ ...current, [item.serviceId]: { error: errorMessages.INTERNAL_ERROR } }));
      return;
    }
    if (!result.ok) {
      setFeedback((current) => ({ ...current, [item.serviceId]: { error: errorMessages[result.error.code] } }));
      return;
    }
    setItems((current) => current.map((entry) => entry.serviceId === item.serviceId
      ? { ...entry, offeringStatus: "inactive" }
      : entry));
    setFeedback((current) => ({ ...current, [item.serviceId]: { success: "Servicio desactivado. Tu precio quedó guardado." } }));
    startTransition(() => router.refresh());
  };

  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="Panel Beluer"
        title="Mis servicios"
        description="Elige qué servicios realizas y define tu precio."
        titleId="beluer-services-title"
        accent
        className={styles.header}
      />

      {!dataAvailable ? (
        <EmptyState title="No pudimos cargar tus servicios" description="Inténtalo nuevamente más tarde." className={styles.empty} />
      ) : approvedCategories.length === 0 ? (
        <EmptyState
          title="Aún no tienes categorías habilitadas"
          description="Cuando belu apruebe una categoría, sus servicios aparecerán aquí automáticamente."
          className={styles.empty}
        />
      ) : (
        <div className={styles.groups}>
          {itemsByCategory.map((category) => (
            <section className={styles.group} key={category.key} aria-labelledby={`services-${category.key}`}>
              <h2 id={`services-${category.key}`} className={styles.groupTitle}>{category.label}</h2>
              {category.items.length === 0 ? (
                <EmptyState title={`Aún no hay servicios activos en ${category.label.toLowerCase()}`} description="Los servicios nuevos de esta categoría aparecerán aquí cuando estén disponibles." className={styles.categoryEmpty} />
              ) : <div className={styles.grid}>
                {category.items.map((item) => {
                  const itemFeedback = feedback[item.serviceId];
                  const inputValue = priceInputs[item.serviceId] ?? (item.beluerPrice == null ? "" : String(item.beluerPrice));
                  const isBusy = busyId === item.serviceId || isPending;
                  return (
                    <article className={styles.card} key={item.serviceId} aria-busy={isBusy}>
                      <div className={styles.cardHeading}>
                        <div className={styles.badges}>
                          {item.serviceType === "addon" ? <span className={styles.addon}>Adicional</span> : null}
                          <StatusBadge label={item.offeringStatus === "active" ? "Activo" : "Inactivo"} tone={item.offeringStatus === "active" ? "success" : "neutral"} />
                        </div>
                        <label className={styles.switch}>
                          <span className={styles.srOnly}>{item.offeringStatus === "active" ? "Desactivar" : "Activar"} {item.name}</span>
                          <input
                            type="checkbox"
                            role="switch"
                            checked={item.offeringStatus === "active"}
                            disabled={isBusy}
                            onChange={() => {
                              if (item.offeringStatus === "active") void deactivate(item);
                              else if (item.beluerPrice != null) {
                                const savedPrice = String(item.beluerPrice);
                                updatePriceInput(item, savedPrice);
                                void saveOffer(item, savedPrice);
                              } else {
                                setEditingId(item.serviceId);
                                updatePriceInput(item, "");
                              }
                            }}
                          />
                          <span aria-hidden="true" className={styles.switchTrack} />
                          <span className={styles.switchText}>{item.offeringStatus === "active" ? "Lo realizo" : "Activar"}</span>
                        </label>
                      </div>
                      <h3 className={styles.serviceName}>{item.name}</h3>
                      <div className={styles.details}>
                        <p>Duración aprox. <strong>{durationLabel(item.durationMinutes)}</strong></p>
                        <p>Precio mínimo BELU: <strong>S/ {money(item.minimumPrice)}</strong></p>
                      </div>
                      {item.offeringStatus === "active" && item.beluerPrice != null ? (
                        <p className={styles.currentPrice}>Tu precio: <strong>S/ {money(item.beluerPrice)}</strong></p>
                      ) : null}
                      {item.offeringStatus === "active" && editingId !== item.serviceId ? (
                        <button className={styles.secondaryButton} type="button" onClick={() => { setEditingId(item.serviceId); updatePriceInput(item, String(item.beluerPrice ?? "")); }}>
                          Editar precio
                        </button>
                      ) : null}
                      {editingId === item.serviceId ? (
                        <div className={styles.editor}>
                          <label htmlFor={`price-${item.serviceId}`}>Tu precio (S/)</label>
                          <div className={styles.priceInput}>
                            <span aria-hidden="true">S/</span>
                            <input
                              id={`price-${item.serviceId}`}
                              inputMode="decimal"
                              type="number"
                              min={item.minimumPrice}
                              step="0.01"
                              value={inputValue}
                              onChange={(event) => updatePriceInput(item, event.target.value)}
                              aria-invalid={Boolean(itemFeedback?.error)}
                              aria-describedby={itemFeedback?.error ? `error-${item.serviceId}` : `minimum-${item.serviceId}`}
                            />
                          </div>
                          <small id={`minimum-${item.serviceId}`}>El mínimo para este servicio es S/ {money(item.minimumPrice)}.</small>
                          {itemFeedback?.error ? <p className={styles.error} id={`error-${item.serviceId}`}>{itemFeedback.error}</p> : null}
                          <div className={styles.editorActions}>
                            <button className={styles.primaryButton} type="button" disabled={isBusy} onClick={() => void saveOffer(item)}>{isBusy ? "Guardando…" : item.offeringStatus === "active" ? "Guardar precio" : "Activar servicio"}</button>
                            <button className={styles.cancelButton} type="button" disabled={isBusy} onClick={() => setEditingId(null)}>Cancelar</button>
                          </div>
                        </div>
                      ) : null}
                      {busyId === item.serviceId && editingId !== item.serviceId ? <p className={styles.saving} role="status">Guardando cambios…</p> : null}
                      {itemFeedback?.error && editingId !== item.serviceId ? <p className={styles.error} role="alert">{itemFeedback.error}</p> : null}
                      {itemFeedback?.success ? <p className={styles.success} role="status">{itemFeedback.success}</p> : null}
                    </article>
                  );
                })}
              </div>}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
