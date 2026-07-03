"use client"

import { useState } from "react"
import { mockFavorites, MockBeluer } from "./mockData"
import { SectionHeader, Avatar, EmptyState } from "./Shared"
import { Section } from "./Shell"

interface SectionFavoritasProps {
  onNavigate: (s: Section) => void
}

export function SectionFavoritas({ onNavigate }: SectionFavoritasProps) {
  const [favorites, setFavorites] = useState<MockBeluer[]>(mockFavorites)

  function removeFavorite(id: string) {
    setFavorites((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="proto-favoritas">
      <SectionHeader
        kicker="Guardadas"
        title="Favoritas"
        subtitle="Las Beluers que guardaste para tu proxima reserva."
      />

      {favorites.length === 0 ? (
        <EmptyState
          title="Aun no tienes Beluers favoritas"
          description="Cuando reserves con una Beluer, podras guardarla aqui para encontrarla rapido."
          action={{ label: "Explorar Beluers", onClick: () => onNavigate("beluers") }}
        />
      ) : (
        <div className="proto-beluers-grid">
          {favorites.map((b) => (
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
                <button
                  className="proto-fav-remove"
                  title="Quitar de favoritas"
                  onClick={() => removeFavorite(b.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#E60023" stroke="#E60023" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
              <div className="proto-beluer-full-zones">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span>{b.zones.join(", ")}</span>
              </div>
              <div className="proto-beluer-full-actions">
                <button className="proto-btn-ghost proto-btn-ghost--sm" onClick={() => onNavigate("beluers")}>
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
    </div>
  )
}
