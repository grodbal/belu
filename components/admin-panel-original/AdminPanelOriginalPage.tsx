"use client";

import { useState } from "react";

type AdminSection =
  | "dashboard"
  | "beluers"
  | "servicios"
  | "reservas"
  | "pagos"
  | "fotos"
  | "metricas";

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
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
  servicios: (
    <svg viewBox="0 0 24 24">
      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.1 5.9 20.6l1.4-6.8-5.1-4.7 6.9-.8L12 2z" />
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
  pagos: (
    <svg viewBox="0 0 24 24">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  fotos: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  metricas: (
    <svg viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
};

const navItems: {
  id: AdminSection;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "dashboard", label: "Inicio", icon: icons.dashboard },
  { id: "beluers", label: "Beluers", icon: icons.beluers },
  { id: "servicios", label: "Servicios", icon: icons.servicios },
  { id: "reservas", label: "Reservas", icon: icons.reservas },
  { id: "pagos", label: "Pagos", icon: icons.pagos },
  { id: "fotos", label: "Fotos", icon: icons.fotos },
  { id: "metricas", label: "Métricas", icon: icons.metricas },
];

const adminAlerts = [
  {
    title: "3 Beluers pendientes de aprobación",
    text: "Revisa sus perfiles, experiencia, zonas y portafolio antes de activarlas.",
    action: "Revisar Beluers",
    section: "beluers" as AdminSection,
  },
  {
    title: "5 fotos pendientes de validación",
    text: "Las fotos nuevas deben aprobarse antes de aparecer en el catálogo público.",
    action: "Validar fotos",
    section: "fotos" as AdminSection,
  },
  {
    title: "2 reservas necesitan seguimiento",
    text: "Hay reservas gestionadas que aún no tienen Beluer asignada.",
    action: "Ver reservas",
    section: "reservas" as AdminSection,
  },
];

export default function AdminPanelOriginalPage() {
  const [activeSection, setActiveSection] =
    useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const goToSection = (section: AdminSection) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  return (
    <div className="admin-panel-shell">
      <button
        className="admin-panel-menu-btn"
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

      <div className="admin-panel-app">
        <aside
          className={`admin-panel-sidebar ${
            sidebarOpen ? "admin-panel-sidebar-open" : ""
          }`}
        >
          <div className="admin-panel-sidebar-logo">
            <img src="/logo-belu-red.png" alt="belu" />
          </div>

          <div className="admin-panel-profile-mini">
            <div className="admin-panel-profile-avatar">AD</div>
            <div>
              <strong>Admin belu</strong>
              <span>Centro de control ✦</span>
            </div>
          </div>

          <ul className="admin-panel-sidebar-nav">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={activeSection === item.id ? "active" : ""}
                  onClick={() => goToSection(item.id)}
                >
                  <span className="admin-panel-nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="admin-panel-sidebar-footer">
            <a href="/">← Volver a somosbelu.pe</a>
          </div>
        </aside>

        <main className="admin-panel-main">
          {activeSection === "dashboard" && (
            <section className="admin-panel-section active">
              <div className="admin-panel-top-bar">
                <div className="admin-panel-greeting">
                  <h1>Panel Admin ✦</h1>
                  <p>Control operativo de belu: calidad, reservas, pagos y crecimiento.</p>
                </div>

                <AdminPill />
              </div>

              <div className="admin-panel-kpi-grid">
                <KpiCard label="Reservas hoy" value="8" />
                <KpiCard label="Beluers activas" value="12" />
                <KpiCard label="Ingresos mes" value="S/ 4,860" />
                <KpiCard label="Fotos pendientes" value="5" />
              </div>

              <div className="admin-panel-dashboard-grid">
                <div className="admin-panel-card large">
                  <div className="admin-panel-card-header">
                    <div>
                      <h2>Prioridades operativas</h2>
                      <p>Acciones que mantienen la calidad y velocidad del sistema.</p>
                    </div>
                  </div>

                  <div className="admin-panel-alert-list">
                    {adminAlerts.map((alert) => (
                      <article className="admin-panel-alert-card" key={alert.title}>
                        <div>
                          <span>Atención requerida</span>
                          <h3>{alert.title}</h3>
                          <p>{alert.text}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => goToSection(alert.section)}
                        >
                          {alert.action}
                        </button>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="admin-panel-card">
                  <h2>Salud del sistema</h2>
                  <p>Indicadores rápidos del marketplace gestionado.</p>

                  <div className="admin-panel-health-list">
                    <div>
                      <span>Asignación promedio</span>
                      <strong>18 min</strong>
                    </div>

                    <div>
                      <span>Reservas completadas</span>
                      <strong>92%</strong>
                    </div>

                    <div>
                      <span>Churn estimado</span>
                      <strong>12%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection !== "dashboard" && (
            <section className="admin-panel-section active">
              <div className="admin-panel-top-bar">
                <div className="admin-panel-greeting">
                  <h1>{getSectionTitle(activeSection)}</h1>
                  <p>Esta sección se construirá en el siguiente bloque.</p>
                </div>

                <AdminPill />
              </div>

              <div className="admin-panel-card">
                <h2>{getSectionTitle(activeSection)}</h2>
                <p>
                  Panel base conectado correctamente. Esta sección luego
                  gestionará datos reales desde Supabase.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>

      {sidebarOpen && (
        <button
          className="admin-panel-backdrop"
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        />
      )}
    </div>
  );
}

function AdminPill() {
  return (
    <div className="admin-panel-user-pill">
      <div className="admin-panel-avatar">AD</div>
      <span>Admin belu</span>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-panel-kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getSectionTitle(section: AdminSection) {
  const titles: Record<AdminSection, string> = {
    dashboard: "Inicio",
    beluers: "Beluers",
    servicios: "Servicios",
    reservas: "Reservas",
    pagos: "Pagos",
    fotos: "Fotos",
    metricas: "Métricas",
  };

  return titles[section];
}