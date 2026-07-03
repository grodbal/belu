"use client"

import { useState } from "react"
import { mockClient } from "./mockData"

export type Section =
  | "inicio"
  | "reservar"
  | "mis-citas"
  | "servicios"
  | "beluers"
  | "favoritas"
  | "pagos"
  | "perfil"
  | "ayuda"

interface ShellProps {
  activeSection: Section
  onNavigate: (s: Section) => void
  children: React.ReactNode
}

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode; highlight?: boolean }[] = [
  {
    id: "inicio",
    label: "Inicio",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "reservar",
    label: "Reservar",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
    highlight: true,
  },
  {
    id: "mis-citas",
    label: "Mis citas",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: "servicios",
    label: "Servicios",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
  },
  {
    id: "beluers",
    label: "Beluers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "favoritas",
    label: "Favoritas",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    id: "pagos",
    label: "Pagos",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    id: "perfil",
    label: "Perfil",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "ayuda",
    label: "Ayuda",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
]

const BOTTOM_NAV: { id: Section; label: string; icon: React.ReactNode; highlight?: boolean }[] = [
  NAV_ITEMS[0], // inicio
  NAV_ITEMS[1], // reservar
  NAV_ITEMS[2], // mis-citas
  NAV_ITEMS[4], // beluers
  NAV_ITEMS[7], // perfil
]

export function ProtoShell({ activeSection, onNavigate, children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="proto-shell">
      {/* ── Sidebar desktop ─────────────────────────────── */}
      <aside className="proto-sidebar">
        <div className="proto-sidebar-logo">
          <span className="proto-logo-mark">belu</span>
          <span className="proto-logo-star">✦</span>
        </div>

        <nav className="proto-sidebar-nav">
          <div className="proto-sidebar-group">
            {NAV_ITEMS.slice(0, 2).map((item) => (
              <button
                key={item.id}
                className={`proto-nav-btn${activeSection === item.id ? " proto-nav-btn--active" : ""}${item.highlight ? " proto-nav-btn--cta" : ""}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="proto-nav-icon">{item.icon}</span>
                <span className="proto-nav-label">{item.label}</span>
                {item.highlight && <span className="proto-nav-cta-dot" />}
              </button>
            ))}
          </div>

          <div className="proto-sidebar-group">
            <p className="proto-sidebar-section-label">Mi espacio</p>
            {NAV_ITEMS.slice(2, 7).map((item) => (
              <button
                key={item.id}
                className={`proto-nav-btn${activeSection === item.id ? " proto-nav-btn--active" : ""}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="proto-nav-icon">{item.icon}</span>
                <span className="proto-nav-label">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="proto-sidebar-group proto-sidebar-group--footer">
            {NAV_ITEMS.slice(7).map((item) => (
              <button
                key={item.id}
                className={`proto-nav-btn${activeSection === item.id ? " proto-nav-btn--active" : ""}${item.id === "ayuda" ? " proto-nav-btn--muted" : ""}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="proto-nav-icon">{item.icon}</span>
                <span className="proto-nav-label">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="proto-sidebar-user">
          <div className="proto-sidebar-avatar">{mockClient.initials}</div>
          <div className="proto-sidebar-user-info">
            <strong>{mockClient.firstName}</strong>
            <span>Clienta belu</span>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <main className="proto-main">
        {children}
      </main>

      {/* ── Bottom nav mobile ────────────────────────────── */}
      <nav className="proto-bottom-nav">
        {BOTTOM_NAV.map((item) => (
          <button
            key={item.id}
            className={`proto-bottom-btn${activeSection === item.id ? " proto-bottom-btn--active" : ""}${item.highlight ? " proto-bottom-btn--cta" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="proto-bottom-icon">{item.icon}</span>
            <span className="proto-bottom-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
