"use client";

import { useMemo, useState } from "react";
import { createBookingAction } from "@/app/actions/client/createBooking";
import {
  addonsLashes,
  addonsNails,
  beluersData,
  catalogoLashes,
  catalogoNails,
  historialData,
  pagosData,
} from "./clientePanelData";
import type {
  Addon,
  AssignmentMode,
  Beluer,
  GestionReservaModal,
  PanelSection,
  PaymentMethod,
  Service,
} from "./clientePanelTypes";

type ClientProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

type ClientBooking = {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  payment_status: string;
  public_price: number;
  district: string;
  address: string;
  services: {
    name: string;
    category: string;
  } | null;
  beluer_profiles: {
    public_name: string | null;
  } | null;
};

type ClientePanelOriginalPageProps = {
  clientProfile: ClientProfile | null;
  nextBooking: ClientBooking | null;
  realBeluers: Beluer[];
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

export default function ClientePanelOriginalPage({
  clientProfile,
  nextBooking,
  realBeluers,
}: ClientePanelOriginalPageProps) {
  const [activeSection, setActiveSection] = useState<PanelSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [servicioLashes, setServicioLashes] = useState<Service | null>(null);
  const [servicioNails, setServicioNails] = useState<Service | null>(null);
  const [addonsSeleccionados, setAddonsSeleccionados] = useState<string[]>([]);
const [fecha, setFecha] = useState("2026-05-15");
const [hora, setHora] = useState("14:30");
const [direccionReserva, setDireccionReserva] = useState("");
const [distritoReserva, setDistritoReserva] = useState("Miraflores");
const [notasReserva, setNotasReserva] = useState("");
const [bookingLoading, setBookingLoading] = useState(false);
const [urgencia, setUrgencia] = useState(false);
  const [modoAsignacion, setModoAsignacion] =
    useState<AssignmentMode>("gestionado");
  const [beluerSeleccionada, setBeluerSeleccionada] = useState("");
  const [pagoOpen, setPagoOpen] = useState(false);
const [confirmacionOpen, setConfirmacionOpen] = useState(false);
const [metodoPago, setMetodoPago] = useState<PaymentMethod>("tarjeta");
const [reservaConfirmada, setReservaConfirmada] = useState(false);
const [beluersFavoritas, setBeluersFavoritas] = useState<string[]>([
  "Andrea Robles",
]);
const [modalGestion, setModalGestion] =
  useState<GestionReservaModal>(null);

const [nuevaFecha, setNuevaFecha] = useState(fecha);
const [nuevaHora, setNuevaHora] = useState(hora);
const [nuevaBeluer, setNuevaBeluer] = useState("");

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

const normalizarTexto = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const beluersDisponibles = useMemo(() => {
  if (serviciosSeleccionados.length === 0) return realBeluers;

  const requeridos = serviciosSeleccionados.map((servicio) =>
    normalizarTexto(servicio.nombre)
  );

  return realBeluers.filter((beluer) => {
    const serviciosBeluer = beluer.serviciosActivos.map((servicio) =>
      normalizarTexto(servicio)
    );

    return requeridos.every((servicioRequerido) =>
      serviciosBeluer.some(
        (servicioBeluer) =>
          servicioBeluer.includes(servicioRequerido) ||
          servicioRequerido.includes(servicioBeluer)
      )
    );
  });
}, [serviciosSeleccionados, realBeluers]);

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

  if (serviciosSeleccionados.length > 1) {
    alert(
      "Por ahora solo puedes reservar un servicio a la vez. Luego activaremos reservas combinadas."
    );
    return;
  }

  if (!fecha || !hora) {
    alert("Selecciona fecha y hora.");
    return;
  }

  if (!direccionReserva.trim()) {
    alert("Ingresa la dirección donde se realizará el servicio.");
    return;
  }

  if (!distritoReserva) {
    alert("Selecciona el distrito.");
    return;
  }

  if (modoAsignacion === "libre" && !beluerSeleccionada) {
    alert("Elige a tu beluer antes de continuar.");
    return;
  }

  setPagoOpen(true);
};

const handleConfirmarPago = async () => {
  const servicioPrincipal = serviciosSeleccionados[0];

  if (!servicioPrincipal) {
    alert("Selecciona un servicio antes de confirmar.");
    return;
  }

  setBookingLoading(true);

  const formData = new FormData();
  formData.append("serviceName", servicioPrincipal.nombre);
  formData.append("bookingMode", modoAsignacion);
formData.append("selectedBeluerName", beluerSeleccionada);
  formData.append("scheduledDate", fecha);
  formData.append("scheduledTime", hora);
  formData.append("address", direccionReserva.trim());
  formData.append("district", distritoReserva);
  formData.append("notes", notasReserva.trim());
  formData.append("isExpress", urgencia ? "true" : "false");

  const result = await createBookingAction(
    {
      success: false,
      message: "",
    },
    formData
  );

  setBookingLoading(false);

  if (!result.success) {
    alert(result.message);
    return;
  }

  setPagoOpen(false);
  setConfirmacionOpen(true);
  setReservaConfirmada(false);
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
const handleReprogramarReserva = () => {
  setFecha(nuevaFecha);
  setHora(nuevaHora);
  setModalGestion(null);
  alert("Tu cita ha sido reprogramada correctamente.");
};

const handleCambiarBeluer = () => {
  if (!nuevaBeluer) {
    alert("Selecciona una nueva Beluer.");
    return;
  }

  setBeluerSeleccionada(nuevaBeluer);
  setModoAsignacion("libre");
  setModalGestion(null);
  alert(`Tu Beluer ha sido cambiada a ${nuevaBeluer}.`);
};

const handleCancelarReserva = () => {
  setReservaConfirmada(false);
  setModalGestion(null);
  alert("Tu reserva ha sido cancelada.");
};

const clientName = clientProfile?.full_name || "Clienta";
const clientFirstName = clientProfile?.full_name?.split(" ")[0] || "Clienta";
const hasRealBooking = Boolean(nextBooking);

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
  reservaConfirmada={reservaConfirmada || hasRealBooking}
  serviciosSeleccionados={serviciosSeleccionados}
  addonsActivos={addonsActivos}
  fecha={fecha}
  hora={hora}
  total={total}
  modoAsignacion={modoAsignacion}
  beluerSeleccionada={beluerSeleccionada}
  onOpenGestion={setModalGestion}
  clientFirstName={clientFirstName}
  nextBooking={nextBooking}
  clientName={clientName}
/>
)}

          {activeSection === "reserva" && (
            <section className="cliente-panel-section active">
              <div className="cliente-panel-top-bar">
                <div className="cliente-panel-greeting">
                  <h1>Agendar nueva cita</h1>
                </div>

                <UserPill clientName={clientName} />
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

                <div className="cliente-panel-form-group">
  <label>Distrito</label>
  <select
    value={distritoReserva}
    onChange={(event) => setDistritoReserva(event.target.value)}
  >
    <option value="Miraflores">Miraflores</option>
    <option value="San Isidro">San Isidro</option>
    <option value="Surco">Surco</option>
    <option value="La Molina">La Molina</option>
    <option value="Barranco">Barranco</option>
    <option value="San Borja">San Borja</option>
    <option value="San Miguel">San Miguel</option>
  </select>
</div>

<div className="cliente-panel-form-group">
  <label>Dirección del servicio</label>
  <input
    type="text"
    value={direccionReserva}
    onChange={(event) => setDireccionReserva(event.target.value)}
    placeholder="Ej: Av. Santa Cruz 950, dpto 402"
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
  <textarea
    value={notasReserva}
    onChange={(event) => setNotasReserva(event.target.value)}
    placeholder="Ej: prefiero diseño francés, color rojo intenso..."
  />
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
    clientName={clientName}
  />
)}


{activeSection === "favoritas" && (
  <FavoritasSection
    beluers={beluersData}
    favoritas={beluersFavoritas}
    onToggleFavorita={toggleBeluerFavorita}
    goToReserva={() => goToSection("reserva")}
    goToEspecialistas={() => goToSection("beluers")}
    clientName={clientName}
  />
)}

{activeSection === "historial" && (
  <HistorialSection goToReserva={() => goToSection("reserva")} clientName={clientName} />
)}
{activeSection === "pagos" && <PagosSection clientName={clientName} />}
{activeSection === "perfil" && (
  <PerfilSection clientName={clientName} clientProfile={clientProfile} />
)}

{activeSection !== "dashboard" &&
  activeSection !== "reserva" &&
  activeSection !== "beluers" &&
  activeSection !== "favoritas" &&
  activeSection !== "historial" &&
activeSection !== "pagos" &&
activeSection !== "perfil" && (
    <section className="cliente-panel-section active">
      <div className="cliente-panel-top-bar">
        <div className="cliente-panel-greeting">
          <h1>{getSectionTitle(activeSection)}</h1>
          <p>Esta sección se construirá en el siguiente bloque.</p>
        </div>

        <UserPill clientName={clientName} />
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
        <div>
  <span>Servicio</span>
  <strong>
    {nextBooking?.services?.name ||
      serviciosSeleccionados.map((servicio) => servicio.nombre).join(" + ")}
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
  disabled={bookingLoading}
>
  {bookingLoading ? "Creando reserva..." : "Confirmar pago"}
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
    {modalGestion === "reprogramar" && (
  <div className="cliente-panel-modal-overlay">
    <div className="cliente-panel-gestion-modal">
      <button
        className="cliente-panel-modal-close"
        type="button"
        onClick={() => setModalGestion(null)}
        aria-label="Cerrar modal"
      >
        ×
      </button>

      <h3>📅 Reprogramar cita</h3>
      <p className="subtitulo">
        Elige una nueva fecha y hora para tu servicio.
      </p>

      <div className="cliente-panel-gestion-aviso">
        Las reprogramaciones gratuitas se permiten hasta 4 horas antes del
        servicio. Después, puede aplicar una tarifa de S/ 10.
      </div>

      <div className="cliente-panel-form-group">
        <label>Nueva fecha</label>
        <input
          type="date"
          value={nuevaFecha}
          onChange={(event) => setNuevaFecha(event.target.value)}
        />
      </div>

      <div className="cliente-panel-form-group">
        <label>Nueva hora</label>
        <input
          type="time"
          value={nuevaHora}
          onChange={(event) => setNuevaHora(event.target.value)}
        />
      </div>

      <button
        className="cliente-panel-btn-r cliente-panel-full-btn"
        type="button"
        onClick={handleReprogramarReserva}
      >
        Confirmar nuevo horario
      </button>
    </div>
  </div>
)}

{modalGestion === "cambiarBeluer" && (
  <div className="cliente-panel-modal-overlay">
    <div className="cliente-panel-gestion-modal">
      <button
        className="cliente-panel-modal-close"
        type="button"
        onClick={() => setModalGestion(null)}
        aria-label="Cerrar modal"
      >
        ×
      </button>

      <h3>👩‍🎨 Cambiar tu Beluer</h3>
      <p className="subtitulo">
        Elige otra especialista disponible para tu servicio.
      </p>

      <div className="cliente-panel-gestion-aviso">
        El cambio es gratuito si se realiza hasta 2 horas antes. Solo se
        muestran Beluers compatibles con los servicios reservados.
      </div>

      <div className="cliente-panel-beluer-selection-grid">
        {beluersDisponibles.length > 0 ? (
          beluersDisponibles.map((beluer) => (
            <button
              key={beluer.nombre}
              type="button"
              className={`cliente-panel-beluer-mini-card ${
                nuevaBeluer === beluer.nombre ? "selected" : ""
              }`}
              onClick={() => setNuevaBeluer(beluer.nombre)}
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
            No hay Beluers disponibles para este servicio.
          </p>
        )}
      </div>

      <button
        className="cliente-panel-btn-r cliente-panel-full-btn"
        type="button"
        onClick={handleCambiarBeluer}
      >
        Confirmar cambio
      </button>
    </div>
  </div>
)}

{modalGestion === "cancelar" && (
  <div className="cliente-panel-modal-overlay">
    <div className="cliente-panel-gestion-modal">
      <button
        className="cliente-panel-modal-close"
        type="button"
        onClick={() => setModalGestion(null)}
        aria-label="Cerrar modal"
      >
        ×
      </button>

      <h3>❌ Cancelar reserva</h3>
      <p className="subtitulo">
        ¿Estás segura de que deseas cancelar tu cita?
      </p>

      <div className="cliente-panel-gestion-aviso danger">
        <strong>Política de cancelación:</strong>
        <br />
        • Hasta 4h antes: reembolso completo.
        <br />
        • Entre 4h y 1h antes: reembolso del 50%.
        <br />• Menos de 1h antes: sin reembolso.
      </div>

      <div className="cliente-panel-gestion-actions">
        <button
          className="cliente-panel-btn-ghost"
          type="button"
          onClick={() => setModalGestion(null)}
        >
          Mantener mi cita
        </button>

        <button
          className="cliente-panel-btn-r cliente-panel-btn-muted"
          type="button"
          onClick={handleCancelarReserva}
        >
          Sí, cancelar
        </button>
      </div>
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
  onOpenGestion,
  clientFirstName,
  nextBooking,
  clientName,
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
  onOpenGestion: (
    modal: "reprogramar" | "cambiarBeluer" | "cancelar"
  ) => void;
  clientFirstName: string;
  nextBooking: ClientBooking | null;
  clientName: string;
}) {
  return (
    <section className="cliente-panel-section active">
      <div className="cliente-panel-top-bar">
        <div className="cliente-panel-greeting">
          <h1>Bienvenida, {clientFirstName} ✦</h1>
          <p>
            {reservaConfirmada
              ? "Tienes una reserva activa"
              : "Aún no tienes reservas activas"}
          </p>
        </div>

        <UserPill clientName={clientName} />
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

          <h2>
  {nextBooking
    ? "Tu próxima cita belu ✦"
    : "Tu cita belu está confirmada ✦"}
</h2>
          <p>
            Tu servicio ya está agendado. Te notificaremos por WhatsApp con los
            datos de tu Beluer.
          </p>

          <div className="cliente-panel-ra-grid">
            <div>
              <span>Servicio</span>
<strong>
  {nextBooking?.services?.name ||
    serviciosSeleccionados.map((servicio) => servicio.nombre).join(" + ")}
</strong>
            </div>

            <div>
              <span>Total</span>
<strong>S/ {nextBooking?.public_price ?? total}</strong>
            </div>

            <div>
              <span>Fecha</span>
<strong>{nextBooking?.scheduled_date || fecha}</strong>
            </div>

            <div>
              <span>Hora</span>
<strong>
  {nextBooking?.scheduled_time
    ? nextBooking.scheduled_time.slice(0, 5)
    : hora}
</strong>
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
    {nextBooking?.beluer_profiles?.public_name ||
      (modoAsignacion === "libre" && beluerSeleccionada
        ? beluerSeleccionada
        : "Gestionado por belu")}
  </strong>
</div>

{nextBooking ? (
  <div className="full">
    <span>Ubicación</span>
    <strong>
      {nextBooking.district} · {nextBooking.address}
    </strong>
  </div>
) : null}
          </div>

          <div className="cliente-panel-ra-acciones">
  <button type="button" onClick={() => onOpenGestion("reprogramar")}>
    📅 Reprogramar
  </button>

  <button type="button" onClick={() => onOpenGestion("cambiarBeluer")}>
    👩‍🎨 Cambiar Beluer
  </button>

  <button type="button" onClick={() => onOpenGestion("cancelar")}>
    ❌ Cancelar
  </button>
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
function HistorialSection({
  goToReserva,
  clientName,
}: {
  goToReserva: () => void;
  clientName: string;
}) {
  
  return (
    <section className="cliente-panel-section active">
      <div className="cliente-panel-top-bar">
        <div className="cliente-panel-greeting">
          <h1>Tu historial</h1>
          <p>Revisa tus servicios anteriores y repite tus reservas favoritas.</p>
        </div>

        <UserPill clientName={clientName} />
      </div>

      <div className="cliente-panel-historial-grid">
        {historialData.map((item) => (
          <article className="cliente-panel-historial-card" key={item.id}>
            <div className="cliente-panel-historial-img">
              <img src={item.foto} alt={item.servicio} />
              <span>{item.estado}</span>
            </div>

            <div className="cliente-panel-historial-body">
              <div className="cliente-panel-historial-header">
                <div>
                  <h3>{item.servicio}</h3>
                  <p>Realizado por {item.beluer}</p>
                </div>

                <strong>S/ {item.total}</strong>
              </div>

              <div className="cliente-panel-historial-meta">
                <span>📅 {item.fecha}</span>
                <span>🕒 {item.hora}</span>
                <span>💳 {item.metodo}</span>
              </div>

              <div className="cliente-panel-historial-rating">
                {"★".repeat(item.rating)}
                {"☆".repeat(5 - item.rating)}
              </div>

              <p className="cliente-panel-historial-comment">
                “{item.comentario}”
              </p>

              <div className="cliente-panel-historial-actions">
                <button
                  type="button"
                  className="cliente-panel-btn-r"
                  onClick={goToReserva}
                >
                  Repetir reserva ✦
                </button>

                <button type="button" className="cliente-panel-btn-ghost">
                  Ver detalle
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function PagosSection({
  clientName,
}: {
  clientName: string;
}) {
  
  const totalPagado = pagosData.reduce((acc, pago) => acc + pago.monto, 0);

  return (
    <section className="cliente-panel-section active">
      <div className="cliente-panel-top-bar">
        <div className="cliente-panel-greeting">
          <h1>Historial de pagos</h1>
          <p>Consulta tus pagos, métodos usados y comprobantes.</p>
        </div>

        <UserPill clientName={clientName} />
      </div>

      <div className="cliente-panel-pagos-summary">
        <div>
  <span>Total pagado</span>
          <strong>S/ {totalPagado}</strong>
</div>

        <div>
          <span>Transacciones</span>
          <strong>{pagosData.length}</strong>
        </div>

        <div>
          <span>Último método</span>
          <strong>{pagosData[0].metodo}</strong>
        </div>
      </div>

      <div className="cliente-panel-pagos-list">
        {pagosData.map((pago) => (
          <article className="cliente-panel-pago-card" key={pago.id}>
            <div className="cliente-panel-pago-main">
              <div>
                <div className="cliente-panel-pago-id">{pago.id}</div>
                <h3>{pago.concepto}</h3>
                <p>Atención realizada por {pago.beluer}</p>
              </div>

              <div className="cliente-panel-pago-monto">
                <span>{pago.estado}</span>
                <strong>S/ {pago.monto}</strong>
              </div>
            </div>

            <div className="cliente-panel-pago-meta">
              <span>📅 {pago.fecha}</span>
              <span>💳 {pago.metodo}</span>
              <span>🔐 Operación {pago.operacion}</span>
            </div>

            <div className="cliente-panel-pago-actions">
              <button
                type="button"
                className="cliente-panel-btn-ghost"
                onClick={() =>
                  alert(
                    `Comprobante simulado\n\nCódigo: ${pago.id}\nOperación: ${pago.operacion}\nMonto: S/ ${pago.monto}`
                  )
                }
              >
                Ver comprobante
              </button>

              <button
                type="button"
                className="cliente-panel-btn-ghost"
                onClick={() =>
                  alert(
                    "Más adelante este botón descargará el comprobante real generado por la pasarela de pago."
                  )
                }
              >
                Descargar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function PerfilSection({
  clientName,
  clientProfile,
}: {
  clientName: string;
  clientProfile: ClientProfile | null;
}) {
  const [nombre, setNombre] = useState(clientName);
  const [email, setEmail] = useState(clientProfile?.email || "");
  const [whatsapp, setWhatsapp] = useState(clientProfile?.phone || "");
  const [distrito, setDistrito] = useState("Miraflores");
  const [direccion, setDireccion] = useState(
    "Av. Comandante Espinar 456, Miraflores"
  );
  const [preferencia, setPreferencia] = useState("Lashes naturales");
  const [notificaciones, setNotificaciones] = useState(true);
  

  const handleGuardarPerfil = () => {
    alert(
      `Perfil actualizado correctamente.\n\nNombre: ${nombre}\nWhatsApp: ${whatsapp}\nDistrito: ${distrito}`
    );
  };

  

  return (
    <section className="cliente-panel-section active">
      <div className="cliente-panel-top-bar">
        <div className="cliente-panel-greeting">
          <h1>Mi perfil</h1>
          <p>Actualiza tus datos para que tu experiencia belu sea más precisa.</p>
        </div>

        <UserPill clientName={clientName} />
      </div>

      <div className="cliente-panel-perfil-layout">
        <aside className="cliente-panel-perfil-card">
          <div className="cliente-panel-perfil-avatar">{getInitials(nombre) || "C"}</div>
          <h2>{nombre.split(" ")[0] || "Clienta"}</h2>
          <p>Clienta belu ✦</p>

          <div className="cliente-panel-perfil-stats">
            <div>
              <strong>3</strong>
              <span>Reservas</span>
            </div>

            <div>
              <strong>2</strong>
              <span>Favoritas</span>
            </div>

            <div>
              <strong>5.0</strong>
              <span>Rating</span>
            </div>
          </div>

          <div className="cliente-panel-perfil-note">
            <strong>Recordatorio día 21</strong>
            <span>
              Activaremos tu recordatorio automático de retoque después de cada
              servicio completado.
            </span>
          </div>
        </aside>

        <div className="cliente-panel-perfil-form-card">
          <h3>Datos personales</h3>

          <div className="cliente-panel-form-grid">
            <div className="cliente-panel-form-group">
              <label>Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
              />
            </div>

            <div className="cliente-panel-form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="cliente-panel-form-group">
              <label>WhatsApp</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
              />
            </div>

            <div className="cliente-panel-form-group">
              <label>Distrito</label>
              <select
                value={distrito}
                onChange={(event) => setDistrito(event.target.value)}
              >
                <option value="Miraflores">Miraflores</option>
                <option value="San Isidro">San Isidro</option>
                <option value="Surco">Surco</option>
                <option value="La Molina">La Molina</option>
                <option value="Barranco">Barranco</option>
              </select>
            </div>
          </div>

          <div className="cliente-panel-form-group">
            <label>Dirección principal</label>
            <input
              type="text"
              value={direccion}
              onChange={(event) => setDireccion(event.target.value)}
            />
          </div>

          <div className="cliente-panel-form-group">
            <label>Preferencia de belleza</label>
            <select
              value={preferencia}
              onChange={(event) => setPreferencia(event.target.value)}
            >
              <option value="Lashes naturales">Lashes naturales</option>
              <option value="Lashes con volumen">Lashes con volumen</option>
              <option value="Nails minimalistas">Nails minimalistas</option>
              <option value="Nails protagonistas">Nails protagonistas</option>
              <option value="Lashes y nails">Lashes y nails</option>
            </select>
          </div>

          <label className="cliente-panel-perfil-toggle">
            <input
              type="checkbox"
              checked={notificaciones}
              onChange={(event) => setNotificaciones(event.target.checked)}
            />
            <span>
              Quiero recibir recordatorios por WhatsApp, incluyendo mi retoque
              del día 21.
            </span>
          </label>

          <button
            className="cliente-panel-btn-r cliente-panel-full-btn"
            type="button"
            onClick={handleGuardarPerfil}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </section>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function UserPill({ clientName = "Clienta belu" }: { clientName?: string }) {
  return (
    <div className="cliente-panel-user-pill">
      <div className="cliente-panel-avatar">
        {getInitials(clientName) || "CB"}
      </div>
      <span>{clientName}</span>
    </div>
  );
}

function EspecialistasSection({
  beluers,
  favoritas,
  onToggleFavorita,
  goToReserva,
  clientName,
}: {
  beluers: Beluer[];
  favoritas: string[];
  onToggleFavorita: (nombre: string) => void;
  goToReserva: () => void;
  clientName: string;
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

        <UserPill clientName={clientName} />
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
  clientName,
}: {
  beluers: Beluer[];
  favoritas: string[];
  onToggleFavorita: (nombre: string) => void;
  goToReserva: () => void;
  goToEspecialistas: () => void;
  clientName: string;
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

        <UserPill clientName={clientName} />
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