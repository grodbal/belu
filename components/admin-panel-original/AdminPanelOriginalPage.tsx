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
  type AdminBeluerEstado = "pendiente" | "aprobada" | "rechazada" | "pausada";

type AdminBeluerNivel = "Nueva" | "Verificada" | "Top ✦";

type AdminBeluer = {
  id: string;
  nombre: string;
  instagram: string;
  telefono: string;
  distrito: string;
  servicios: string[];
  experiencia: number;
  estado: AdminBeluerEstado;
  nivel: AdminBeluerNivel;
  rating: number;
  reservas: number;
  foto: string;
  notaRevision: string;
};

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
const beluersIniciales: AdminBeluer[] = [
  {
    id: "BEL-001",
    nombre: "Andrea Robles",
    instagram: "@andrea.lashes",
    telefono: "+51 987 654 321",
    distrito: "Miraflores",
    servicios: ["Clásicas", "Efecto Rímel", "Volumen 3D", "Lifting"],
    experiencia: 4,
    estado: "aprobada",
    nivel: "Top ✦",
    rating: 5,
    reservas: 120,
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
    notaRevision:
      "Portafolio sólido, buena técnica en volumen y acabados naturales.",
  },
  {
    id: "BEL-002",
    nombre: "Camila V.",
    instagram: "@camiv.nails",
    telefono: "+51 955 222 111",
    distrito: "San Isidro",
    servicios: ["Esmaltado Gel", "Rubber", "Softgel", "Clásicas"],
    experiencia: 3,
    estado: "aprobada",
    nivel: "Verificada",
    rating: 4.9,
    reservas: 80,
    foto: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=80",
    notaRevision:
      "Perfil mixto interesante. Buena opción para lashes y nails en zonas premium.",
  },
  {
    id: "BEL-003",
    nombre: "Sofía T.",
    instagram: "@sofia.beauty",
    telefono: "+51 944 888 777",
    distrito: "Surco",
    servicios: ["Rubber", "Polygel", "Efecto Aura"],
    experiencia: 2,
    estado: "pendiente",
    nivel: "Nueva",
    rating: 0,
    reservas: 0,
    foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
    notaRevision:
      "Falta validar calidad de portafolio y disponibilidad real en Surco.",
  },
  {
    id: "BEL-004",
    nombre: "Valeria M.",
    instagram: "@valeria.lashpro",
    telefono: "+51 966 111 333",
    distrito: "La Molina",
    servicios: ["Volumen 4D", "Mega Volumen 5D", "Whispy"],
    experiencia: 5,
    estado: "pendiente",
    nivel: "Nueva",
    rating: 0,
    reservas: 0,
    foto: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&q=80",
    notaRevision:
      "Buen potencial para servicios premium. Revisar higiene visual del portafolio.",
  },
  {
    id: "BEL-005",
    nombre: "Lucía P.",
    instagram: "@lucia.nailstudio",
    telefono: "+51 999 555 444",
    distrito: "Barranco",
    servicios: ["Acrílicas", "Gel de Construcción", "Pedicura Gel"],
    experiencia: 6,
    estado: "pausada",
    nivel: "Verificada",
    rating: 4.7,
    reservas: 42,
    foto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&q=80",
    notaRevision:
      "Perfil pausado temporalmente por baja disponibilidad reportada.",
  },
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
  const [beluers, setBeluers] = useState<AdminBeluer[]>(beluersIniciales);
const [beluerDetalle, setBeluerDetalle] = useState<AdminBeluer | null>(null);

  const goToSection = (section: AdminSection) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };
  const handleCambiarEstadoBeluer = (
  id: string,
  nuevoEstado: AdminBeluerEstado
) => {
  setBeluers((current) =>
    current.map((beluer) =>
      beluer.id === id ? { ...beluer, estado: nuevoEstado } : beluer
    )
  );

  setBeluerDetalle(null);
};

const handleCambiarNivelBeluer = (id: string, nuevoNivel: AdminBeluerNivel) => {
  setBeluers((current) =>
    current.map((beluer) =>
      beluer.id === id ? { ...beluer, nivel: nuevoNivel } : beluer
    )
  );
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

          {activeSection === "beluers" && (
  <AdminBeluersSection
    beluers={beluers}
    onVerDetalle={setBeluerDetalle}
    onCambiarEstado={handleCambiarEstadoBeluer}
    onCambiarNivel={handleCambiarNivelBeluer}
  />
)}

{activeSection !== "dashboard" && activeSection !== "beluers" && (
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
      {beluerDetalle && (
  <div className="admin-panel-modal-overlay">
    <div className="admin-panel-modal">
      <button
        className="admin-panel-modal-close"
        type="button"
        onClick={() => setBeluerDetalle(null)}
        aria-label="Cerrar detalle"
      >
        ×
      </button>

      <div className="admin-panel-beluer-detail-head">
        <img src={beluerDetalle.foto} alt={beluerDetalle.nombre} />

        <div>
          <span className={`admin-panel-status ${beluerDetalle.estado}`}>
            {getBeluerEstadoLabel(beluerDetalle.estado)}
          </span>

          <h2>{beluerDetalle.nombre}</h2>
          <p>{beluerDetalle.instagram}</p>
        </div>
      </div>

      <div className="admin-panel-modal-info-grid">
        <div>
          <span>Teléfono</span>
          <strong>{beluerDetalle.telefono}</strong>
        </div>

        <div>
          <span>Distrito base</span>
          <strong>{beluerDetalle.distrito}</strong>
        </div>

        <div>
          <span>Experiencia</span>
          <strong>{beluerDetalle.experiencia} años</strong>
        </div>

        <div>
          <span>Nivel</span>
          <strong>{beluerDetalle.nivel}</strong>
        </div>

        <div>
          <span>Rating</span>
          <strong>{beluerDetalle.rating || "Sin rating"}</strong>
        </div>

        <div>
          <span>Reservas</span>
          <strong>{beluerDetalle.reservas}</strong>
        </div>

        <div className="full">
          <span>Servicios</span>
          <strong>{beluerDetalle.servicios.join(", ")}</strong>
        </div>

        <div className="full">
          <span>Nota de revisión</span>
          <strong>{beluerDetalle.notaRevision}</strong>
        </div>
      </div>

      <div className="admin-panel-modal-actions">
        {beluerDetalle.estado !== "aprobada" && (
          <button
            type="button"
            className="admin-panel-btn-primary"
            onClick={() =>
              handleCambiarEstadoBeluer(beluerDetalle.id, "aprobada")
            }
          >
            Aprobar
          </button>
        )}

        {beluerDetalle.estado !== "rechazada" && (
          <button
            type="button"
            className="admin-panel-btn-secondary"
            onClick={() =>
              handleCambiarEstadoBeluer(beluerDetalle.id, "rechazada")
            }
          >
            Rechazar
          </button>
        )}

        {beluerDetalle.estado !== "pausada" && (
          <button
            type="button"
            className="admin-panel-btn-secondary"
            onClick={() =>
              handleCambiarEstadoBeluer(beluerDetalle.id, "pausada")
            }
          >
            Pausar
          </button>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}

function AdminBeluersSection({
  beluers,
  onVerDetalle,
  onCambiarEstado,
  onCambiarNivel,
}: {
  beluers: AdminBeluer[];
  onVerDetalle: (beluer: AdminBeluer) => void;
  onCambiarEstado: (id: string, estado: AdminBeluerEstado) => void;
  onCambiarNivel: (id: string, nivel: AdminBeluerNivel) => void;
}) {
  const [filtro, setFiltro] = useState<"todas" | AdminBeluerEstado>("todas");

  const beluersFiltradas = beluers.filter((beluer) => {
    if (filtro === "todas") return true;
    return beluer.estado === filtro;
  });

  const pendientes = beluers.filter((beluer) => beluer.estado === "pendiente");
  const aprobadas = beluers.filter((beluer) => beluer.estado === "aprobada");
  const pausadas = beluers.filter((beluer) => beluer.estado === "pausada");

  return (
    <section className="admin-panel-section active">
      <div className="admin-panel-top-bar">
        <div className="admin-panel-greeting">
          <h1>Beluers</h1>
          <p>
            Aprueba, pausa y gestiona especialistas verificadas de la plataforma.
          </p>
        </div>

        <AdminPill />
      </div>

      <div className="admin-panel-beluers-summary">
        <div>
          <span>Total</span>
          <strong>{beluers.length}</strong>
        </div>

        <div>
          <span>Pendientes</span>
          <strong>{pendientes.length}</strong>
        </div>

        <div>
          <span>Aprobadas</span>
          <strong>{aprobadas.length}</strong>
        </div>

        <div>
          <span>Pausadas</span>
          <strong>{pausadas.length}</strong>
        </div>
      </div>

      <div className="admin-panel-beluers-toolbar">
        <div className="admin-panel-beluers-filters">
          {(["todas", "pendiente", "aprobada", "pausada", "rechazada"] as const).map(
            (item) => (
              <button
                key={item}
                type="button"
                className={filtro === item ? "active" : ""}
                onClick={() => setFiltro(item)}
              >
                {item === "todas" ? "Todas" : getBeluerEstadoLabel(item)}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          className="admin-panel-btn-primary"
          onClick={() =>
            alert(
              "Más adelante aquí se abrirá el flujo para crear o invitar una nueva Beluer."
            )
          }
        >
          Invitar Beluer
        </button>
      </div>

      <div className="admin-panel-beluers-grid">
        {beluersFiltradas.map((beluer) => (
          <article className="admin-panel-beluer-card" key={beluer.id}>
            <div className="admin-panel-beluer-card-head">
              <img src={beluer.foto} alt={beluer.nombre} />

              <div>
                <span className={`admin-panel-status ${beluer.estado}`}>
                  {getBeluerEstadoLabel(beluer.estado)}
                </span>

                <h3>{beluer.nombre}</h3>
                <p>{beluer.instagram}</p>
              </div>
            </div>

            <div className="admin-panel-beluer-meta">
              <span>{beluer.distrito}</span>
              <span>{beluer.experiencia} años exp.</span>
              <span>{beluer.reservas} reservas</span>
            </div>

            <div className="admin-panel-beluer-services">
              {beluer.servicios.slice(0, 4).map((servicio) => (
                <span key={servicio}>{servicio}</span>
              ))}
            </div>

            <div className="admin-panel-beluer-level-row">
              <label>Nivel</label>
              <select
                value={beluer.nivel}
                onChange={(event) =>
                  onCambiarNivel(
                    beluer.id,
                    event.target.value as AdminBeluerNivel
                  )
                }
              >
                <option value="Nueva">Nueva</option>
                <option value="Verificada">Verificada</option>
                <option value="Top ✦">Top ✦</option>
              </select>
            </div>

            <div className="admin-panel-beluer-actions">
              <button type="button" onClick={() => onVerDetalle(beluer)}>
                Ver detalle
              </button>

              {beluer.estado === "pendiente" && (
                <>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => onCambiarEstado(beluer.id, "aprobada")}
                  >
                    Aprobar
                  </button>

                  <button
                    type="button"
                    className="secondary"
                    onClick={() => onCambiarEstado(beluer.id, "rechazada")}
                  >
                    Rechazar
                  </button>
                </>
              )}

              {beluer.estado === "aprobada" && (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => onCambiarEstado(beluer.id, "pausada")}
                >
                  Pausar
                </button>
              )}

              {beluer.estado === "pausada" && (
                <button
                  type="button"
                  className="primary"
                  onClick={() => onCambiarEstado(beluer.id, "aprobada")}
                >
                  Reactivar
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getBeluerEstadoLabel(estado: AdminBeluerEstado) {
  const labels: Record<AdminBeluerEstado, string> = {
    pendiente: "Pendiente",
    aprobada: "Aprobada",
    rechazada: "Rechazada",
    pausada: "Pausada",
  };

  return labels[estado];
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