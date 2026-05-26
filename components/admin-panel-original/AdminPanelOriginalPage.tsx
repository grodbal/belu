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
type AdminServicioCategoria = "lashes" | "nails" | "brows" | "addon";

type AdminServicio = {
  id: string;
  nombre: string;
  categoria: AdminServicioCategoria;
  descripcion: string;
  precioMinimo: number;
  duracionMinutos: number;
  activo: boolean;
};
type AdminReservaEstado =
  | "pendiente_asignacion"
  | "asignada"
  | "confirmada"
  | "completada"
  | "cancelada";

type AdminReserva = {
  id: string;
  clienta: string;
  beluer: string | null;
  servicio: string;
  addons: string[];
  distrito: string;
  direccion: string;
  fecha: string;
  hora: string;
  total: number;
  metodoPago: "Yape" | "Plin" | "Tarjeta";
  estado: AdminReservaEstado;
  modoAsignacion: "gestionado" | "libre";
  instrucciones: string;
};
type AdminFotoEstado = "pendiente" | "aprobada" | "rechazada";

type AdminFotoCategoria = "lashes" | "nails" | "brows";

type AdminFoto = {
  id: string;
  beluer: string;
  categoria: AdminFotoCategoria;
  titulo: string;
  imagen: string;
  estado: AdminFotoEstado;
  destacada: boolean;
  fechaSubida: string;
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
const serviciosIniciales: AdminServicio[] = [
  {
    id: "SRV-001",
    nombre: "Clásicas",
    categoria: "lashes",
    descripcion: "Extensiones una a una para un acabado natural.",
    precioMinimo: 100,
    duracionMinutos: 90,
    activo: true,
  },
  {
    id: "SRV-002",
    nombre: "Efecto Rímel",
    categoria: "lashes",
    descripcion: "Mayor densidad y oscuridad para una mirada intensa.",
    precioMinimo: 110,
    duracionMinutos: 105,
    activo: true,
  },
  {
    id: "SRV-003",
    nombre: "Volumen 3D",
    categoria: "lashes",
    descripcion: "Tres extensiones por pestaña para volumen visible.",
    precioMinimo: 140,
    duracionMinutos: 120,
    activo: true,
  },
  {
    id: "SRV-004",
    nombre: "Lifting de pestañas",
    categoria: "lashes",
    descripcion: "Curva y realce de pestañas naturales sin extensiones.",
    precioMinimo: 100,
    duracionMinutos: 60,
    activo: true,
  },
  {
    id: "SRV-005",
    nombre: "Planchado de cejas",
    categoria: "brows",
    descripcion: "Diseño y fijación de cejas para acabado natural.",
    precioMinimo: 70,
    duracionMinutos: 45,
    activo: true,
  },
  {
    id: "SRV-006",
    nombre: "Esmaltado Gel",
    categoria: "nails",
    descripcion: "Esmalte semipermanente con brillo de gel.",
    precioMinimo: 70,
    duracionMinutos: 60,
    activo: true,
  },
  {
    id: "SRV-007",
    nombre: "Rubber",
    categoria: "nails",
    descripcion: "Base flexible y resistente para uñas naturales.",
    precioMinimo: 85,
    duracionMinutos: 75,
    activo: true,
  },
  {
    id: "SRV-008",
    nombre: "Retiro de gel",
    categoria: "addon",
    descripcion: "Retiro seguro de gel antes de un nuevo servicio.",
    precioMinimo: 25,
    duracionMinutos: 25,
    activo: true,
  },
];
const reservasIniciales: AdminReserva[] = [
  {
    id: "RSV-001",
    clienta: "María Claudia R.",
    beluer: null,
    servicio: "Efecto Rímel",
    addons: ["Depilación con hilo"],
    distrito: "Miraflores",
    direccion: "Av. Comandante Espinar 456, Miraflores",
    fecha: "2026-05-18",
    hora: "15:30",
    total: 165,
    metodoPago: "Yape",
    estado: "pendiente_asignacion",
    modoAsignacion: "gestionado",
    instrucciones: "Prefiere un acabado natural pero con presencia.",
  },
  {
    id: "RSV-002",
    clienta: "Valeria M.",
    beluer: "Andrea Robles",
    servicio: "Lifting de pestañas",
    addons: [],
    distrito: "San Isidro",
    direccion: "Calle Los Libertadores 220, San Isidro",
    fecha: "2026-05-19",
    hora: "11:00",
    total: 120,
    metodoPago: "Tarjeta",
    estado: "asignada",
    modoAsignacion: "libre",
    instrucciones: "Tiene pestañas sensibles. Llevar materiales suaves.",
  },
  {
    id: "RSV-003",
    clienta: "Lucía P.",
    beluer: "Camila V.",
    servicio: "Rubber",
    addons: ["Retiro de gel"],
    distrito: "Surco",
    direccion: "Av. Primavera 1250, Surco",
    fecha: "2026-05-20",
    hora: "17:00",
    total: 125,
    metodoPago: "Plin",
    estado: "confirmada",
    modoAsignacion: "libre",
    instrucciones: "Prefiere uñas cortas y color nude.",
  },
  {
    id: "RSV-004",
    clienta: "Camila S.",
    beluer: "Sofía T.",
    servicio: "Volumen 3D",
    addons: [],
    distrito: "Barranco",
    direccion: "Jr. Unión 340, Barranco",
    fecha: "2026-05-12",
    hora: "10:00",
    total: 160,
    metodoPago: "Yape",
    estado: "completada",
    modoAsignacion: "gestionado",
    instrucciones: "Quiere efecto más marcado en esquina externa.",
  },
  {
    id: "RSV-005",
    clienta: "Renata G.",
    beluer: null,
    servicio: "Esmaltado Gel",
    addons: [],
    distrito: "La Molina",
    direccion: "Av. La Fontana 890, La Molina",
    fecha: "2026-05-10",
    hora: "16:00",
    total: 85,
    metodoPago: "Tarjeta",
    estado: "cancelada",
    modoAsignacion: "gestionado",
    instrucciones: "Cancelada por solicitud de la clienta.",
  },
];
const fotosIniciales: AdminFoto[] = [
  {
    id: "FOTO-001",
    beluer: "Andrea Robles",
    categoria: "lashes",
    titulo: "Volumen natural",
    imagen:
      "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=800&q=80",
    estado: "aprobada",
    destacada: true,
    fechaSubida: "2026-05-10",
    notaRevision: "Buena iluminación y resultado limpio.",
  },
  {
    id: "FOTO-002",
    beluer: "Camila V.",
    categoria: "nails",
    titulo: "Rubber nude",
    imagen:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80",
    estado: "pendiente",
    destacada: false,
    fechaSubida: "2026-05-16",
    notaRevision: "Revisar nitidez y encuadre antes de aprobar.",
  },
  {
    id: "FOTO-003",
    beluer: "Sofía T.",
    categoria: "lashes",
    titulo: "Efecto Aura",
    imagen:
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
    estado: "pendiente",
    destacada: false,
    fechaSubida: "2026-05-17",
    notaRevision: "Buen resultado, pero falta validar consistencia con el portafolio.",
  },
  {
    id: "FOTO-004",
    beluer: "Valeria M.",
    categoria: "brows",
    titulo: "Brows clean",
    imagen:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
    estado: "rechazada",
    destacada: false,
    fechaSubida: "2026-05-12",
    notaRevision: "Imagen no cumple con el estándar visual de belu.",
  },
  {
    id: "FOTO-005",
    beluer: "Lucía P.",
    categoria: "nails",
    titulo: "Acrílicas soft pink",
    imagen:
      "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&q=80",
    estado: "aprobada",
    destacada: false,
    fechaSubida: "2026-05-08",
    notaRevision: "Buen acabado, imagen usable para catálogo.",
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
const [servicios, setServicios] =
  useState<AdminServicio[]>(serviciosIniciales);
  const [reservas, setReservas] = useState<AdminReserva[]>(reservasIniciales);
const [reservaDetalle, setReservaDetalle] = useState<AdminReserva | null>(null);
const [fotos, setFotos] = useState<AdminFoto[]>(fotosIniciales);
const [fotoDetalle, setFotoDetalle] = useState<AdminFoto | null>(null);

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
const handleToggleServicioAdmin = (id: string) => {
  setServicios((current) =>
    current.map((servicio) =>
      servicio.id === id
        ? { ...servicio, activo: !servicio.activo }
        : servicio
    )
  );
};

const handleActualizarServicioAdmin = <K extends keyof AdminServicio>(
  id: string,
  campo: K,
  valor: AdminServicio[K]
) => {
  setServicios((current) =>
    current.map((servicio) =>
      servicio.id === id ? { ...servicio, [campo]: valor } : servicio
    )
  );
};

const handleAgregarServicioAdmin = () => {
  const nuevoServicio: AdminServicio = {
    id: `SRV-${Date.now()}`,
    nombre: "Nuevo servicio",
    categoria: "lashes",
    descripcion: "Descripción pendiente.",
    precioMinimo: 100,
    duracionMinutos: 60,
    activo: false,
  };

  setServicios((current) => [nuevoServicio, ...current]);
};

const handleGuardarServiciosAdmin = () => {
  const serviciosInvalidos = servicios.filter(
    (servicio) =>
      !servicio.nombre.trim() ||
      servicio.precioMinimo <= 0 ||
      servicio.duracionMinutos <= 0
  );

  if (serviciosInvalidos.length > 0) {
    alert("Revisa que todos los servicios tengan nombre, precio mínimo y duración válida.");
    return;
  }

  alert("Catálogo de servicios actualizado correctamente.");
};
const handleCambiarEstadoReserva = (
  id: string,
  nuevoEstado: AdminReservaEstado
) => {
  setReservas((current) =>
    current.map((reserva) =>
      reserva.id === id ? { ...reserva, estado: nuevoEstado } : reserva
    )
  );

  setReservaDetalle(null);
};

const handleAsignarBeluerReserva = (id: string, beluer: string) => {
  setReservas((current) =>
    current.map((reserva) =>
      reserva.id === id
        ? {
            ...reserva,
            beluer,
            estado: "asignada",
          }
        : reserva
    )
  );

  setReservaDetalle(null);
};
const handleCambiarEstadoFoto = (id: string, nuevoEstado: AdminFotoEstado) => {
  setFotos((current) =>
    current.map((foto) =>
      foto.id === id ? { ...foto, estado: nuevoEstado } : foto
    )
  );

  setFotoDetalle(null);
};

const handleMarcarFotoDestacada = (id: string) => {
  setFotos((current) =>
    current.map((foto) => ({
      ...foto,
      destacada: foto.id === id,
    }))
  );

  setFotoDetalle(null);
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
{activeSection === "servicios" && (
  <AdminServiciosSection
    servicios={servicios}
    onToggleServicio={handleToggleServicioAdmin}
    onActualizarServicio={handleActualizarServicioAdmin}
    onAgregarServicio={handleAgregarServicioAdmin}
    onGuardar={handleGuardarServiciosAdmin}
  />
)}
{activeSection === "reservas" && (
  <AdminReservasSection
    reservas={reservas}
    beluers={beluers}
    onVerDetalle={setReservaDetalle}
    onCambiarEstado={handleCambiarEstadoReserva}
  />
)}
{activeSection === "fotos" && (
  <AdminFotosSection
    fotos={fotos}
    onVerDetalle={setFotoDetalle}
    onCambiarEstado={handleCambiarEstadoFoto}
    onMarcarDestacada={handleMarcarFotoDestacada}
  />
)}

{activeSection !== "dashboard" &&
  activeSection !== "beluers" &&
  activeSection !== "servicios" &&
  activeSection !== "reservas" &&
  activeSection !== "fotos" && (
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
        {reservaDetalle && (
  <div className="admin-panel-modal-overlay">
    <div className="admin-panel-modal">
      <button
        className="admin-panel-modal-close"
        type="button"
        onClick={() => setReservaDetalle(null)}
        aria-label="Cerrar detalle"
      >
        ×
      </button>

      <div className="admin-panel-modal-badge-row">
        <span className={`admin-panel-reserva-status ${reservaDetalle.estado}`}>
          {getReservaEstadoLabel(reservaDetalle.estado)}
        </span>

        <span className="admin-panel-reserva-mode">
          {reservaDetalle.modoAsignacion}
        </span>
      </div>

      <h2>{reservaDetalle.servicio}</h2>
      <p className="admin-panel-modal-subtitle">
        Reserva de {reservaDetalle.clienta}
      </p>

      <div className="admin-panel-modal-info-grid">
        <div>
          <span>Beluer</span>
          <strong>{reservaDetalle.beluer || "Sin asignar"}</strong>
        </div>

        <div>
          <span>Total</span>
          <strong>S/ {reservaDetalle.total}</strong>
        </div>

        <div>
          <span>Fecha</span>
          <strong>{reservaDetalle.fecha}</strong>
        </div>

        <div>
          <span>Hora</span>
          <strong>{reservaDetalle.hora}</strong>
        </div>

        <div>
          <span>Distrito</span>
          <strong>{reservaDetalle.distrito}</strong>
        </div>

        <div>
          <span>Método de pago</span>
          <strong>{reservaDetalle.metodoPago}</strong>
        </div>

        <div className="full">
          <span>Dirección</span>
          <strong>{reservaDetalle.direccion}</strong>
        </div>

        <div className="full">
          <span>Add-ons</span>
          <strong>
            {reservaDetalle.addons.length > 0
              ? reservaDetalle.addons.join(", ")
              : "Sin adicionales"}
          </strong>
        </div>

        <div className="full">
          <span>Instrucciones</span>
          <strong>{reservaDetalle.instrucciones}</strong>
        </div>
      </div>

      {reservaDetalle.estado === "pendiente_asignacion" && (
        <div className="admin-panel-modal-assign">
          <label>Asignar Beluer</label>

          <select
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) {
                handleAsignarBeluerReserva(reservaDetalle.id, event.target.value);
              }
            }}
          >
            <option value="">Seleccionar Beluer</option>
            {beluers
              .filter((beluer) => beluer.estado === "aprobada")
              .map((beluer) => (
                <option key={beluer.id} value={beluer.nombre}>
                  {beluer.nombre}
                </option>
              ))}
          </select>
        </div>
      )}

      <div className="admin-panel-modal-actions">
        {reservaDetalle.estado !== "confirmada" &&
          reservaDetalle.estado !== "cancelada" &&
          reservaDetalle.estado !== "completada" && (
            <button
              type="button"
              className="admin-panel-btn-primary"
              onClick={() =>
                handleCambiarEstadoReserva(reservaDetalle.id, "confirmada")
              }
            >
              Confirmar
            </button>
          )}

        {reservaDetalle.estado !== "completada" &&
          reservaDetalle.estado !== "cancelada" && (
            <button
              type="button"
              className="admin-panel-btn-secondary"
              onClick={() =>
                handleCambiarEstadoReserva(reservaDetalle.id, "completada")
              }
            >
              Marcar completada
            </button>
          )}

        {reservaDetalle.estado !== "cancelada" && (
          <button
            type="button"
            className="admin-panel-btn-secondary"
            onClick={() =>
              handleCambiarEstadoReserva(reservaDetalle.id, "cancelada")
            }
          >
            Cancelar
          </button>
        )}
        {fotoDetalle && (
  <div className="admin-panel-modal-overlay">
    <div className="admin-panel-modal">
      <button
        className="admin-panel-modal-close"
        type="button"
        onClick={() => setFotoDetalle(null)}
        aria-label="Cerrar detalle"
      >
        ×
      </button>

      <div className="admin-panel-foto-detail-img">
        <img src={fotoDetalle.imagen} alt={fotoDetalle.titulo} />

        {fotoDetalle.destacada && (
          <span className="admin-panel-foto-destacada">Destacada</span>
        )}

        <span className={`admin-panel-foto-status ${fotoDetalle.estado}`}>
          {getFotoEstadoLabel(fotoDetalle.estado)}
        </span>
      </div>

      <h2>{fotoDetalle.titulo}</h2>
      <p className="admin-panel-modal-subtitle">
        Subida por {fotoDetalle.beluer}
      </p>

      <div className="admin-panel-modal-info-grid">
        <div>
          <span>Categoría</span>
          <strong>{fotoDetalle.categoria}</strong>
        </div>

        <div>
          <span>Fecha de subida</span>
          <strong>{fotoDetalle.fechaSubida}</strong>
        </div>

        <div className="full">
          <span>Nota de revisión</span>
          <strong>{fotoDetalle.notaRevision}</strong>
        </div>
      </div>

      <div className="admin-panel-modal-actions">
        {fotoDetalle.estado !== "aprobada" && (
          <button
            type="button"
            className="admin-panel-btn-primary"
            onClick={() => handleCambiarEstadoFoto(fotoDetalle.id, "aprobada")}
          >
            Aprobar
          </button>
        )}

        {fotoDetalle.estado !== "rechazada" && (
          <button
            type="button"
            className="admin-panel-btn-secondary"
            onClick={() => handleCambiarEstadoFoto(fotoDetalle.id, "rechazada")}
          >
            Rechazar
          </button>
        )}

        {!fotoDetalle.destacada && fotoDetalle.estado === "aprobada" && (
          <button
            type="button"
            className="admin-panel-btn-secondary"
            onClick={() => handleMarcarFotoDestacada(fotoDetalle.id)}
          >
            Marcar destacada
          </button>
        )}
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  </div>
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

function AdminServiciosSection({
  servicios,
  onToggleServicio,
  onActualizarServicio,
  onAgregarServicio,
  onGuardar,
}: {
  servicios: AdminServicio[];
  onToggleServicio: (id: string) => void;
  onActualizarServicio: <K extends keyof AdminServicio>(
    id: string,
    campo: K,
    valor: AdminServicio[K]
  ) => void;
  onAgregarServicio: () => void;
  onGuardar: () => void;
}) {
  const [filtro, setFiltro] = useState<"todos" | AdminServicioCategoria>(
    "todos"
  );

  const serviciosFiltrados = servicios.filter((servicio) => {
    if (filtro === "todos") return true;
    return servicio.categoria === filtro;
  });

  const activos = servicios.filter((servicio) => servicio.activo);
  const addons = servicios.filter((servicio) => servicio.categoria === "addon");

  return (
    <section className="admin-panel-section active">
      <div className="admin-panel-top-bar">
        <div className="admin-panel-greeting">
          <h1>Servicios</h1>
          <p>
            Gestiona el catálogo maestro, precios mínimos y disponibilidad de
            servicios en belu.
          </p>
        </div>

        <AdminPill />
      </div>

      <div className="admin-panel-servicios-summary">
        <div>
          <span>Total</span>
          <strong>{servicios.length}</strong>
        </div>

        <div>
          <span>Activos</span>
          <strong>{activos.length}</strong>
        </div>

        <div>
          <span>Add-ons</span>
          <strong>{addons.length}</strong>
        </div>

        <div>
          <span>Precio mínimo promedio</span>
          <strong>
            S/{" "}
            {Math.round(
              servicios.reduce((acc, item) => acc + item.precioMinimo, 0) /
                servicios.length
            )}
          </strong>
        </div>
      </div>

      <div className="admin-panel-servicios-alert">
        <strong>Regla estratégica</strong>
        <span>
          El admin define el precio mínimo para proteger el posicionamiento
          premium. Cada Beluer podrá definir su precio final desde su panel, pero
          no por debajo de este mínimo.
        </span>
      </div>

      <div className="admin-panel-servicios-toolbar">
        <div className="admin-panel-servicios-filters">
          {(["todos", "lashes", "nails", "brows", "addon"] as const).map(
            (item) => (
              <button
                key={item}
                type="button"
                className={filtro === item ? "active" : ""}
                onClick={() => setFiltro(item)}
              >
                {item === "todos" ? "Todos" : item}
              </button>
            )
          )}
        </div>

        <div className="admin-panel-servicios-toolbar-actions">
          <button
            type="button"
            className="admin-panel-btn-secondary"
            onClick={onAgregarServicio}
          >
            Nuevo servicio
          </button>

          <button
            type="button"
            className="admin-panel-btn-primary"
            onClick={onGuardar}
          >
            Guardar catálogo
          </button>
        </div>
      </div>

      <div className="admin-panel-servicios-grid">
        {serviciosFiltrados.map((servicio) => (
          <article className="admin-panel-servicio-card" key={servicio.id}>
            <div className="admin-panel-servicio-head">
              <div>
                <span>{servicio.categoria}</span>
                <input
                  type="text"
                  value={servicio.nombre}
                  onChange={(event) =>
                    onActualizarServicio(
                      servicio.id,
                      "nombre",
                      event.target.value
                    )
                  }
                />
              </div>

              <label className="admin-panel-switch">
                <input
                  type="checkbox"
                  checked={servicio.activo}
                  onChange={() => onToggleServicio(servicio.id)}
                />
                <span />
              </label>
            </div>

            <div className="admin-panel-servicio-form-grid">
              <label>
                Categoría
                <select
                  value={servicio.categoria}
                  onChange={(event) =>
                    onActualizarServicio(
                      servicio.id,
                      "categoria",
                      event.target.value as AdminServicioCategoria
                    )
                  }
                >
                  <option value="lashes">lashes</option>
                  <option value="nails">nails</option>
                  <option value="brows">brows</option>
                  <option value="addon">addon</option>
                </select>
              </label>

              <label>
                Precio mínimo
                <input
                  type="number"
                  min={1}
                  value={servicio.precioMinimo}
                  onChange={(event) =>
                    onActualizarServicio(
                      servicio.id,
                      "precioMinimo",
                      Number(event.target.value)
                    )
                  }
                />
              </label>

              <label>
                Duración minutos
                <input
                  type="number"
                  min={1}
                  value={servicio.duracionMinutos}
                  onChange={(event) =>
                    onActualizarServicio(
                      servicio.id,
                      "duracionMinutos",
                      Number(event.target.value)
                    )
                  }
                />
              </label>
            </div>

            <label className="admin-panel-servicio-description">
              Descripción
              <textarea
                value={servicio.descripcion}
                onChange={(event) =>
                  onActualizarServicio(
                    servicio.id,
                    "descripcion",
                    event.target.value
                  )
                }
              />
            </label>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminReservasSection({
  reservas,
  beluers,
  onVerDetalle,
  onCambiarEstado,
}: {
  reservas: AdminReserva[];
  beluers: AdminBeluer[];
  onVerDetalle: (reserva: AdminReserva) => void;
  onCambiarEstado: (id: string, estado: AdminReservaEstado) => void;
}) {
  const [filtro, setFiltro] = useState<"todas" | AdminReservaEstado>("todas");

  const reservasFiltradas = reservas.filter((reserva) => {
    if (filtro === "todas") return true;
    return reserva.estado === filtro;
  });

  const pendientes = reservas.filter(
    (reserva) => reserva.estado === "pendiente_asignacion"
  );

  const asignadas = reservas.filter((reserva) => reserva.estado === "asignada");
  const confirmadas = reservas.filter(
    (reserva) => reserva.estado === "confirmada"
  );
  const completadas = reservas.filter(
    (reserva) => reserva.estado === "completada"
  );

  const totalIngresos = reservas
    .filter((reserva) => reserva.estado !== "cancelada")
    .reduce((acc, reserva) => acc + reserva.total, 0);

  return (
    <section className="admin-panel-section active">
      <div className="admin-panel-top-bar">
        <div className="admin-panel-greeting">
          <h1>Reservas</h1>
          <p>
            Supervisa reservas, asignaciones, pagos y estado operativo del
            servicio.
          </p>
        </div>

        <AdminPill />
      </div>

      <div className="admin-panel-reservas-summary">
        <div>
          <span>Total reservas</span>
          <strong>{reservas.length}</strong>
        </div>

        <div>
          <span>Pendientes</span>
          <strong>{pendientes.length}</strong>
        </div>

        <div>
          <span>Asignadas</span>
          <strong>{asignadas.length + confirmadas.length}</strong>
        </div>

        <div>
          <span>Completadas</span>
          <strong>{completadas.length}</strong>
        </div>

        <div>
          <span>Total activo</span>
          <strong>S/ {totalIngresos}</strong>
        </div>
      </div>

      <div className="admin-panel-reservas-toolbar">
        <div className="admin-panel-reservas-filters">
          {(
            [
              "todas",
              "pendiente_asignacion",
              "asignada",
              "confirmada",
              "completada",
              "cancelada",
            ] as const
          ).map((item) => (
            <button
              key={item}
              type="button"
              className={filtro === item ? "active" : ""}
              onClick={() => setFiltro(item)}
            >
              {item === "todas" ? "Todas" : getReservaEstadoLabel(item)}
            </button>
          ))}
        </div>
      </div>

      {pendientes.length > 0 && (
        <div className="admin-panel-reservas-alert">
          <strong>{pendientes.length} reserva(s) necesitan asignación</strong>
          <span>
            Estas reservas ya fueron pagadas y deben asignarse a una Beluer
            disponible para activar el flujo de confirmación.
          </span>
        </div>
      )}

      <div className="admin-panel-reservas-list">
        {reservasFiltradas.map((reserva) => (
          <article className="admin-panel-reserva-card" key={reserva.id}>
            <div className="admin-panel-reserva-main">
              <div>
                <span className={`admin-panel-reserva-status ${reserva.estado}`}>
                  {getReservaEstadoLabel(reserva.estado)}
                </span>

                <h3>{reserva.servicio}</h3>

                <p>
                  {reserva.clienta} · {reserva.distrito}
                </p>
              </div>

              <strong>S/ {reserva.total}</strong>
            </div>

            <div className="admin-panel-reserva-meta">
              <span>📅 {reserva.fecha}</span>
              <span>🕒 {reserva.hora}</span>
              <span>💳 {reserva.metodoPago}</span>
              <span>
                👩‍🎨 {reserva.beluer ? reserva.beluer : "Sin Beluer"}
              </span>
              <span>⚙️ {reserva.modoAsignacion}</span>
            </div>

            <div className="admin-panel-reserva-actions">
              <button type="button" onClick={() => onVerDetalle(reserva)}>
                Ver detalle
              </button>

              {reserva.estado === "asignada" && (
                <button
                  type="button"
                  className="primary"
                  onClick={() => onCambiarEstado(reserva.id, "confirmada")}
                >
                  Confirmar
                </button>
              )}

              {reserva.estado === "confirmada" && (
                <button
                  type="button"
                  className="primary"
                  onClick={() => onCambiarEstado(reserva.id, "completada")}
                >
                  Completar
                </button>
              )}

              {reserva.estado !== "cancelada" &&
                reserva.estado !== "completada" && (
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => onCambiarEstado(reserva.id, "cancelada")}
                  >
                    Cancelar
                  </button>
                )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getReservaEstadoLabel(estado: AdminReservaEstado) {
  const labels: Record<AdminReservaEstado, string> = {
    pendiente_asignacion: "Pendiente de asignación",
    asignada: "Asignada",
    confirmada: "Confirmada",
    completada: "Completada",
    cancelada: "Cancelada",
  };

  return labels[estado];
}

function AdminFotosSection({
  fotos,
  onVerDetalle,
  onCambiarEstado,
  onMarcarDestacada,
}: {
  fotos: AdminFoto[];
  onVerDetalle: (foto: AdminFoto) => void;
  onCambiarEstado: (id: string, estado: AdminFotoEstado) => void;
  onMarcarDestacada: (id: string) => void;
}) {
  const [filtroEstado, setFiltroEstado] = useState<"todas" | AdminFotoEstado>(
    "todas"
  );

  const [filtroCategoria, setFiltroCategoria] = useState<
    "todas" | AdminFotoCategoria
  >("todas");

  const fotosFiltradas = fotos.filter((foto) => {
    const matchEstado =
      filtroEstado === "todas" || foto.estado === filtroEstado;
    const matchCategoria =
      filtroCategoria === "todas" || foto.categoria === filtroCategoria;

    return matchEstado && matchCategoria;
  });

  const pendientes = fotos.filter((foto) => foto.estado === "pendiente");
  const aprobadas = fotos.filter((foto) => foto.estado === "aprobada");
  const rechazadas = fotos.filter((foto) => foto.estado === "rechazada");

  return (
    <section className="admin-panel-section active">
      <div className="admin-panel-top-bar">
        <div className="admin-panel-greeting">
          <h1>Fotos</h1>
          <p>
            Valida imágenes de portafolio antes de mostrarlas en el catálogo
            público.
          </p>
        </div>

        <AdminPill />
      </div>

      <div className="admin-panel-fotos-summary">
        <div>
          <span>Total</span>
          <strong>{fotos.length}</strong>
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
          <span>Rechazadas</span>
          <strong>{rechazadas.length}</strong>
        </div>
      </div>

      {pendientes.length > 0 && (
        <div className="admin-panel-fotos-alert">
          <strong>{pendientes.length} foto(s) pendientes de revisión</strong>
          <span>
            Las imágenes pendientes no deben mostrarse en el catálogo hasta que
            admin las apruebe.
          </span>
        </div>
      )}

      <div className="admin-panel-fotos-toolbar">
        <div className="admin-panel-fotos-filters">
          {(["todas", "pendiente", "aprobada", "rechazada"] as const).map(
            (item) => (
              <button
                key={item}
                type="button"
                className={filtroEstado === item ? "active" : ""}
                onClick={() => setFiltroEstado(item)}
              >
                {item === "todas" ? "Todas" : getFotoEstadoLabel(item)}
              </button>
            )
          )}
        </div>

        <div className="admin-panel-fotos-filters">
          {(["todas", "lashes", "nails", "brows"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={filtroCategoria === item ? "active" : ""}
              onClick={() => setFiltroCategoria(item)}
            >
              {item === "todas" ? "Categorías" : item}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-panel-fotos-grid">
        {fotosFiltradas.map((foto) => (
          <article className="admin-panel-foto-card" key={foto.id}>
            <div className="admin-panel-foto-img">
              <img src={foto.imagen} alt={foto.titulo} />

              {foto.destacada && (
                <span className="admin-panel-foto-destacada">Destacada</span>
              )}

              <span className={`admin-panel-foto-status ${foto.estado}`}>
                {getFotoEstadoLabel(foto.estado)}
              </span>
            </div>

            <div className="admin-panel-foto-body">
              <div>
                <span>{foto.categoria}</span>
                <h3>{foto.titulo}</h3>
                <p>{foto.beluer}</p>
              </div>

              <div className="admin-panel-foto-actions">
                <button type="button" onClick={() => onVerDetalle(foto)}>
                  Ver detalle
                </button>

                {foto.estado === "pendiente" && (
                  <>
                    <button
                      type="button"
                      className="primary"
                      onClick={() => onCambiarEstado(foto.id, "aprobada")}
                    >
                      Aprobar
                    </button>

                    <button
                      type="button"
                      className="secondary"
                      onClick={() => onCambiarEstado(foto.id, "rechazada")}
                    >
                      Rechazar
                    </button>
                  </>
                )}

                {foto.estado === "aprobada" && !foto.destacada && (
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => onMarcarDestacada(foto.id)}
                  >
                    Destacar
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getFotoEstadoLabel(estado: AdminFotoEstado) {
  const labels: Record<AdminFotoEstado, string> = {
    pendiente: "Pendiente",
    aprobada: "Aprobada",
    rechazada: "Rechazada",
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