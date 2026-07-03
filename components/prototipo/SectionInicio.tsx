"use client"

import { mockClient, mockServices, mockBeluers } from "./mockData"
import { Kicker, ReminderCard, TrustCard, StatusBadge } from "./Shared"
import { Section } from "./Shell"

interface SectionInicioProps {
  onNavigate: (s: Section) => void
}

export function SectionInicio({ onNavigate }: SectionInicioProps) {
  const { firstName, nextAppointment, showReminderRetoque, reminderDays, reminderService, bookingCount, favoritesCount } = mockClient
  const featuredServices = mockServices.slice(0, 4)
  const featuredBeluers = mockBeluers.filter((b) => b.available).slice(0, 4)

  return (
    <div className="proto-inicio">
      {/* ── Topbar pill ──────────────────────────────────── */}
      <div className="proto-topbar-pill">
        <div className="proto-topbar-location">
          <span className="proto-online-dot" />
          <span>Lima, Miraflores</span>
        </div>
        <div className="proto-topbar-actions">
          <button
            className="proto-icon-btn"
            title="Mis favoritas"
            onClick={() => onNavigate("favoritas")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <div className="proto-avatar proto-avatar--sm">{mockClient.initials}</div>
        </div>
      </div>

      {/* ── Greeting ─────────────────────────────────────── */}
      <div className="proto-greeting">
        <h1>Hola, {firstName} ✦</h1>
        <p>Lista para lucir increible, cuando quieras.</p>
      </div>

      {/* ── Reminder retoque ─────────────────────────────── */}
      {showReminderRetoque && (
        <ReminderCard
          days={reminderDays}
          service={reminderService}
          onBook={() => onNavigate("reservar")}
        />
      )}

      {/* ── Card protagonista: próxima cita ──────────────── */}
      {nextAppointment ? (
        <div className="proto-next-apt">
          {/* Panel oscuro izquierdo */}
          <div className="proto-next-apt-visual">
            <span className="proto-apt-kicker">Proxima cita</span>
            <strong className="proto-apt-service">{nextAppointment.service}</strong>
            <div className="proto-apt-beluer-row">
              <span className="proto-apt-avatar">{nextAppointment.beluerInitials}</span>
              <span className="proto-apt-beluer-name">{nextAppointment.beluer}</span>
            </div>
            <span className="proto-star-decoration">✦</span>
          </div>
          {/* Datos derecha */}
          <div className="proto-next-apt-content">
            <div className="proto-next-apt-header">
              <StatusBadge status={nextAppointment.status} />
              {nextAppointment.isExpress && <span className="proto-express-pill">Express</span>}
            </div>
            <h2>{nextAppointment.service}</h2>
            <div className="proto-apt-facts">
              <div>
                <span>Fecha</span>
                <strong>{nextAppointment.date}</strong>
              </div>
              <div>
                <span>Hora</span>
                <strong>{nextAppointment.time}</strong>
              </div>
              <div>
                <span>Ubicacion</span>
                <strong>{nextAppointment.address}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>S/ {nextAppointment.price}</strong>
              </div>
            </div>
            <div className="proto-apt-actions">
              <button className="proto-btn-primary" onClick={() => onNavigate("mis-citas")}>
                Ver detalle
              </button>
              <button className="proto-btn-ghost">Reagendar</button>
              <button className="proto-btn-link">Cancelar</button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state: sin cita */
        <div className="proto-no-apt">
          <div className="proto-no-apt-visual">
            <span className="proto-no-apt-star">✦</span>
            <span className="proto-no-apt-tagline">luce increible,<br />cuando quieras</span>
          </div>
          <div className="proto-no-apt-copy">
            <Kicker>Tu primer belu</Kicker>
            <h2>Tu momento belu esta a un tap de distancia.</h2>
            <p>Lashes, nails y mas — en la comodidad de tu casa.</p>
            <button className="proto-btn-primary" onClick={() => onNavigate("reservar")}>
              Reservar ahora
            </button>
            <button className="proto-btn-ghost" onClick={() => onNavigate("servicios")}>
              Ver servicios
            </button>
          </div>
        </div>
      )}

      {/* ── Acceso rapido ─────────────────────────────────── */}
      <div className="proto-quick-card">
        <Kicker>Acceso rapido</Kicker>
        <h2 className="proto-card-title">Que necesitas hoy?</h2>
        <div className="proto-quick-list">
          {[
            {
              label: "Repetir ultimo servicio",
              sub: nextAppointment?.service ?? "Ninguno aun",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 2.1l4 4-4 4" /><path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8" />
                  <path d="M7 21.9l-4-4 4-4" /><path d="M21 11.8v2a4 4 0 0 1-4 4H4.2" />
                </svg>
              ),
              onClick: () => onNavigate("reservar"),
            },
            {
              label: "Mis Beluers",
              sub: "Ver especialistas",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
              onClick: () => onNavigate("beluers"),
            },
            {
              label: "Explorar servicios",
              sub: "Lashes, Nails y mas",
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              ),
              onClick: () => onNavigate("servicios"),
            },
            {
              label: "Ver mi historial",
              sub: `${bookingCount} cita${bookingCount !== 1 ? "s" : ""} completada${bookingCount !== 1 ? "s" : ""}`,
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              ),
              onClick: () => onNavigate("mis-citas"),
            },
          ].map((item) => (
            <button key={item.label} className="proto-quick-btn" onClick={item.onClick}>
              <span className="proto-quick-icon">{item.icon}</span>
              <span className="proto-quick-text">
                <strong>{item.label}</strong>
                <span>{item.sub}</span>
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* ── Explorar servicios ────────────────────────────── */}
      <div className="proto-explore-block">
        <div className="proto-explore-header">
          <h2 className="proto-explore-title">Explorar servicios</h2>
          <button className="proto-link-btn" onClick={() => onNavigate("servicios")}>
            Ver todos
          </button>
        </div>
        <div className="proto-service-grid">
          {featuredServices.map((svc) => (
            <button
              key={svc.id}
              className="proto-service-card"
              onClick={() => onNavigate("servicios")}
            >
              <span className="proto-service-chip">{svc.tag}</span>
              <div className="proto-service-info">
                <strong>{svc.name}</strong>
                <small>Desde S/ {svc.priceFrom} · {svc.duration}</small>
                <em>{svc.shortDescription}</em>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Beluers destacadas ────────────────────────────── */}
      <div className="proto-beluers-block">
        <div className="proto-explore-header">
          <h2 className="proto-explore-title">Tus Beluers</h2>
          <button className="proto-link-btn" onClick={() => onNavigate("beluers")}>
            Ver todas
          </button>
        </div>
        <div className="proto-beluers-scroll">
          {featuredBeluers.map((b) => (
            <button
              key={b.id}
              className="proto-beluer-mini"
              onClick={() => onNavigate("beluers")}
            >
              <div className="proto-avatar proto-avatar--md">{b.initials}</div>
              <strong>{b.name}</strong>
              <small>{b.specialties[0]}</small>
              <span className="proto-rating">★ {b.rating}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Trust card ────────────────────────────────────── */}
      <TrustCard />

      {/* ── Stats discretas ───────────────────────────────── */}
      <div className="proto-stats-card">
        <div className="proto-stat-box">
          <strong>{bookingCount}</strong>
          <span>Citas completadas</span>
        </div>
        <div className="proto-stat-box">
          <strong>{favoritesCount}</strong>
          <span>Beluers favoritas</span>
        </div>
        <div className="proto-stat-box">
          <strong>4.9</strong>
          <span>Promedio de calidad</span>
        </div>
        <div className="proto-stat-box">
          <strong>21</strong>
          <span>Dias de duracion media</span>
        </div>
      </div>
    </div>
  )
}
