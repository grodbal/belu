"use client";

import { useState } from "react";

type PanelSection =
  | "dashboard"
  | "reserva"
  | "beluers"
  | "favoritas"
  | "historial"
  | "pagos"
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
  reserva: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  beluers: (
    <svg viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  favoritas: (
    <svg viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l7.78-7.78a5.5 5.5 0 0 0 1.06-8.84z" />
    </svg>
  ),
  historial: (
    <svg viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  pagos: (
    <svg viewBox="0 0 24 24">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
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
  id: PanelSection;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "dashboard", label: "Inicio", icon: icons.dashboard },
  { id: "reserva", label: "Nueva Reserva", icon: icons.reserva },
  { id: "beluers", label: "Especialistas", icon: icons.beluers },
  { id: "favoritas", label: "Favoritas", icon: icons.favoritas },
  { id: "historial", label: "Historial", icon: icons.historial },
  { id: "pagos", label: "Pagos", icon: icons.pagos },
  { id: "perfil", label: "Mi Perfil", icon: icons.perfil },
];

export default function ClientePanelOriginalPage() {
  const [activeSection, setActiveSection] = useState<PanelSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const goToSection = (section: PanelSection) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  return (
    <div className="cliente-panel-shell">
      <button
        className="cliente-panel-menu-btn"
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

      <div className="cliente-panel-app">
        <aside
          className={`cliente-panel-sidebar ${
            sidebarOpen ? "cliente-panel-sidebar-open" : ""
          }`}
        >
          <div className="cliente-panel-sidebar-logo">
            <img src="/logo-belu-red.png" alt="belu" />
          </div>

          <ul className="cliente-panel-sidebar-nav">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={activeSection === item.id ? "active" : ""}
                  onClick={() => goToSection(item.id)}
                >
                  <span className="cliente-panel-nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="cliente-panel-sidebar-footer">
            <a href="/">← Volver a somosbelu.pe</a>
          </div>
        </aside>

        <main className="cliente-panel-main">
          {activeSection === "dashboard" && (
            <section className="cliente-panel-section active">
              <div className="cliente-panel-top-bar">
                <div className="cliente-panel-greeting">
                  <h1>Bienvenida, María ✦</h1>
                  <p>Aún no tienes reservas activas</p>
                </div>

                <div className="cliente-panel-user-pill">
                  <div className="cliente-panel-avatar">MC</div>
                  <span>María Claudia R.</span>
                </div>
              </div>

              <div className="cliente-panel-empty-state">
                <h2>No tienes ninguna reserva activa.</h2>
                <p>
                  Tu brillo no espera. Es tu momento de consentirte y recordarle
                  al mundo lo increíble que eres.
                </p>

                <button
                  className="cliente-panel-btn-r"
                  type="button"
                  onClick={() => goToSection("reserva")}
                >
                  Agendar mi primera cita ✦
                </button>
              </div>

              <div className="cliente-panel-card-grid">
                <DashboardCard
                  icon={icons.beluers}
                  title="Especialistas"
                  text="Conoce a todas nuestras beluers verificadas."
                  button="Ver especialistas →"
                  onClick={() => goToSection("beluers")}
                />

                <DashboardCard
                  icon={icons.favoritas}
                  title="Tus favoritas"
                  text="Accede rápido a las especialistas que más te gustan."
                  button="Ver favoritas →"
                  onClick={() => goToSection("favoritas")}
                />

                <DashboardCard
                  icon={icons.historial}
                  title="Historial visual"
                  text="Revisa los resultados de tus citas anteriores."
                  button="Ver historial →"
                  onClick={() => goToSection("historial")}
                />

                <DashboardCard
                  icon={icons.pagos}
                  title="Últimos pagos"
                  text="Tu transacción más reciente: S/. 150."
                  button="Ver pagos →"
                  onClick={() => goToSection("pagos")}
                />
              </div>
            </section>
          )}

          {activeSection !== "dashboard" && (
            <section className="cliente-panel-section active">
              <div className="cliente-panel-top-bar">
                <div className="cliente-panel-greeting">
                  <h1>{getSectionTitle(activeSection)}</h1>
                  <p>Esta sección se construirá en el siguiente bloque.</p>
                </div>

                <div className="cliente-panel-user-pill">
                  <div className="cliente-panel-avatar">MC</div>
                  <span>María Claudia R.</span>
                </div>
              </div>

              <div className="cliente-panel-card">
                <h3>{getSectionTitle(activeSection)}</h3>
                <p>
                  Panel base conectado correctamente. El siguiente paso será
                  migrar esta sección desde el HTML original, sin romper las
                  landings existentes.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>

      {sidebarOpen && (
        <button
          className="cliente-panel-backdrop"
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        />
      )}
    </div>
  );
}

function DashboardCard({
  icon,
  title,
  text,
  button,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="cliente-panel-card">
      <h3>
        <span className="cliente-panel-card-icon">{icon}</span>
        {title}
      </h3>
      <p>{text}</p>
      <button className="cliente-panel-btn-ghost" type="button" onClick={onClick}>
        {button}
      </button>
    </div>
  );
}

function getSectionTitle(section: PanelSection) {
  const titles: Record<PanelSection, string> = {
    dashboard: "Inicio",
    reserva: "Agendar nueva cita",
    beluers: "Nuestras Especialistas",
    favoritas: "Tus beluers favoritas",
    historial: "Tu historial",
    pagos: "Historial de pagos",
    perfil: "Mi perfil",
  };

  return titles[section];
}