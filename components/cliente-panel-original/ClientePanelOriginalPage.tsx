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

const navItems: {
  id: PanelSection;
  label: string;
}[] = [
  { id: "dashboard", label: "Inicio" },
  { id: "reserva", label: "Nueva Reserva" },
  { id: "beluers", label: "Especialistas" },
  { id: "favoritas", label: "Favoritas" },
  { id: "historial", label: "Historial" },
  { id: "pagos", label: "Pagos" },
  { id: "perfil", label: "Mi Perfil" },
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
        ☰
      </button>

      <div className="cliente-panel-app">
        <aside
          className={`cliente-panel-sidebar ${
            sidebarOpen ? "cliente-panel-sidebar-open" : ""
          }`}
        >
          <div className="cliente-panel-sidebar-logo">
            belu<span>.</span>
          </div>

          <ul className="cliente-panel-sidebar-nav">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={activeSection === item.id ? "active" : ""}
                  onClick={() => goToSection(item.id)}
                >
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
                <div className="cliente-panel-card">
                  <h3>Especialistas</h3>
                  <p>Conoce a todas nuestras beluers verificadas.</p>
                  <button
                    className="cliente-panel-btn-ghost"
                    type="button"
                    onClick={() => goToSection("beluers")}
                  >
                    Ver especialistas →
                  </button>
                </div>

                <div className="cliente-panel-card">
                  <h3>Tus favoritas</h3>
                  <p>Accede rápido a las especialistas que más te gustan.</p>
                  <button
                    className="cliente-panel-btn-ghost"
                    type="button"
                    onClick={() => goToSection("favoritas")}
                  >
                    Ver favoritas →
                  </button>
                </div>

                <div className="cliente-panel-card">
                  <h3>Historial visual</h3>
                  <p>Revisa los resultados de tus citas anteriores.</p>
                  <button
                    className="cliente-panel-btn-ghost"
                    type="button"
                    onClick={() => goToSection("historial")}
                  >
                    Ver historial →
                  </button>
                </div>

                <div className="cliente-panel-card">
                  <h3>Últimos pagos</h3>
                  <p>Tu transacción más reciente: S/. 150.</p>
                  <button
                    className="cliente-panel-btn-ghost"
                    type="button"
                    onClick={() => goToSection("pagos")}
                  >
                    Ver pagos →
                  </button>
                </div>
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
