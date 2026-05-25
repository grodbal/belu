"use client";

import { useState } from "react";

type BeluerSection =
  | "dashboard"
  | "reservas"
  | "servicios"
  | "portafolio"
  | "ingresos"
  | "perfil";

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  reservas: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  servicios: (
    <svg viewBox="0 0 24 24">
      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.1 5.9 20.6l1.4-6.8-5.1-4.7 6.9-.8L12 2z" />
    </svg>
  ),
  portafolio: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  ingresos: (
    <svg viewBox="0 0 24 24">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  perfil: (
    <svg viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const navItems: {
  id: BeluerSection;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "dashboard", label: "Inicio", icon: icons.dashboard },
  { id: "reservas", label: "Reservas", icon: icons.reservas },
  { id: "servicios", label: "Mis Servicios", icon: icons.servicios },
  { id: "portafolio", label: "Portafolio", icon: icons.portafolio },
  { id: "ingresos", label: "Ingresos", icon: icons.ingresos },
  { id: "perfil", label: "Mi Perfil", icon: icons.perfil },
];

const reservasPendientes = [
  {
    id: "BLU-RSV-001",
    clienta: "María Claudia R.",
    servicio: "Efecto Rímel + Depilación con hilo",
    distrito: "Miraflores",
    fecha: "2026-05-18",
    hora: "15:30",
    total: 165,
    estado: "Pendiente de aceptar",
  },
  {
    id: "BLU-RSV-002",
    clienta: "Valeria M.",
    servicio: "Lifting de pestañas",
    distrito: "San Isidro",
    fecha: "2026-05-19",
    hora: "11:00",
    total: 120,
    estado: "Pendiente de aceptar",
  },
];

export default function BeluerPanelOriginalPage() {
  const [activeSection, setActiveSection] =
    useState<BeluerSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const goToSection = (section: BeluerSection) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  return (
    <div className="beluer-panel-shell">
      <button
        className="beluer-panel-menu-btn"
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <svg viewBox="0 0 24 24">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="beluer-panel-app">
        <aside
          className={`beluer-panel-sidebar ${
            sidebarOpen ? "beluer-panel-sidebar-open" : ""
          }`}
        >
          <div className="beluer-panel-sidebar-logo">
            <img src="/logo-belu-red.png" alt="belu" />
          </div>

          <div className="beluer-panel-profile-mini">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80"
              alt="Andrea Robles"
            />
            <div>
              <strong>Andrea Robles</strong>
              <span>Beluer Top ✦</span>
            </div>
          </div>

          <ul className="beluer-panel-sidebar-nav">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={activeSection === item.id ? "active" : ""}
                  onClick={() => goToSection(item.id)}
                >
                  <span className="beluer-panel-nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="beluer-panel-sidebar-footer">
            <a href="/">← Volver a somosbelu.pe</a>
          </div>
        </aside>

        <main className="beluer-panel-main">
          {activeSection === "dashboard" && (
            <section className="beluer-panel-section active">
              <div className="beluer-panel-top-bar">
                <div className="beluer-panel-greeting">
                  <h1>Hola, Andrea ✦</h1>
                  <p>Este es tu centro de control como Beluer.</p>
                </div>

                <BeluerPill />
              </div>

              <div className="beluer-panel-kpi-grid">
                <KpiCard label="Reservas pendientes" value="2" />
                <KpiCard label="Ingresos del mes" value="S/ 1,280" />
                <KpiCard label="Servicios realizados" value="12" />
                <KpiCard label="Rating promedio" value="5.0" />
              </div>

              <div className="beluer-panel-dashboard-grid">
                <div className="beluer-panel-card large">
                  <div className="beluer-panel-card-header">
                    <div>
                      <h2>Solicitudes disponibles</h2>
                      <p>Acepta las reservas que encajan con tu agenda.</p>
                    </div>
                  </div>

                  <div className="beluer-panel-reservas-list">
                    {reservasPendientes.map((reserva) => (
                      <article
                        className="beluer-panel-reserva-card"
                        key={reserva.id}
                      >
                        <div>
                          <span>{reserva.estado}</span>
                          <h3>{reserva.servicio}</h3>
                          <p>
                            {reserva.clienta} · {reserva.distrito}
                          </p>
                          <small>
                            {reserva.fecha} · {reserva.hora}
                          </small>
                        </div>

                        <div className="beluer-panel-reserva-actions">
                          <strong>S/ {reserva.total}</strong>
                          <button type="button">Aceptar</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="beluer-panel-card">
                  <h2>Meta semanal</h2>
                  <p>Vas 65% hacia tu meta de ingresos.</p>

                  <div className="beluer-panel-progress">
                    <span style={{ width: "65%" }} />
                  </div>

                  <strong>S/ 650 de S/ 1,000</strong>
                </div>
              </div>
            </section>
          )}

          {activeSection !== "dashboard" && (
            <section className="beluer-panel-section active">
              <div className="beluer-panel-top-bar">
                <div className="beluer-panel-greeting">
                  <h1>{getSectionTitle(activeSection)}</h1>
                  <p>Esta sección se construirá en el siguiente bloque.</p>
                </div>

                <BeluerPill />
              </div>

              <div className="beluer-panel-card">
                <h2>{getSectionTitle(activeSection)}</h2>
                <p>
                  Panel base conectado correctamente. En esta sección la Beluer
                  podrá gestionar su información real más adelante.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>

      {sidebarOpen && (
        <button
          className="beluer-panel-backdrop"
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        />
      )}
    </div>
  );
}

function BeluerPill() {
  return (
    <div className="beluer-panel-user-pill">
      <div className="beluer-panel-avatar">AR</div>
      <span>Andrea Robles</span>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="beluer-panel-kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getSectionTitle(section: BeluerSection) {
  const titles: Record<BeluerSection, string> = {
    dashboard: "Inicio",
    reservas: "Reservas",
    servicios: "Mis servicios",
    portafolio: "Portafolio",
    ingresos: "Ingresos",
    perfil: "Mi perfil",
  };

  return titles[section];
}