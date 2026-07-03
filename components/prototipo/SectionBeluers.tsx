"use client"

import { useState } from "react"
import { mockBeluers, MockBeluer } from "./mockData"
import { SectionHeader, FilterPills, Avatar, Kicker, Drawer } from "./Shared"
import { Section } from "./Shell"

type AvailFilter = "Todas" | "Disponibles"
type SpecFilter = "Todas" | "Lashes" | "Nails"

interface SectionBeluersProps {
  onNavigate: (s: Section) => void
}

export function SectionBeluers({ onNavigate }: SectionBeluersProps) {
  const [availFilter, setAvailFilter] = useState<AvailFilter>("Todas")
  const [specFilter, setSpecFilter] = useState<SpecFilter>("Todas")
  const [selectedBeluer, setSelectedBeluer] = useState<MockBeluer | null>(null)

  const filtered = mockBeluers.filter((b) => {
    const availOk = availFilter === "Todas" || b.available
    const specOk = specFilter === "Todas" || b.specialties.includes(specFilter)
    return availOk && specOk
  })

  return (
    <div className="proto-beluers-section">
      <SectionHeader
        kicker="Especialistas"
        title="Beluers"
        subtitle="Conoce a las profesionales que te atenderan en casa."
      />

      <div className="proto-beluers-filters">
        <FilterPills<SpecFilter>
          options={[
            { value: "Todas", label: "Todas" },
            { value: "Lashes", label: "Lashes" },
            { value: "Nails", label: "Nails" },
          ]}
          active={specFilter}
          onChange={setSpecFilter}
        />
        <FilterPills<AvailFilter>
          options={[
            { value: "Todas", label: "Todas" },
            { value: "Disponibles", label: "Disponibles ahora" },
          ]}
          active={availFilter}
          onChange={setAvailFilter}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="proto-empty">
          <div className="proto-empty-icon"><span className="proto-star-lg">✦</span></div>
          <strong className="proto-empty-title">No encontramos Beluers para este filtro</strong>
          <p className="proto-empty-desc">Intenta con otro filtro o revisa mas tarde.</p>
        </div>
      ) : (
        <div className="proto-beluers-grid">
          {filtered.map((b) => (
            <div key={b.id} className="proto-beluer-full-card">
              <div className="proto-beluer-full-top">
                <Avatar initials={b.initials} size="lg" />
                <div className="proto-beluer-full-info">
                  <div className="proto-beluer-name-row">
                    <strong className="proto-beluer-full-name">{b.name}</strong>
                    {b.attended && <span className="proto-attended-chip">Ya te atendio</span>}
                  </div>
                  <span className="proto-beluer-rating">★ {b.rating} ({b.reviewCount} resenas)</span>
                  <div className="proto-beluer-tags">
                    {b.specialties.map((s) => (
                      <span key={s} className="proto-tag">{s}</span>
                    ))}
                  </div>
                </div>
                <span className={`proto-avail-dot${b.available ? " proto-avail-dot--on" : ""}`} title={b.available ? "Disponible" : "No disponible"} />
              </div>

              <div className="proto-beluer-full-zones">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span>{b.zones.join(", ")}</span>
              </div>

              <div className="proto-beluer-full-stats">
                <div>
                  <strong>{b.servicesCount}</strong>
                  <span>Servicios</span>
                </div>
                <div>
                  <strong>{b.rating}</strong>
                  <span>Rating</span>
                </div>
                <div>
                  <strong>{b.reviewCount}</strong>
                  <span>Resenas</span>
                </div>
              </div>

              <div className="proto-beluer-full-actions">
                <button className="proto-btn-ghost proto-btn-ghost--sm" onClick={() => setSelectedBeluer(b)}>
                  Ver perfil
                </button>
                {b.available && (
                  <button className="proto-btn-primary proto-btn-primary--sm" onClick={() => onNavigate("reservar")}>
                    Reservar con ella
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer perfil de Beluer */}
      <Drawer
        open={!!selectedBeluer}
        onClose={() => setSelectedBeluer(null)}
        title="Perfil de Beluer"
      >
        {selectedBeluer && (
          <div className="proto-beluer-profile">
            <div className="proto-beluer-profile-hero">
              <Avatar initials={selectedBeluer.initials} size="lg" />
              <div>
                <div className="proto-beluer-name-row">
                  <h3>{selectedBeluer.name}</h3>
                  {selectedBeluer.attended && <span className="proto-attended-chip">Ya te atendio</span>}
                </div>
                <span className="proto-beluer-rating">★ {selectedBeluer.rating} ({selectedBeluer.reviewCount} resenas)</span>
                <span className={`proto-avail-label${selectedBeluer.available ? " proto-avail-label--on" : ""}`}>
                  {selectedBeluer.available ? "Disponible" : "No disponible ahora"}
                </span>
              </div>
            </div>

            <p className="proto-beluer-bio">{selectedBeluer.bio}</p>

            <div className="proto-beluer-profile-facts">
              <div>
                <Kicker>Especialidades</Kicker>
                <div className="proto-beluer-tags" style={{ marginTop: "0.4rem" }}>
                  {selectedBeluer.specialties.map((s) => (
                    <span key={s} className="proto-tag">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <Kicker>Zonas</Kicker>
                <p style={{ marginTop: "0.4rem", fontSize: "0.84rem", color: "#6B6661" }}>
                  {selectedBeluer.zones.join(", ")}
                </p>
              </div>
              <div>
                <Kicker>Servicios realizados</Kicker>
                <p style={{ marginTop: "0.4rem", fontSize: "0.84rem", color: "#6B6661" }}>
                  {selectedBeluer.servicesCount} servicios
                </p>
              </div>
            </div>

            <div className="proto-mock-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Galeria de trabajos y resenas de clientas: funcionalidad futura que requiere modelo de datos.</span>
            </div>

            {selectedBeluer.available && (
              <button
                className="proto-btn-primary"
                onClick={() => { setSelectedBeluer(null); onNavigate("reservar") }}
              >
                Reservar con {selectedBeluer.name.split(" ")[0]}
              </button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
