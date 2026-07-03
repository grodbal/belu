"use client"

import { useState } from "react"
import { mockServices, MockService } from "./mockData"
import { SectionHeader, FilterPills, Kicker, Drawer } from "./Shared"
import { Section } from "./Shell"

type CategoryFilter = "Todos" | "Lashes" | "Nails"

interface SectionServiciosProps {
  onNavigate: (s: Section) => void
}

export function SectionServicios({ onNavigate }: SectionServiciosProps) {
  const [filter, setFilter] = useState<CategoryFilter>("Todos")
  const [selectedService, setSelectedService] = useState<MockService | null>(null)

  const filtered = filter === "Todos" ? mockServices : mockServices.filter((s) => s.category === filter)

  return (
    <div className="proto-servicios">
      <SectionHeader
        kicker="Catalogo"
        title="Servicios"
        subtitle="Elige el servicio perfecto para ti y reserva en minutos."
      />

      <FilterPills<CategoryFilter>
        options={[
          { value: "Todos", label: "Todos" },
          { value: "Lashes", label: "Lashes" },
          { value: "Nails", label: "Nails" },
        ]}
        active={filter}
        onChange={setFilter}
      />

      <div className="proto-servicios-grid">
        {filtered.map((svc) => (
          <div key={svc.id} className="proto-service-full-card">
            <div className="proto-service-full-top">
              <span className="proto-service-chip">{svc.tag}</span>
              <div className="proto-service-full-badges">
                {svc.popular && <span className="proto-popular-chip">Popular</span>}
                {svc.isNew && <span className="proto-new-chip">Nuevo</span>}
              </div>
            </div>
            <h3 className="proto-service-full-name">{svc.name}</h3>
            <p className="proto-service-full-desc">{svc.shortDescription}</p>
            <div className="proto-service-full-meta">
              <span>Desde S/ {svc.priceFrom}</span>
              <span className="proto-dot">·</span>
              <span>{svc.duration}</span>
            </div>
            <div className="proto-service-full-actions">
              <button
                className="proto-btn-ghost proto-btn-ghost--sm"
                onClick={() => setSelectedService(svc)}
              >
                Ver detalle
              </button>
              <button
                className="proto-btn-primary proto-btn-primary--sm"
                onClick={() => onNavigate("reservar")}
              >
                Reservar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Drawer detalle de servicio */}
      <Drawer
        open={!!selectedService}
        onClose={() => setSelectedService(null)}
        title={selectedService?.name}
      >
        {selectedService && (
          <div className="proto-service-detail">
            <Kicker>{selectedService.tag}</Kicker>
            <h3>{selectedService.name}</h3>
            <p className="proto-service-detail-desc">{selectedService.description}</p>
            <div className="proto-service-detail-facts">
              <div>
                <span>Precio desde</span>
                <strong>S/ {selectedService.priceFrom}</strong>
              </div>
              <div>
                <span>Duracion estimada</span>
                <strong>{selectedService.duration}</strong>
              </div>
              <div>
                <span>Categoria</span>
                <strong>{selectedService.category}</strong>
              </div>
            </div>
            <div className="proto-mock-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Galeria de trabajos: seccion futura, requiere storage de imagenes por servicio.</span>
            </div>
            <button
              className="proto-btn-primary"
              onClick={() => { setSelectedService(null); onNavigate("reservar") }}
            >
              Reservar este servicio
            </button>
          </div>
        )}
      </Drawer>
    </div>
  )
}
