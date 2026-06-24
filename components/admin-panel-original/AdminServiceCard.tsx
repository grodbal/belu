"use client";

import { useState } from "react";
import EditServiceForm from "@/components/admin-panel-original/EditServiceForm";
import ServiceImageGalleryManager from "@/components/admin-panel-original/ServiceImageGalleryManager";
import ServiceMainImageForm from "@/components/admin-panel-original/ServiceMainImageForm";
import UpdateServiceStatusForm from "@/components/admin-panel-original/UpdateServiceStatusForm";

type ServiceGalleryImage = {
  id: string;
  service_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
};

export type AdminServiceCardData = {
  id: string;
  category: "lashes" | "nails";
  name: string;
  description: string | null;
  public_price: number;
  logistic_fee: number;
  base_price: number;
  duration_minutes: number;
  image_url: string | null;
  is_featured: boolean;
  status: "active" | "inactive";
  created_at: string;
  gallery_images: ServiceGalleryImage[];
};

type AdminServiceCardProps = {
  service: AdminServiceCardData;
};

type OpenPanel = "edit" | "mainImage" | "gallery" | "status" | null;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);
}

function getCategoryLabel(category: AdminServiceCardData["category"]) {
  if (category === "lashes") return "Lashes";
  if (category === "nails") return "Nails";
  return category;
}

function getBeluerPayments(basePrice: number) {
  return {
    standard: basePrice * 0.87,
    premium: basePrice * 0.9,
    top: basePrice * 0.92,
  };
}

export default function AdminServiceCard({ service }: AdminServiceCardProps) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const payments = getBeluerPayments(service.base_price);

  const togglePanel = (panel: OpenPanel) => {
    setOpenPanel((currentPanel) => (currentPanel === panel ? null : panel));
  };

  return (
    <article className="admin-service-card">
      <div className="admin-service-card-main">
        <div className="admin-service-media">
          {service.image_url ? (
            <img src={service.image_url} alt={service.name} />
          ) : (
            <span>{service.name.slice(0, 1).toUpperCase()}</span>
          )}
        </div>

        <div className="admin-service-copy">
          <div className="admin-service-title-row">
            <div>
              <h3>{service.name}</h3>
              <p>{service.description || "Sin descripcion"}</p>
            </div>

            <div className="admin-service-price">
              <span>Precio publico</span>
              <strong>{formatCurrency(service.public_price)}</strong>
            </div>
          </div>

          <div className="admin-service-badges">
            <span className="category">{getCategoryLabel(service.category)}</span>
            <span className={service.status === "active" ? "active" : "inactive"}>
              {service.status === "active" ? "Activo" : "Inactivo"}
            </span>
            {service.is_featured ? <span className="featured">Destacado ✦</span> : null}
            <span>{service.duration_minutes} min</span>
          </div>

          <div className="admin-service-metrics">
            <span>
              Base <strong>{formatCurrency(service.base_price)}</strong>
            </span>
            <span>
              Logistica <strong>{formatCurrency(service.logistic_fee)}</strong>
            </span>
            <span>
              Estandar <strong>{formatCurrency(payments.standard)}</strong>
            </span>
            <span>
              Premium <strong>{formatCurrency(payments.premium)}</strong>
            </span>
            <span>
              Top <strong>{formatCurrency(payments.top)}</strong>
            </span>
          </div>

          <div className="admin-service-actions" aria-label="Acciones del servicio">
            <button
              type="button"
              className={openPanel === "edit" ? "active" : ""}
              onClick={() => togglePanel("edit")}
            >
              Editar servicio
            </button>
            <button
              type="button"
              className={openPanel === "mainImage" ? "active" : ""}
              onClick={() => togglePanel("mainImage")}
            >
              Foto principal
            </button>
            <button
              type="button"
              className={openPanel === "gallery" ? "active" : ""}
              onClick={() => togglePanel("gallery")}
            >
              Galeria
            </button>
            <button
              type="button"
              className={openPanel === "status" ? "active" : ""}
              onClick={() => togglePanel("status")}
            >
              Activar/Desactivar
            </button>
          </div>
        </div>
      </div>

      {openPanel ? (
        <div className="admin-service-panel">
          {openPanel === "edit" ? (
            <EditServiceForm
              serviceId={service.id}
              category={service.category}
              name={service.name}
              description={service.description || ""}
              publicPrice={service.public_price}
              logisticFee={service.logistic_fee}
              durationMinutes={service.duration_minutes}
              isFeatured={service.is_featured}
            />
          ) : null}

          {openPanel === "mainImage" ? (
            <ServiceMainImageForm
              serviceId={service.id}
              serviceName={service.name}
              imageUrl={service.image_url}
            />
          ) : null}

          {openPanel === "gallery" ? (
            <ServiceImageGalleryManager
              serviceId={service.id}
              images={service.gallery_images}
            />
          ) : null}

          {openPanel === "status" ? (
            <div className="admin-service-panel-inner">
              <div className="admin-service-panel-heading">
                <p>Estado del servicio</p>
                <span>Activa o desactiva la disponibilidad visible para clientas.</span>
              </div>
              <UpdateServiceStatusForm
                serviceId={service.id}
                currentStatus={service.status}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
