"use client";

import { useMemo, useState } from "react";

type PanelSection =
  | "dashboard"
  | "reserva"
  | "beluers"
  | "favoritas"
  | "historial"
  | "pagos"
  | "perfil";

type ServiceCategory = "lashes" | "nails";
type AssignmentMode = "gestionado" | "libre";

type Service = {
  nombre: string;
  precio: number;
  desc: string;
  foto: string;
  categoria: ServiceCategory;
};

type Addon = {
  nombre: string;
  precio: number;
  categoria: ServiceCategory;
};

type Beluer = {
  nombre: string;
  espec: string;
  categoria: ServiceCategory | "mixta";
  rating: string;
  citas: number;
  foto: string;
  serviciosActivos: string[];
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

const catalogoLashes: Service[] = [
  {
    nombre: "Clásicas",
    precio: 110,
    desc: "Extensiones una a una para un acabado natural.",
    foto: crearPlaceholder("Clásicas", "C2185B"),
    categoria: "lashes",
  },
  {
    nombre: "Efecto Rímel",
    precio: 120,
    desc: "Mayor densidad y oscuridad para una mirada intensa.",
    foto: crearPlaceholder("Efecto Rímel", "AD1457"),
    categoria: "lashes",
  },
  {
    nombre: "Volumen 3D",
    precio: 150,
    desc: "Tres extensiones por pestaña para volumen dramático.",
    foto: crearPlaceholder("Volumen 3D", "880E4F"),
    categoria: "lashes",
  },
  {
    nombre: "Volumen 4D",
    precio: 170,
    desc: "Cuatro extensiones ultrafinas para máximo volumen.",
    foto: crearPlaceholder("Volumen 4D", "6A1B9A"),
    categoria: "lashes",
  },
  {
    nombre: "Mega Volumen 5D",
    precio: 210,
    desc: "Efecto impactante con cinco extensiones por pestaña.",
    foto: crearPlaceholder("Mega 5D", "4A148C"),
    categoria: "lashes",
  },
  {
    nombre: "Efecto Whispy",
    precio: 190,
    desc: "Acabado despuntado y salvaje, muy demandado.",
    foto: crearPlaceholder("Whispy", "7B1FA2"),
    categoria: "lashes",
  },
  {
    nombre: "Efecto Aura",
    precio: 140,
    desc: "Volumen suave con longitud gradual en el centro.",
    foto: crearPlaceholder("Efecto Aura", "E91E63"),
    categoria: "lashes",
  },
  {
    nombre: "Lifting de pestañas",
    precio: 110,
    desc: "Curva y realza tus pestañas naturales sin extensiones.",
    foto: crearPlaceholder("Lifting", "D81B60"),
    categoria: "lashes",
  },
  {
    nombre: "Planchado de cejas",
    precio: 80,
    desc: "Domina las cejas rebeldes con un planchado permanente.",
    foto: crearPlaceholder("Planchado", "C2185B"),
    categoria: "lashes",
  },
];

const catalogoNails: Service[] = [
  {
    nombre: "Esmaltado Gel",
    precio: 75,
    desc: "Esmalte semipermanente con brillo de gel.",
    foto: crearPlaceholder("Esmalte Gel", "F06292"),
    categoria: "nails",
  },
  {
    nombre: "Rubber",
    precio: 90,
    desc: "Base de caucho flexible y duradera.",
    foto: crearPlaceholder("Rubber", "D81B60"),
    categoria: "nails",
  },
  {
    nombre: "Gel de Construcción",
    precio: 105,
    desc: "Moldeado y extensión con gel estructural.",
    foto: crearPlaceholder("Builder Gel", "C2185B"),
    categoria: "nails",
  },
  {
    nombre: "Acrílicas",
    precio: 135,
    desc: "Uñas esculpidas con polvo acrílico, súper resistentes.",
    foto: crearPlaceholder("Acrílicas", "AD1457"),
    categoria: "nails",
  },
  {
    nombre: "Polygel",
    precio: 135,
    desc: "Híbrido de acrílico y gel, ligero y resistente.",
    foto: crearPlaceholder("Polygel", "880E4F"),
    categoria: "nails",
  },
  {
    nombre: "Softgel",
    precio: 120,
    desc: "Gel suave y flexible, ideal para uñas naturales.",
    foto: crearPlaceholder("Softgel", "E91E63"),
    categoria: "nails",
  },
  {
    nombre: "Manicura Tradicional",
    precio: 60,
    desc: "Cuidado de uñas clásico con esmalte normal.",
    foto: crearPlaceholder("Manicura", "F48FB1"),
    categoria: "nails",
  },
  {
    nombre: "Pedicura Tradicional",
    precio: 60,
    desc: "Cuidado completo de pies con esmalte normal.",
    foto: crearPlaceholder("Pedicura", "F06292"),
    categoria: "nails",
  },
  {
    nombre: "Pedicura Gel",
    precio: 75,
    desc: "Pedicura semipermanente con acabado de gel.",
    foto: crearPlaceholder("Pedi Gel", "D81B60"),
    categoria: "nails",
  },
  {
    nombre: "Acripie",
    precio: 135,
    desc: "Uñas acrílicas solo en los pies, muy duraderas.",
    foto: crearPlaceholder("Acripie", "C2185B"),
    categoria: "nails",
  },
];

const addonsLashes: Addon[] = [
  { nombre: "Depilación con cera", precio: 35, categoria: "lashes" },
  { nombre: "Depilación con hilo", precio: 35, categoria: "lashes" },
  { nombre: "Depilación con navaja", precio: 25, categoria: "lashes" },
  { nombre: "Retiro de extensiones", precio: 35, categoria: "lashes" },
  { nombre: "Diseño de cejas con henna", precio: 25, categoria: "lashes" },
];

const addonsNails: Addon[] = [
  { nombre: "Retiro de gel", precio: 25, categoria: "nails" },
  { nombre: "Retiro Rubber/Builder Gel", precio: 30, categoria: "nails" },
  { nombre: "Retiro Acrílico/Polygel", precio: 35, categoria: "nails" },
];

const beluersData: Beluer[] = [
  {
    nombre: "Andrea Robles",
    espec: "Master Lash Artist",
    categoria: "lashes",
    rating: "5.0",
    citas: 120,
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    serviciosActivos: [
      "Clásicas",
      "Volumen 3D",
      "Volumen 4D",
      "Mega Volumen 5D",
      "Lifting de pestañas",
      "Planchado de cejas",
      "Efecto Whispy",
    ],
  },
  {
    nombre: "Camila V.",
    espec: "Nail Art Specialist",
    categoria: "mixta",
    rating: "4.9",
    citas: 80,
    foto: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&q=80",
    serviciosActivos: [
      "Clásicas",
      "Efecto Rímel",
      "Lifting de pestañas",
      "Esmaltado Gel",
      "Rubber",
      "Acrílicas",
      "Softgel",
      "Manicura Tradicional",
      "Pedicura Tradicional",
      "Pedicura Gel",
    ],
  },
  {
    nombre: "Sofía T.",
    espec: "Lash & Nails Pro",
    categoria: "mixta",
    rating: "4.8",
    citas: 64,
    foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    serviciosActivos: [
      "Efecto Aura",
      "Efecto Rímel",
      "Volumen 3D",
      "Rubber",
      "Gel de Construcción",
      "Polygel",
      "Acripie",
    ],
  },
];

export default function ClientePanelOriginalPage() {
  const [activeSection, setActiveSection] = useState<PanelSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [servicioLashes, setServicioLashes] = useState<Service | null>(null);
  const [servicioNails, setServicioNails] = useState<Service | null>(null);
  const [addonsSeleccionados, setAddonsSeleccionados] = useState<string[]>([]);
  const [fecha, setFecha] = useState("2026-05-15");
  const [hora, setHora] = useState("14:30");
  const [urgencia, setUrgencia] = useState(false);
  const [modoAsignacion, setModoAsignacion] =
    useState<AssignmentMode>("gestionado");
  const [beluerSeleccionada, setBeluerSeleccionada] = useState("");
  const [pagoOpen, setPagoOpen] = useState(false);
const [confirmacionOpen, setConfirmacionOpen] = useState(false);
const [metodoPago, setMetodoPago] = useState<"tarjeta" | "yape" | "plin">(
  "tarjeta"
);
const [reservaConfirmada, setReservaConfirmada] = useState(false);
const [beluersFavoritas, setBeluersFavoritas] = useState<string[]>([
  "Andrea Robles",
]);

  const goToSection = (section: PanelSection) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const serviciosSeleccionados = useMemo(() => {
    return [servicioLashes, servicioNails].filter(Boolean) as Service[];
  }, [servicioLashes, servicioNails]);

  const addonsActivos = useMemo(() => {
    return [...addonsLashes, ...addonsNails].filter((addon) =>
      addonsSeleccionados.includes(addon.nombre)
    );
  }, [addonsSeleccionados]);

  const beluersDisponibles = useMemo(() => {
    if (serviciosSeleccionados.length === 0) return beluersData;

    const requeridos = serviciosSeleccionados.map((servicio) => servicio.nombre);
    return beluersData.filter((beluer) =>
      requeridos.every((servicio) => beluer.serviciosActivos.includes(servicio))
    );
  }, [serviciosSeleccionados]);

  const totalServicios = serviciosSeleccionados.reduce(
    (acc, servicio) => acc + servicio.precio,
    0
  );
  const totalAddons = addonsActivos.reduce((acc, addon) => acc + addon.precio, 0);
  const cargoLogistico = serviciosSeleccionados.length > 0 ? 10 : 0;
  const recargoExpress = urgencia && serviciosSeleccionados.length > 0 ? 20 : 0;
  const subtotal = totalServicios + totalAddons + cargoLogistico;
  const total = subtotal + recargoExpress;

  const toggleAddon = (addonNombre: string) => {
    setAddonsSeleccionados((current) =>
      current.includes(addonNombre)
        ? current.filter((item) => item !== addonNombre)
        : [...current, addonNombre]
    );
  };

  const handleServicioClick = (servicio: Service) => {
    if (servicio.categoria === "lashes") {
      setServicioLashes((current) =>
        current?.nombre === servicio.nombre ? null : servicio
      );
    }

    if (servicio.categoria === "nails") {
      setServicioNails((current) =>
        current?.nombre === servicio.nombre ? null : servicio
      );
    }

    setBeluerSeleccionada("");
  };

  const handleConfirmarReserva = () => {
  if (serviciosSeleccionados.length === 0) {
    alert("Selecciona al menos un servicio.");
    return;
  }

  if (modoAsignacion === "libre" && !beluerSeleccionada) {
    alert("Elige a tu beluer antes de continuar.");
    return;
  }

  setPagoOpen(true);
};

const handleConfirmarPago = () => {
  setPagoOpen(false);
  setConfirmacionOpen(true);
  setReservaConfirmada(true);
};

const handleIrDashboard = () => {
  setConfirmacionOpen(false);
  setActiveSection("dashboard");
};
const toggleBeluerFavorita = (nombre: string) => {
  setBeluersFavoritas((current) =>
    current.includes(nombre)
      ? current.filter((item) => item !== nombre)
      : [...current, nombre]
  );
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
  <DashboardSection
    goToSection={goToSection}
    reservaConfirmada={reservaConfirmada}
    serviciosSeleccionados={serviciosSeleccionados}
    addonsActivos={addonsActivos}
    fecha={fecha}
    hora={hora}
    total={total}
    modoAsignacion={modoAsignacion}
    beluerSeleccionada={beluerSeleccionada}
  />
)}

          {activeSection === "reserva" && (
            <section className="cliente-panel-section active">
              <div className="cliente-panel-top-bar">
                <div className="cliente-panel-greeting">
                  <h1>Agendar nueva cita</h1>
                </div>

                <UserPill />
              </div>

              <div className="cliente-panel-card">
                <div className="cliente-panel-categoria-titulo">
                  Pestañas y Cejas
                </div>

                <div className="cliente-panel-servicios-grid">
                  {catalogoLashes.map((servicio) => (
                    <ServiceCard
                      key={servicio.nombre}
                      servicio={servicio}
                      selected={servicioLashes?.nombre === servicio.nombre}
                      onClick={() => handleServicioClick(servicio)}
                    />
                  ))}
                </div>

                {servicioLashes && (
                  <AddonsSection
                    label="Servicios adicionales (100% para tu Beluer)"
                    addons={addonsLashes}
                    selectedAddons={addonsSeleccionados}
                    onToggle={toggleAddon}
                  />
                )}

                <div className="cliente-panel-categoria-titulo">Uñas</div>

                <div className="cliente-panel-servicios-grid">
                  {catalogoNails.map((servicio) => (
                    <ServiceCard
                      key={servicio.nombre}
                      servicio={servicio}
                      selected={servicioNails?.nombre === servicio.nombre}
                      onClick={() => handleServicioClick(servicio)}
                    />
                  ))}
                </div>

                {servicioNails && (
                  <AddonsSection
                    label="Servicios adicionales de uñas (100% para tu Beluer)"
                    addons={addonsNails}
                    selectedAddons={addonsSeleccionados}
                    onToggle={toggleAddon}
                  />
                )}

                <div className="cliente-panel-form-group">
                  <label>Fecha deseada</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(event) => setFecha(event.target.value)}
                  />
                </div>

                <div className="cliente-panel-form-group">
                  <label>Hora exacta</label>
                  <input
                    type="time"
                    value={hora}
                    onChange={(event) => setHora(event.target.value)}
                  />
                </div>

                <label className="cliente-panel-urgencia-toggle">
                  <input
                    type="checkbox"
                    checked={urgencia}
                    onChange={(event) => setUrgencia(event.target.checked)}
                  />
                  <span>
                    ⚡ Necesito este servicio con urgencia (máx. 2 horas)
                  </span>
                </label>

                <div className="cliente-panel-form-group">
                  <label>Modo de asignación</label>
                  <select
                    value={modoAsignacion}
                    onChange={(event) => {
                      setModoAsignacion(event.target.value as AssignmentMode);
                      setBeluerSeleccionada("");
                    }}
                  >
                    <option value="gestionado">
                      Gestionado (belu elige por ti)
                    </option>
                    <option value="libre">
                      Libre (tú eliges a tu beluer)
                    </option>
                  </select>
                </div>

                {modoAsignacion === "gestionado" && (
                  <div className="cliente-panel-info-box">
                    <p>¿Cómo funciona el Modo Gestionado?</p>
                    <span>
                      Publicamos tu solicitud en nuestro canal interno. La
                      primera beluer disponible en tu zona aceptará y recibirás
                      confirmación inmediata.
                    </span>
                    <small>Precio fijo garantizado. Sin sorpresas.</small>
                  </div>
                )}

                {modoAsignacion === "libre" && (
                  <div className="cliente-panel-libre-box">
                    <p>Elige a tu beluer (precio fijo para todas):</p>

                    <div className="cliente-panel-beluer-selection-grid">
                      {beluersDisponibles.length > 0 ? (
                        beluersDisponibles.map((beluer) => (
                          <button
                            key={beluer.nombre}
                            type="button"
                            className={`cliente-panel-beluer-mini-card ${
                              beluerSeleccionada === beluer.nombre
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => setBeluerSeleccionada(beluer.nombre)}
                          >
                            <img src={beluer.foto} alt={beluer.nombre} />
                            <h4>{beluer.nombre}</h4>
                            <span>
                              ⭐ {beluer.rating} · {beluer.citas} citas
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="cliente-panel-empty-grid">
                          No hay beluers disponibles para estos servicios en
                          este momento.
                        </p>
                      )}
                    </div>

                    <small>
                      Solo se muestran las beluers que realizan los servicios
                      seleccionados.
                    </small>
                  </div>
                )}

                <div className="cliente-panel-form-group">
                  <label>Instrucciones adicionales</label>
                  <textarea placeholder="Ej: prefiero diseño francés, color rojo intenso..." />
                </div>

                {serviciosSeleccionados.length > 0 && (
                  <div className="cliente-panel-resumen-pago">
                    <div className="linea">
                      <span>💰 Servicios seleccionados</span>
                      <strong>
                        {serviciosSeleccionados
                          .map((servicio) => servicio.nombre)
                          .join(" + ")}
                      </strong>
                    </div>

                    {addonsActivos.length > 0 && (
                      <div className="addons-wrapper">
                        <div className="addons-title">
                          ✨ Servicios adicionales
                        </div>
                        {addonsActivos.map((addon) => (
                          <div className="linea-addon" key={addon.nombre}>
                            <span>{addon.nombre}</span>
                            <strong>+ S/ {addon.precio}</strong>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="linea">
                      <span>🚗 Cargo logístico único:</span>
                      <strong>S/ {cargoLogistico}</strong>
                    </div>

                    <div className="linea total">
                      <span>Subtotal</span>
                      <strong>S/ {subtotal}</strong>
                    </div>

                    {urgencia && (
                      <div className="express">
                        <div className="linea">
                          <span>⚡ Belu Express (recargo):</span>
                          <strong>+ S/ {recargoExpress}</strong>
                        </div>
                        <div className="linea total">
                          <span>Total a pagar</span>
                          <strong>S/ {total}</strong>
                        </div>
                        <small>
                          Te confirmamos una beluer en máximo 30 minutos o te
                          reembolsamos el recargo.
                        </small>
                      </div>
                    )}
                  </div>
                )}

                <button
                  className="cliente-panel-btn-r cliente-panel-full-btn"
                  type="button"
                  onClick={handleConfirmarReserva}
                >
                  Reservar servicio ✦
                </button>
              </div>
            </section>
          )}

          {activeSection === "beluers" && (
  <EspecialistasSection
    beluers={beluersData}
    favoritas={beluersFavoritas}
    onToggleFavorita={toggleBeluerFavorita}
    goToReserva={() => goToSection("reserva")}
  />
)}


{activeSection === "favoritas" && (
  <FavoritasSection
    beluers={beluersData}
    favoritas={beluersFavoritas}
    onToggleFavorita={toggleBeluerFavorita}
    goToReserva={() => goToSection("reserva")}
    goToEspecialistas={() => goToSection("beluers")}
  />
)}

{activeSection !== "dashboard" &&
  activeSection !== "reserva" &&
  activeSection !== "beluers" &&
  activeSection !== "favoritas" && (
    <section className="cliente-panel-section active">
      <div className="cliente-panel-top-bar">
        <div className="cliente-panel-greeting">
          <h1>{getSectionTitle(activeSection)}</h1>
          <p>Esta sección se construirá en el siguiente bloque.</p>
        </div>

        <UserPill />
      </div>

      <div className="cliente-panel-card">
        <h3>{getSectionTitle(activeSection)}</h3>
        <p>
          Panel base conectado correctamente. Esta sección se migrará en
          un siguiente bloque.
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
      {pagoOpen && (
  <div className="cliente-panel-modal-overlay">
    <div className="cliente-panel-modal">
      <button
        className="cliente-panel-modal-close"
        type="button"
        onClick={() => setPagoOpen(false)}
        aria-label="Cerrar modal"
      >
        ×
      </button>

      <h2>💳 Completa tu pago</h2>

      <div className="cliente-panel-detalle-pago">
        <div className="linea-pago">
          <span>Servicios</span>
          <strong>
            {serviciosSeleccionados
              .map((servicio) => servicio.nombre)
              .join(" + ")}
          </strong>
        </div>

        {addonsActivos.map((addon) => (
          <div className="linea-pago addon" key={addon.nombre}>
            <span>{addon.nombre}</span>
            <strong>+ S/ {addon.precio}</strong>
          </div>
        ))}

        <div className="linea-pago">
          <span>Cargo logístico</span>
          <strong>S/ 10</strong>
        </div>

        {urgencia && (
          <div className="linea-pago express">
            <span>Belu Express</span>
            <strong>+ S/ 20</strong>
          </div>
        )}

        <div className="linea-pago total">
          <span>Total a pagar</span>
          <strong>S/ {total}</strong>
        </div>

        {modoAsignacion === "libre" && beluerSeleccionada ? (
          <div className="cliente-panel-beluer-info-pago">
            Tu servicio será realizado por <strong>{beluerSeleccionada}</strong>.
          </div>
        ) : (
          <div className="cliente-panel-beluer-info-pago gestionado">
            belu asignará una Beluer disponible para tu horario.
          </div>
        )}
      </div>

      <div className="cliente-panel-metodos-pago">
        <button
          type="button"
          className={metodoPago === "tarjeta" ? "seleccionado" : ""}
          onClick={() => setMetodoPago("tarjeta")}
        >
          💳 Tarjeta
        </button>

        <button
          type="button"
          className={metodoPago === "yape" ? "seleccionado" : ""}
          onClick={() => setMetodoPago("yape")}
        >
          📱 Yape
        </button>

        <button
          type="button"
          className={metodoPago === "plin" ? "seleccionado" : ""}
          onClick={() => setMetodoPago("plin")}
        >
          📱 Plin
        </button>
      </div>

      <button
        className="cliente-panel-btn-r cliente-panel-full-btn"
        type="button"
        onClick={handleConfirmarPago}
      >
        Confirmar pago
      </button>
    </div>
  </div>
)}

{confirmacionOpen && (
  <div className="cliente-panel-popup-confirmacion">
    <div className="cliente-panel-popup-content">
      <div className="cliente-panel-popup-logo">belu ✦</div>

      <h2>¡Reserva confirmada!</h2>
      <p>Tu servicio ha sido agendado exitosamente.</p>

      <div className="cliente-panel-detalle-reserva">
        <p>
          <strong>Servicio:</strong>{" "}
          {serviciosSeleccionados
            .map((servicio) => servicio.nombre)
            .join(" + ")}
        </p>

        {addonsActivos.map((addon) => (
          <p className="addon-line" key={addon.nombre}>
            + {addon.nombre} · S/ {addon.precio}
          </p>
        ))}

        <p>
          <strong>Fecha:</strong> {fecha}
        </p>

        <p>
          <strong>Hora:</strong> {hora}
        </p>

        <p>
          <strong>Método:</strong>{" "}
          {metodoPago === "tarjeta"
            ? "Tarjeta"
            : metodoPago === "yape"
            ? "Yape"
            : "Plin"}
        </p>

        <p>
          <strong>Total:</strong> S/ {total}
        </p>

        <div className="beluer-confirm">
          {modoAsignacion === "libre" && beluerSeleccionada ? (
            <>
              Beluer asignada: <strong>{beluerSeleccionada}</strong>
            </>
          ) : (
            <>belu asignará una Beluer disponible en tu zona.</>
          )}
        </div>
      </div>

      <button
        className="cliente-panel-btn-r cliente-panel-full-btn"
        type="button"
        onClick={handleIrDashboard}
      >
        Ir a mi dashboard
      </button>
    </div>
  </div>
)}
    </div>
  );
}

function DashboardSection({
  goToSection,
  reservaConfirmada,
  serviciosSeleccionados,
  addonsActivos,
  fecha,
  hora,
  total,
  modoAsignacion,
  beluerSeleccionada,
}: {
  goToSection: (section: PanelSection) => void;
  reservaConfirmada: boolean;
  serviciosSeleccionados: Service[];
  addonsActivos: Addon[];
  fecha: string;
  hora: string;
  total: number;
  modoAsignacion: AssignmentMode;
  beluerSeleccionada: string;
}) {
  return (
    <section className="cliente-panel-section active">
      <div className="cliente-panel-top-bar">
        <div className="cliente-panel-greeting">
          <h1>Bienvenida, María ✦</h1>
          <p>
            {reservaConfirmada
              ? "Tienes una reserva activa"
              : "Aún no tienes reservas activas"}
          </p>
        </div>

        <UserPill />
      </div>

      {!reservaConfirmada ? (
        <div className="cliente-panel-empty-state">
          <h2>No tienes ninguna reserva activa.</h2>
          <p>
            Tu brillo no espera. Es tu momento de consentirte y recordarle al
            mundo lo increíble que eres.
          </p>

          <button
            className="cliente-panel-btn-r"
            type="button"
            onClick={() => goToSection("reserva")}
          >
            Agendar mi primera cita ✦
          </button>
        </div>
      ) : (
        <div className="cliente-panel-reserva-activa-card">
          <div className="cliente-panel-ra-badge">Reserva activa</div>

          <h2>Tu cita belu está confirmada ✦</h2>
          <p>
            Tu servicio ya está agendado. Te notificaremos por WhatsApp con los
            datos de tu Beluer.
          </p>

          <div className="cliente-panel-ra-grid">
            <div>
              <span>Servicios</span>
              <strong>
                {serviciosSeleccionados
                  .map((servicio) => servicio.nombre)
                  .join(" + ")}
              </strong>
            </div>

            <div>
              <span>Total pagado</span>
              <strong>S/ {total}</strong>
            </div>

            <div>
              <span>Fecha</span>
              <strong>{fecha}</strong>
            </div>

            <div>
              <span>Hora</span>
              <strong>{hora}</strong>
            </div>

            {addonsActivos.length > 0 && (
              <div className="full">
                <span>Adicionales</span>
                <strong>
                  {addonsActivos.map((addon) => addon.nombre).join(" + ")}
                </strong>
              </div>
            )}

            <div className="full">
              <span>Asignación</span>
              <strong>
                {modoAsignacion === "libre" && beluerSeleccionada
                  ? beluerSeleccionada
                  : "Gestionado por belu"}
              </strong>
            </div>
          </div>

          <div className="cliente-panel-ra-acciones">
            <button type="button">📅 Reprogramar</button>
            <button type="button">👩‍🎨 Cambiar Beluer</button>
            <button type="button">❌ Cancelar</button>
          </div>
        </div>
      )}

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
  );
}

function UserPill() {
  return (
    <div className="cliente-panel-user-pill">
      <div className="cliente-panel-avatar">MC</div>
      <span>María Claudia R.</span>
    </div>
  );
}

function EspecialistasSection({

  beluers,
  favoritas,
  onToggleFavorita,
  goToReserva,
}: {
  beluers: Beluer[];
  favoritas: string[];
  onToggleFavorita: (nombre: string) => void;
  goToReserva: () => void;
}) {
  const [filtroCategoria, setFiltroCategoria] = useState<
    "todas" | "lashes" | "nails" | "mixta"
  >("todas");

  const beluersFiltradas = beluers.filter((beluer) => {
    if (filtroCategoria === "todas") return true;
    return beluer.categoria === filtroCategoria;
  });

  return (
    <section className="cliente-panel-section active">
      <div className="cliente-panel-top-bar">
        <div className="cliente-panel-greeting">
          <h1>Nuestras Especialistas</h1>
          <p>Beluers verificadas para lashes, nails y servicios mixtos.</p>
        </div>

        <UserPill />
      </div>

      <div className="cliente-panel-beluers-toolbar">
        <button
          type="button"
          className={filtroCategoria === "todas" ? "active" : ""}
          onClick={() => setFiltroCategoria("todas")}
        >
          Todas
        </button>

        <button
          type="button"
          className={filtroCategoria === "lashes" ? "active" : ""}
          onClick={() => setFiltroCategoria("lashes")}
        >
          Lashes
        </button>

        <button
          type="button"
          className={filtroCategoria === "nails" ? "active" : ""}
          onClick={() => setFiltroCategoria("nails")}
        >
          Nails
        </button>

        <button
          type="button"
          className={filtroCategoria === "mixta" ? "active" : ""}
          onClick={() => setFiltroCategoria("mixta")}
        >
          Mixtas
        </button>
      </div>

      <div className="cliente-panel-beluers-grid">
        {beluersFiltradas.map((beluer) => (
          <BeluerCard
            key={beluer.nombre}
            beluer={beluer}
            esFavorita={favoritas.includes(beluer.nombre)}
            onToggleFavorita={() => onToggleFavorita(beluer.nombre)}
            goToReserva={goToReserva}
          />
        ))}
      </div>
    </section>
  );
}
function FavoritasSection({
  beluers,
  favoritas,
  onToggleFavorita,
  goToReserva,
  goToEspecialistas,
}: {
  beluers: Beluer[];
  favoritas: string[];
  onToggleFavorita: (nombre: string) => void;
  goToReserva: () => void;
  goToEspecialistas: () => void;
}) {
  const beluersFavoritas = beluers.filter((beluer) =>
    favoritas.includes(beluer.nombre)
  );

  return (
    <section className="cliente-panel-section active">
      <div className="cliente-panel-top-bar">
        <div className="cliente-panel-greeting">
          <h1>Tus beluers favoritas</h1>
          <p>
            Accede rápido a las especialistas que más te gustan y reserva con
            ellas en menos pasos.
          </p>
        </div>

        <UserPill />
      </div>

      {beluersFavoritas.length === 0 ? (
        <div className="cliente-panel-favoritas-empty">
          <div className="cliente-panel-empty-heart">♥</div>
          <h2>Aún no tienes favoritas.</h2>
          <p>
            Marca con corazón a tus Beluers preferidas para encontrarlas más
            rápido la próxima vez.
          </p>

          <button
            className="cliente-panel-btn-r"
            type="button"
            onClick={goToEspecialistas}
          >
            Ver especialistas ✦
          </button>
        </div>
      ) : (
        <div className="cliente-panel-beluers-grid">
          {beluersFavoritas.map((beluer) => (
            <BeluerCard
              key={beluer.nombre}
              beluer={beluer}
              esFavorita={favoritas.includes(beluer.nombre)}
              onToggleFavorita={() => onToggleFavorita(beluer.nombre)}
              goToReserva={goToReserva}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function BeluerCard({
  beluer,
  esFavorita,
  onToggleFavorita,
  goToReserva,
}: {
  beluer: Beluer;
  esFavorita: boolean;
  onToggleFavorita: () => void;
  goToReserva: () => void;
}) {
  return (
    <article className="cliente-panel-beluer-card">
      <div className="cliente-panel-beluer-card-header">
        <img src={beluer.foto} alt={beluer.nombre} />

        <button
          type="button"
          className={`cliente-panel-fav-btn ${esFavorita ? "active" : ""}`}
          onClick={onToggleFavorita}
          aria-label="Marcar como favorita"
        >
          ♥
        </button>
      </div>

      <div className="cliente-panel-beluer-card-body">
        <div className="cliente-panel-beluer-badge">
          {getBeluerBadge(beluer.categoria)}
        </div>

        <h3>{beluer.nombre}</h3>
        <p>{beluer.espec}</p>

        <div className="cliente-panel-beluer-meta">
          <span>⭐ {beluer.rating}</span>
          <span>{beluer.citas} citas</span>
        </div>

        <div className="cliente-panel-beluer-services">
          {beluer.serviciosActivos.slice(0, 5).map((servicio) => (
            <span key={servicio}>{servicio}</span>
          ))}

          {beluer.serviciosActivos.length > 5 && (
            <span>+{beluer.serviciosActivos.length - 5} más</span>
          )}
        </div>

        <div className="cliente-panel-beluer-actions">
          <button
            type="button"
            className="cliente-panel-btn-ghost"
            onClick={goToReserva}
          >
            Reservar con ella →
          </button>
        </div>
      </div>
    </article>
  );
}

function getBeluerBadge(categoria: Beluer["categoria"]) {
  if (categoria === "lashes") return "Beluer Lashes";
  if (categoria === "nails") return "Beluer Nails";
  return "Beluer Mixta ✦";
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

function ServiceCard({
  servicio,
  selected,
  onClick,
}: {
  servicio: Service;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`cliente-panel-servicio-card ${selected ? "selected" : ""}`}
      type="button"
      onClick={onClick}
    >
      <img src={servicio.foto} alt={servicio.nombre} />
      <div className="cliente-panel-servicio-card-body">
        <h4>{servicio.nombre}</h4>
        <span>S/ {servicio.precio}</span>
      </div>
    </button>
  );
}

function AddonsSection({
  label,
  addons,
  selectedAddons,
  onToggle,
}: {
  label: string;
  addons: Addon[];
  selectedAddons: string[];
  onToggle: (addonNombre: string) => void;
}) {
  return (
    <div className="cliente-panel-addons-section">
      <label>{label}</label>

      <div className="cliente-panel-addons-grid">
        {addons.map((addon) => (
          <button
            key={addon.nombre}
            type="button"
            className={`cliente-panel-addon-item ${
              selectedAddons.includes(addon.nombre) ? "selected" : ""
            }`}
            onClick={() => onToggle(addon.nombre)}
          >
            <span className="addon-check">
              {selectedAddons.includes(addon.nombre) ? "✓" : ""}
            </span>
            <span className="addon-info">
              <strong>{addon.nombre}</strong>
              <small>+ S/ {addon.precio}</small>
            </span>
          </button>
        ))}
      </div>
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

function crearPlaceholder(nombre: string, color: string) {
  const encoded = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#${color}"/>
          <stop offset="100%" stop-color="#E60023"/>
        </linearGradient>
      </defs>
      <rect width="400" height="280" rx="28" fill="url(#g)"/>
      <circle cx="65" cy="55" r="28" fill="white" opacity="0.22"/>
      <circle cx="335" cy="225" r="48" fill="white" opacity="0.16"/>
      <text x="200" y="138" font-family="Poppins, Arial, sans-serif" font-size="34" font-weight="800" fill="white" text-anchor="middle">${nombre}</text>
      <text x="200" y="172" font-family="Poppins, Arial, sans-serif" font-size="16" fill="rgba(255,255,255,.9)" text-anchor="middle">belu ✦</text>
    </svg>
  `);

  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}