"use client";

import { useState } from "react";
import { updateBeluerGoalsAction } from "@/app/actions/beluer/updateBeluerGoals";
import { updateBeluerPublicProfileAction } from "@/app/actions/beluer/updateBeluerPublicProfile";
import {
  fotosPortafolioIniciales,
  ingresosIniciales,
  perfilInicial,
  reservasIniciales,
  serviciosIniciales,
} from "./beluerPanelData";
import type {
  BeluerSection,
  FotoPortafolio,
  IngresoBeluer,
  PerfilBeluer,
  ReservaBeluer,
  ReservaEstado,
  ServicioBeluer,
} from "./beluerPanelTypes";

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



type BeluerPanelProfile = {
  publicName: string;
  firstName: string;
  levelLabel: "Beluer Nueva" | "Beluer Verificada" | "Beluer Top ✦";
  statusLabel: "Activo" | "En revisión" | "Pausado";
  photoUrl: string;
  initials: string;
  rating: string;
  instagram: string;
  phone: string;
  bio: string;
  experienceYears: number;
  districts: string[];
  isAvailable: boolean;
  weeklyIncomeGoal: number;
monthlyIncomeGoal: number;
weeklyIncome: number;
monthlyIncome: number;
};

type BeluerPanelOriginalPageProps = {
  beluerProfile: BeluerPanelProfile | null;
  realReservas: ReservaBeluer[];
};

export default function BeluerPanelOriginalPage({
  beluerProfile,
  realReservas,
}: BeluerPanelOriginalPageProps) {
  const [activeSection, setActiveSection] =
    useState<BeluerSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reservas, setReservas] = useState<ReservaBeluer[]>(realReservas);
const [reservaDetalle, setReservaDetalle] = useState<ReservaBeluer | null>(
  null
);
const [servicios, setServicios] =
  useState<ServicioBeluer[]>(serviciosIniciales);
  const [fotosPortafolio, setFotosPortafolio] = useState<FotoPortafolio[]>(
  fotosPortafolioIniciales
);
const [ingresos] = useState<IngresoBeluer[]>(ingresosIniciales);
const [perfilBeluer, setPerfilBeluer] = useState<PerfilBeluer>(() => ({
  ...perfilInicial,
  nombrePublico: beluerProfile?.publicName || perfilInicial.nombrePublico,
  instagram: beluerProfile?.instagram || "",
  whatsapp: beluerProfile?.phone || "",
  experiencia: beluerProfile?.experienceYears || 0,
  bio: beluerProfile?.bio || "",
  nivel: beluerProfile?.levelLabel || perfilInicial.nivel,
  estado: beluerProfile?.statusLabel || perfilInicial.estado,
  distritos: beluerProfile?.districts || [],
  disponibilidadGeneral: beluerProfile?.isAvailable ?? false,
}));

  const beluerDisplayName = beluerProfile?.publicName || perfilBeluer.nombrePublico;
const beluerFirstName =
  beluerProfile?.firstName || beluerDisplayName.split(" ")[0] || "Beluer";
const beluerLevel = beluerProfile?.levelLabel || perfilBeluer.nivel;
const beluerPhoto = beluerProfile?.photoUrl || "/beluer-placeholder.jpg";
const beluerInitials = beluerProfile?.initials || "B";
const beluerRating = beluerProfile?.rating || "5.0";

const ingresosMes = reservas
  .filter((reserva) => reserva.estado === "aceptada")
  .reduce((acc, reserva) => acc + Number(reserva.total || 0), 0);

  const weeklyIncome = beluerProfile?.weeklyIncome || 0;
const weeklyIncomeGoal = beluerProfile?.weeklyIncomeGoal || 1000;
const weeklyProgress =
  weeklyIncomeGoal > 0
    ? Math.min((weeklyIncome / weeklyIncomeGoal) * 100, 100)
    : 0;

    const monthlyIncome = beluerProfile?.monthlyIncome || 0;
const monthlyIncomeGoal = beluerProfile?.monthlyIncomeGoal || 4000;
const monthlyProgress =
  monthlyIncomeGoal > 0
    ? Math.min((monthlyIncome / monthlyIncomeGoal) * 100, 100)
    : 0;

const [weeklyGoalInput, setWeeklyGoalInput] = useState(
  String(weeklyIncomeGoal)
);
const [monthlyGoalInput, setMonthlyGoalInput] = useState(
  String(monthlyIncomeGoal)
);
const [goalLoading, setGoalLoading] = useState(false);

  const goToSection = (section: BeluerSection) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };
  const reservasPendientes = reservas.filter(
  (reserva) => reserva.estado === "pendiente"
);

const reservasAceptadas = reservas.filter(
  (reserva) => reserva.estado === "aceptada"
);

const handleAceptarReserva = (id: string) => {
  setReservas((current) =>
    current.map((reserva) =>
      reserva.id === id ? { ...reserva, estado: "aceptada" } : reserva
    )
  );

  setReservaDetalle(null);
};

const handleRechazarReserva = (id: string) => {
  setReservas((current) =>
    current.map((reserva) =>
      reserva.id === id ? { ...reserva, estado: "rechazada" } : reserva
    )
  );

  setReservaDetalle(null);
};
const handleToggleServicio = (id: string) => {
  setServicios((current) =>
    current.map((servicio) =>
      servicio.id === id
        ? { ...servicio, activo: !servicio.activo }
        : servicio
    )
  );
};

const handleCambiarPrecioServicio = (id: string, precio: number) => {
  setServicios((current) =>
    current.map((servicio) =>
      servicio.id === id ? { ...servicio, precio } : servicio
    )
  );
};

const handleGuardarServicios = () => {
  const serviciosConPrecioBajo = servicios.filter(
    (servicio) => servicio.activo && servicio.precio < servicio.precioMinimo
  );

  if (serviciosConPrecioBajo.length > 0) {
    alert(
      "Hay servicios activos con precio menor al mínimo permitido por belu."
    );
    return;
  }

  alert("Tus servicios y precios fueron actualizados correctamente.");
};
const handleAgregarFoto = () => {
  const nuevaFoto: FotoPortafolio = {
    id: `foto-${Date.now()}`,
    titulo: "Nueva foto pendiente",
    categoria: "lashes",
    imagen:
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80",
    estado: "pendiente",
    portada: false,
  };

  setFotosPortafolio((current) => [nuevaFoto, ...current]);
  alert("Foto agregada como simulación. Más adelante se subirá con Supabase Storage.");
};

const handleEliminarFoto = (id: string) => {
  setFotosPortafolio((current) => current.filter((foto) => foto.id !== id));
};

const handleMarcarPortada = (id: string) => {
  setFotosPortafolio((current) =>
    current.map((foto) => ({
      ...foto,
      portada: foto.id === id,
    }))
  );
};
const handleActualizarCampoPerfil = <K extends keyof PerfilBeluer>(
  campo: K,
  valor: PerfilBeluer[K]
) => {
  setPerfilBeluer((current) => ({
    ...current,
    [campo]: valor,
  }));
};

const handleToggleDistrito = (distrito: string) => {
  setPerfilBeluer((current) => {
    const existe = current.distritos.includes(distrito);

    return {
      ...current,
      distritos: existe
        ? current.distritos.filter((item) => item !== distrito)
        : [...current.distritos, distrito],
    };
  });
};

const handleGuardarPerfilBeluer = async () => {
  const formData = new FormData();

  formData.append("instagram", perfilBeluer.instagram);
  formData.append("phone", perfilBeluer.whatsapp);
  formData.append("bio", perfilBeluer.bio);

  const result = await updateBeluerPublicProfileAction(formData);

  if (!result.success) {
    alert(result.message);
    return;
  }

  alert(result.message);
  window.location.reload();
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
  <img src={beluerPhoto} alt={beluerDisplayName} />
  <div>
    <strong>{beluerDisplayName}</strong>
    <span>{beluerLevel}</span>
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
                  <h1>Hola, {beluerFirstName} ✦</h1>
                  <p>Este es tu centro de control como Beluer.</p>
                </div>

                <BeluerPill nombre={beluerDisplayName} iniciales={beluerInitials} />
              </div>

              <div className="beluer-panel-kpi-grid">
                <KpiCard label="Reservas pendientes" value={String(reservasPendientes.length)} />
<KpiCard label="Reservas aceptadas" value={String(reservasAceptadas.length)} />
<KpiCard label="Ingresos del mes" value={`S/ ${ingresosMes.toFixed(2)}`} />
<KpiCard label="Rating promedio" value={beluerRating} />
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
                          <span>{getReservaEstadoLabel(reserva.estado)}</span>
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
                          <button type="button" onClick={() => handleAceptarReserva(reserva.id)}>
  Aceptar
</button>
<button
  type="button"
  className="secondary"
  onClick={() => setReservaDetalle(reserva)}
>
  Ver detalle
</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="beluer-panel-card">
                  <h2>Meta semanal</h2>
<p>Vas {weeklyProgress.toFixed(0)}% hacia tu meta de ingresos.</p>
<div className="beluer-panel-progress">
  <span style={{ width: `${weeklyProgress}%` }} />
</div>
<strong>
  S/ {weeklyIncome.toFixed(2)} de S/ {weeklyIncomeGoal.toFixed(2)}
</strong>
                </div>
              </div>
            </section>
          )}

          {activeSection === "reservas" && (
  <ReservasSection
    reservas={reservas}
    onAceptar={handleAceptarReserva}
    onRechazar={handleRechazarReserva}
    onVerDetalle={setReservaDetalle}
    beluerDisplayName={beluerDisplayName}
    beluerInitials={beluerInitials}
  />
)}
{activeSection === "servicios" && (
  <ServiciosSection
    servicios={servicios}
    onToggleServicio={handleToggleServicio}
    onCambiarPrecio={handleCambiarPrecioServicio}
    onGuardar={handleGuardarServicios}
    beluerDisplayName={beluerDisplayName}
    beluerInitials={beluerInitials}
  />
)}

{activeSection === "portafolio" && (
  <PortafolioSection
    fotos={fotosPortafolio}
    onAgregarFoto={handleAgregarFoto}
    onEliminarFoto={handleEliminarFoto}
    onMarcarPortada={handleMarcarPortada}
    beluerDisplayName={beluerDisplayName}
    beluerInitials={beluerInitials}
  />
)}
{activeSection === "ingresos" && (
  <IngresosSection
    ingresos={ingresos}
    beluerDisplayName={beluerDisplayName}
    beluerInitials={beluerInitials}
    weeklyIncome={weeklyIncome}
    weeklyIncomeGoal={weeklyIncomeGoal}
    weeklyProgress={weeklyProgress}
    monthlyIncome={monthlyIncome}
    monthlyIncomeGoal={monthlyIncomeGoal}
    monthlyProgress={monthlyProgress}
    weeklyGoalInput={weeklyGoalInput}
    monthlyGoalInput={monthlyGoalInput}
    goalLoading={goalLoading}
    onWeeklyGoalChange={setWeeklyGoalInput}
    onMonthlyGoalChange={setMonthlyGoalInput}
    onSaveGoals={async () => {
      setGoalLoading(true);

      const formData = new FormData();
      formData.append("weeklyIncomeGoal", weeklyGoalInput);
      formData.append("monthlyIncomeGoal", monthlyGoalInput);

      const result = await updateBeluerGoalsAction(formData);

      setGoalLoading(false);

      if (!result.success) {
        alert(result.message);
        return;
      }

      alert(result.message);
      window.location.reload();
    }}
  />
)}
{activeSection === "perfil" && (
  <PerfilBeluerSection
    perfil={perfilBeluer}
    onActualizarCampo={handleActualizarCampoPerfil}
    onToggleDistrito={handleToggleDistrito}
    onGuardar={handleGuardarPerfilBeluer}
    beluerDisplayName={beluerDisplayName}
    beluerInitials={beluerInitials}
  />
)}

{activeSection !== "dashboard" &&
  activeSection !== "reservas" &&
  activeSection !== "servicios" &&
  activeSection !== "portafolio" &&
  activeSection !== "ingresos" &&
  activeSection !== "perfil" && (
  <section className="beluer-panel-section active">
              <div className="beluer-panel-top-bar">
                <div className="beluer-panel-greeting">
                  <h1>{getSectionTitle(activeSection)}</h1>
                  <p>Esta sección se construirá en el siguiente bloque.</p>
                </div>

                <BeluerPill nombre={beluerDisplayName} iniciales={beluerInitials} />
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
      {reservaDetalle && (
  <div className="beluer-panel-modal-overlay">
    <div className="beluer-panel-modal">
      <button
        className="beluer-panel-modal-close"
        type="button"
        onClick={() => setReservaDetalle(null)}
        aria-label="Cerrar detalle"
      >
        ×
      </button>

      <div className="beluer-panel-modal-badge">
        {getReservaEstadoLabel(reservaDetalle.estado)}
      </div>

      <h2>{reservaDetalle.servicio}</h2>
      <p className="beluer-panel-modal-subtitle">
        Solicitud de {reservaDetalle.clienta}
      </p>

      <div className="beluer-panel-modal-info-grid">
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
          <span>Total</span>
          <strong>S/ {reservaDetalle.total}</strong>
        </div>

        <div className="full">
          <span>Dirección</span>
          <strong>{reservaDetalle.direccion}</strong>
        </div>

        <div className="full">
          <span>Instrucciones</span>
          <strong>{reservaDetalle.instrucciones}</strong>
        </div>

        <div>
          <span>Método de pago</span>
          <strong>{reservaDetalle.metodoPago}</strong>
        </div>
      </div>

      {reservaDetalle.estado === "pendiente" && (
        <div className="beluer-panel-modal-actions">
          <button
            type="button"
            className="beluer-panel-btn-secondary"
            onClick={() => handleRechazarReserva(reservaDetalle.id)}
          >
            Rechazar
          </button>

          <button
            type="button"
            className="beluer-panel-btn-primary"
            onClick={() => handleAceptarReserva(reservaDetalle.id)}
          >
            Aceptar reserva
          </button>
        </div>
      )}
    </div>
  </div>
)}
    </div>
  );
}
function ReservasSection({
  reservas,
  onAceptar,
  onRechazar,
  onVerDetalle,
  beluerDisplayName,
  beluerInitials,
}: {
  reservas: ReservaBeluer[];
  onAceptar: (id: string) => void;
  onRechazar: (id: string) => void;
  onVerDetalle: (reserva: ReservaBeluer) => void;
  beluerDisplayName: string;
  beluerInitials: string;
}) {
  const pendientes = reservas.filter((reserva) => reserva.estado === "pendiente");
  const aceptadas = reservas.filter((reserva) => reserva.estado === "aceptada");
  const rechazadas = reservas.filter((reserva) => reserva.estado === "rechazada");

  return (
    <section className="beluer-panel-section active">
      <div className="beluer-panel-top-bar">
        <div className="beluer-panel-greeting">
          <h1>Reservas</h1>
          <p>Gestiona tus solicitudes, citas aceptadas y reservas rechazadas.</p>
        </div>

        <BeluerPill nombre={beluerDisplayName} iniciales={beluerInitials} />
      </div>

      <div className="beluer-panel-reservas-summary">
        <div>
          <span>Pendientes</span>
          <strong>{pendientes.length}</strong>
        </div>

        <div>
          <span>Aceptadas</span>
          <strong>{aceptadas.length}</strong>
        </div>

        <div>
          <span>Rechazadas</span>
          <strong>{rechazadas.length}</strong>
        </div>
      </div>

      <div className="beluer-panel-reservas-section-block">
        <h2>Solicitudes pendientes</h2>

        {pendientes.length > 0 ? (
          <div className="beluer-panel-reservas-board">
            {pendientes.map((reserva) => (
              <ReservaBeluerCard
                key={reserva.id}
                reserva={reserva}
                onAceptar={onAceptar}
                onRechazar={onRechazar}
                onVerDetalle={onVerDetalle}
              />
            ))}
          </div>
        ) : (
          <div className="beluer-panel-empty-state">
            No tienes solicitudes pendientes por ahora.
          </div>
        )}
      </div>

      <div className="beluer-panel-reservas-section-block">
        <h2>Reservas aceptadas</h2>

        {aceptadas.length > 0 ? (
          <div className="beluer-panel-reservas-board">
            {aceptadas.map((reserva) => (
              <ReservaBeluerCard
                key={reserva.id}
                reserva={reserva}
                onAceptar={onAceptar}
                onRechazar={onRechazar}
                onVerDetalle={onVerDetalle}
              />
            ))}
          </div>
        ) : (
          <div className="beluer-panel-empty-state">
            Aún no tienes reservas aceptadas.
          </div>
        )}
      </div>
    </section>
  );
}

function ReservaBeluerCard({
  reserva,
  onAceptar,
  onRechazar,
  onVerDetalle,
}: {
  reserva: ReservaBeluer;
  onAceptar: (id: string) => void;
  onRechazar: (id: string) => void;
  onVerDetalle: (reserva: ReservaBeluer) => void;
}) {
  return (
    <article className={`beluer-panel-reserva-full-card ${reserva.estado}`}>
      <div className="beluer-panel-reserva-full-top">
        <span>{getReservaEstadoLabel(reserva.estado)}</span>
        <strong>S/ {reserva.total}</strong>
      </div>

      <h3>{reserva.servicio}</h3>
      <p>{reserva.clienta}</p>

      <div className="beluer-panel-reserva-full-meta">
        <span>📍 {reserva.distrito}</span>
        <span>📅 {reserva.fecha}</span>
        <span>🕒 {reserva.hora}</span>
      </div>

      <div className="beluer-panel-reserva-full-actions">
        <button type="button" onClick={() => onVerDetalle(reserva)}>
          Ver detalle
        </button>

        {reserva.estado === "pendiente" && (
          <>
            <button
              type="button"
              className="secondary"
              onClick={() => onRechazar(reserva.id)}
            >
              Rechazar
            </button>

            <button
              type="button"
              className="primary"
              onClick={() => onAceptar(reserva.id)}
            >
              Aceptar
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function getReservaEstadoLabel(estado: ReservaEstado) {
  const labels: Record<ReservaEstado, string> = {
    pendiente: "Pendiente de aceptar",
    aceptada: "Aceptada",
    rechazada: "Rechazada",
  };

  return labels[estado];
}
function ServiciosSection({
  servicios,
  onToggleServicio,
  onCambiarPrecio,
  onGuardar,
  beluerDisplayName,
  beluerInitials,
}: {
  servicios: ServicioBeluer[];
  onToggleServicio: (id: string) => void;
  onCambiarPrecio: (id: string, precio: number) => void;
  onGuardar: () => void;
  beluerDisplayName: string;
  beluerInitials: string;
}) {
  const activos = servicios.filter((servicio) => servicio.activo);
  const lashes = servicios.filter((servicio) => servicio.categoria === "lashes");
  const nails = servicios.filter((servicio) => servicio.categoria === "nails");
  const brows = servicios.filter((servicio) => servicio.categoria === "brows");

  return (
    <section className="beluer-panel-section active">
      <div className="beluer-panel-top-bar">
        <div className="beluer-panel-greeting">
          <h1>Mis servicios</h1>
          <p>
            Activa los servicios que realizas y define tus precios respetando el
            mínimo de belu.
          </p>
        </div>

        <BeluerPill nombre={beluerDisplayName} iniciales={beluerInitials} />
      </div>

      <div className="beluer-panel-servicios-summary">
        <div>
          <span>Servicios activos</span>
          <strong>{activos.length}</strong>
        </div>

        <div>
          <span>Lashes</span>
          <strong>{lashes.filter((servicio) => servicio.activo).length}</strong>
        </div>

        <div>
          <span>Nails</span>
          <strong>{nails.filter((servicio) => servicio.activo).length}</strong>
        </div>

        <div>
          <span>Brows</span>
          <strong>{brows.filter((servicio) => servicio.activo).length}</strong>
        </div>
      </div>

      <div className="beluer-panel-servicios-alert">
        <strong>Autonomía con estándar belu ✦</strong>
        <span>
          Puedes definir tus precios, pero cada servicio debe respetar el precio
          mínimo para proteger el posicionamiento premium de la plataforma.
        </span>
      </div>

      <ServicioCategoriaBlock
        titulo="Lashes"
        servicios={lashes}
        onToggleServicio={onToggleServicio}
        onCambiarPrecio={onCambiarPrecio}
      />

      <ServicioCategoriaBlock
        titulo="Brows"
        servicios={brows}
        onToggleServicio={onToggleServicio}
        onCambiarPrecio={onCambiarPrecio}
      />

      <ServicioCategoriaBlock
        titulo="Nails"
        servicios={nails}
        onToggleServicio={onToggleServicio}
        onCambiarPrecio={onCambiarPrecio}
      />

      <div className="beluer-panel-servicios-footer">
        <button
          className="beluer-panel-btn-primary"
          type="button"
          onClick={onGuardar}
        >
          Guardar cambios
        </button>
      </div>
    </section>
  );
}

function ServicioCategoriaBlock({
  titulo,
  servicios,
  onToggleServicio,
  onCambiarPrecio,
}: {
  titulo: string;
  servicios: ServicioBeluer[];
  onToggleServicio: (id: string) => void;
  onCambiarPrecio: (id: string, precio: number) => void;
}) {
  if (servicios.length === 0) return null;

  return (
    <div className="beluer-panel-servicios-block">
      <h2>{titulo}</h2>

      <div className="beluer-panel-servicios-grid">
        {servicios.map((servicio) => (
          <article
            className={`beluer-panel-servicio-card ${
              servicio.activo ? "activo" : "inactivo"
            }`}
            key={servicio.id}
          >
            <div className="beluer-panel-servicio-card-top">
              <div>
                <span>{servicio.categoria}</span>
                <h3>{servicio.nombre}</h3>
              </div>

              <label className="beluer-panel-switch">
                <input
                  type="checkbox"
                  checked={servicio.activo}
                  onChange={() => onToggleServicio(servicio.id)}
                />
                <span />
              </label>
            </div>

            <div className="beluer-panel-servicio-meta">
              <span>Duración: {servicio.duracion}</span>
              <span>Mínimo belu: S/ {servicio.precioMinimo}</span>
            </div>

            <div className="beluer-panel-servicio-price">
              <label>Tu precio</label>

              <div>
                <span>S/</span>
                <input
                  type="number"
                  min={servicio.precioMinimo}
                  value={servicio.precio}
                  onChange={(event) =>
                    onCambiarPrecio(servicio.id, Number(event.target.value))
                  }
                />
              </div>

              {servicio.precio < servicio.precioMinimo && (
                <small>
                  El precio no puede ser menor a S/ {servicio.precioMinimo}.
                </small>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
function PortafolioSection({
  fotos,
  onAgregarFoto,
  onEliminarFoto,
  onMarcarPortada,
  beluerDisplayName,
  beluerInitials,
}: {
  fotos: FotoPortafolio[];
  onAgregarFoto: () => void;
  onEliminarFoto: (id: string) => void;
  onMarcarPortada: (id: string) => void;
  beluerDisplayName: string;
  beluerInitials: string;
}) {
  const [filtro, setFiltro] = useState<"todas" | "lashes" | "nails" | "brows">(
    "todas"
  );

  const fotosFiltradas = fotos.filter((foto) => {
    if (filtro === "todas") return true;
    return foto.categoria === filtro;
  });

  const aprobadas = fotos.filter((foto) => foto.estado === "aprobada").length;
  const pendientes = fotos.filter((foto) => foto.estado === "pendiente").length;

  return (
    <section className="beluer-panel-section active">
      <div className="beluer-panel-top-bar">
        <div className="beluer-panel-greeting">
          <h1>Portafolio</h1>
          <p>
            Gestiona tus fotos de trabajos realizados. Las nuevas fotos quedarán
            pendientes de aprobación por belu.
          </p>
        </div>

        <BeluerPill nombre={beluerDisplayName} iniciales={beluerInitials} />
      </div>

      <div className="beluer-panel-portafolio-summary">
        <div>
          <span>Total de fotos</span>
          <strong>{fotos.length}</strong>
        </div>

        <div>
          <span>Aprobadas</span>
          <strong>{aprobadas}</strong>
        </div>

        <div>
          <span>Pendientes</span>
          <strong>{pendientes}</strong>
        </div>
      </div>

      <div className="beluer-panel-portafolio-actions">
        <div className="beluer-panel-portafolio-filtros">
          <button
            type="button"
            className={filtro === "todas" ? "active" : ""}
            onClick={() => setFiltro("todas")}
          >
            Todas
          </button>

          <button
            type="button"
            className={filtro === "lashes" ? "active" : ""}
            onClick={() => setFiltro("lashes")}
          >
            Lashes
          </button>

          <button
            type="button"
            className={filtro === "nails" ? "active" : ""}
            onClick={() => setFiltro("nails")}
          >
            Nails
          </button>

          <button
            type="button"
            className={filtro === "brows" ? "active" : ""}
            onClick={() => setFiltro("brows")}
          >
            Brows
          </button>
        </div>

        <button
          type="button"
          className="beluer-panel-btn-primary"
          onClick={onAgregarFoto}
        >
          Subir foto simulada
        </button>
      </div>

      {fotosFiltradas.length > 0 ? (
        <div className="beluer-panel-portafolio-grid">
          {fotosFiltradas.map((foto) => (
            <article className="beluer-panel-foto-card" key={foto.id}>
              <div className="beluer-panel-foto-img">
                <img src={foto.imagen} alt={foto.titulo} />

                {foto.portada && (
                  <span className="beluer-panel-foto-portada">Portada</span>
                )}

                <span className={`beluer-panel-foto-estado ${foto.estado}`}>
                  {foto.estado === "aprobada" ? "Aprobada" : "Pendiente"}
                </span>
              </div>

              <div className="beluer-panel-foto-body">
                <div>
                  <span>{foto.categoria}</span>
                  <h3>{foto.titulo}</h3>
                </div>

                <div className="beluer-panel-foto-actions">
                  <button
                    type="button"
                    onClick={() => onMarcarPortada(foto.id)}
                    disabled={foto.portada}
                  >
                    {foto.portada ? "Ya es portada" : "Marcar portada"}
                  </button>

                  <button
                    type="button"
                    className="danger"
                    onClick={() => onEliminarFoto(foto.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="beluer-panel-empty-state">
          No hay fotos para este filtro.
        </div>
      )}
    </section>
  );
}
function IngresosSection({
  ingresos,
  beluerDisplayName,
  beluerInitials,
  weeklyIncome,
  weeklyIncomeGoal,
  weeklyProgress,
  monthlyIncome,
  monthlyIncomeGoal,
  monthlyProgress,
  weeklyGoalInput,
  monthlyGoalInput,
  goalLoading,
  onWeeklyGoalChange,
  onMonthlyGoalChange,
  onSaveGoals,
}: {
  ingresos: IngresoBeluer[];
  beluerDisplayName: string;
  beluerInitials: string;
  weeklyIncome: number;
  weeklyIncomeGoal: number;
  weeklyProgress: number;
  monthlyIncome: number;
  monthlyIncomeGoal: number;
  monthlyProgress: number;
  weeklyGoalInput: string;
  monthlyGoalInput: string;
  goalLoading: boolean;
  onWeeklyGoalChange: (value: string) => void;
  onMonthlyGoalChange: (value: string) => void;
  onSaveGoals: () => void;
}) {
  const totalBruto = ingresos.reduce(
    (acc, ingreso) => acc + ingreso.totalServicio,
    0
  );

  const totalComision = ingresos.reduce(
    (acc, ingreso) => acc + ingreso.comisionBelu,
    0
  );

  const totalNeto = ingresos.reduce(
    (acc, ingreso) => acc + ingreso.netoBeluer,
    0
  );

  const pagosPendientes = ingresos
    .filter((ingreso) => ingreso.estadoPago === "pendiente")
    .reduce((acc, ingreso) => acc + ingreso.netoBeluer, 0);

  const serviciosCompletados = ingresos.length;

  return (
    <section className="beluer-panel-section active">
      <div className="beluer-panel-top-bar">
        <div className="beluer-panel-greeting">
          <h1>Ingresos</h1>
          <p>
            Revisa cuánto generaste, cuánto corresponde a comisión y cuánto
            tienes pendiente por cobrar.
          </p>
        </div>

        <BeluerPill nombre={beluerDisplayName} iniciales={beluerInitials} />
      </div>

      <div className="beluer-panel-card beluer-panel-goals-card">
  <div className="beluer-panel-card-header">
    <div>
      <span className="beluer-panel-eyebrow">Metas personales</span>
      <h2>Mis metas de ingresos</h2>
      <p>
        Define tus objetivos. belu calculará el avance usando tus reservas reales.
      </p>
    </div>
  </div>

  <div className="beluer-panel-goals-grid">
    <div className="beluer-panel-goal-box">
      <h3>Meta semanal</h3>
      <p>
        S/ {weeklyIncome.toFixed(2)} de S/ {weeklyIncomeGoal.toFixed(2)}
      </p>

      <div className="beluer-panel-progress">
        <span style={{ width: `${weeklyProgress}%` }} />
      </div>

      <label>Editar meta semanal</label>
      <input
        type="number"
        min={1}
        value={weeklyGoalInput}
        onChange={(event) => onWeeklyGoalChange(event.target.value)}
      />
    </div>

    <div className="beluer-panel-goal-box">
      <h3>Meta mensual</h3>
      <p>
        S/ {monthlyIncome.toFixed(2)} de S/ {monthlyIncomeGoal.toFixed(2)}
      </p>

      <div className="beluer-panel-progress">
        <span style={{ width: `${monthlyProgress}%` }} />
      </div>

      <label>Editar meta mensual</label>
      <input
        type="number"
        min={1}
        value={monthlyGoalInput}
        onChange={(event) => onMonthlyGoalChange(event.target.value)}
      />
    </div>
  </div>

  <button
    className="beluer-panel-btn-primary"
    type="button"
    onClick={onSaveGoals}
    disabled={goalLoading}
  >
    {goalLoading ? "Guardando metas..." : "Guardar metas"}
  </button>
</div>

      <div className="beluer-panel-ingresos-hero">
        <div>
          <span>Neto estimado del mes</span>
          <strong>S/ {totalNeto}</strong>
          <p>
            Este monto considera servicios completados menos la comisión de belu.
          </p>
        </div>

        <div className="beluer-panel-ingresos-progress">
          <span style={{ width: "72%" }} />
        </div>

        <small>72% de tu meta mensual de S/ 1,200</small>
      </div>

      <div className="beluer-panel-ingresos-summary">
        <div>
          <span>Bruto generado</span>
          <strong>S/ {totalBruto}</strong>
        </div>

        <div>
          <span>Comisión belu</span>
          <strong>S/ {totalComision}</strong>
        </div>

        <div>
          <span>Neto Beluer</span>
          <strong>S/ {totalNeto}</strong>
        </div>

        <div>
          <span>Pendiente de pago</span>
          <strong>S/ {pagosPendientes}</strong>
        </div>

        <div>
          <span>Servicios completados</span>
          <strong>{serviciosCompletados}</strong>
        </div>
      </div>

      <div className="beluer-panel-ingresos-card">
        <div className="beluer-panel-ingresos-card-header">
          <div>
            <h2>Historial de ingresos</h2>
            <p>Detalle de cada servicio realizado a través de belu.</p>
          </div>

          <button
            type="button"
            className="beluer-panel-btn-secondary"
            onClick={() =>
              alert(
                "Más adelante aquí se descargará un reporte real en PDF o Excel."
              )
            }
          >
            Descargar reporte
          </button>
        </div>

        <div className="beluer-panel-ingresos-list">
          {ingresos.map((ingreso) => (
            <article className="beluer-panel-ingreso-row" key={ingreso.id}>
              <div className="beluer-panel-ingreso-main">
                <span className={`estado ${ingreso.estadoPago}`}>
                  {getIngresoEstadoLabel(ingreso.estadoPago)}
                </span>

                <h3>{ingreso.servicio}</h3>
                <p>
                  {ingreso.clienta} · {ingreso.fecha}
                </p>
              </div>

              <div className="beluer-panel-ingreso-numeros">
                <div>
                  <span>Bruto</span>
                  <strong>S/ {ingreso.totalServicio}</strong>
                </div>

                <div>
                  <span>Comisión</span>
                  <strong>- S/ {ingreso.comisionBelu}</strong>
                </div>

                <div>
                  <span>Neto</span>
                  <strong className="neto">S/ {ingreso.netoBeluer}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function getIngresoEstadoLabel(estado: IngresoBeluer["estadoPago"]) {
  const labels: Record<IngresoBeluer["estadoPago"], string> = {
    pendiente: "Pendiente",
    pagado: "Pagado",
    retenido: "Retenido",
  };

  return labels[estado];
}

function PerfilBeluerSection({
  perfil,
  onActualizarCampo,
  onToggleDistrito,
  onGuardar,
  beluerDisplayName,
  beluerInitials,
}: {
  perfil: PerfilBeluer;
  onActualizarCampo: <K extends keyof PerfilBeluer>(
    campo: K,
    valor: PerfilBeluer[K]
  ) => void;
  onToggleDistrito: (distrito: string) => void;
  onGuardar: () => void;
  beluerDisplayName: string;
  beluerInitials: string;
}) {
  const distritosDisponibles = [
    "Miraflores",
    "San Isidro",
    "Surco",
    "La Molina",
    "Barranco",
  ];

  return (
    <section className="beluer-panel-section active">
      <div className="beluer-panel-top-bar">
        <div className="beluer-panel-greeting">
          <h1>Mi perfil</h1>
          <p>
            Actualiza tu información pública, zonas de atención y disponibilidad.
          </p>
        </div>

        <BeluerPill nombre={beluerDisplayName} iniciales={beluerInitials} />
      </div>

      <div className="beluer-panel-perfil-layout">
        <aside className="beluer-panel-perfil-card">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80"
            alt={perfil.nombrePublico}
          />

          <h2>{perfil.nombrePublico}</h2>
          <p>{perfil.nivel}</p>

          <div className={`beluer-panel-perfil-status ${perfil.estado.toLowerCase().replace(" ", "-")}`}>
            {perfil.estado}
          </div>

          <div className="beluer-panel-perfil-stats">
            <div>
              <strong>{perfil.experiencia}</strong>
              <span>Años</span>
            </div>

            <div>
              <strong>{perfil.distritos.length}</strong>
              <span>Zonas</span>
            </div>

            <div>
              <strong>5.0</strong>
              <span>Rating</span>
            </div>
          </div>

          <div className="beluer-panel-perfil-note">
            <strong>Perfil público</strong>
            <span>
              Esta información será visible para clientas cuando elijan una
              Beluer en modo libre.
            </span>
          </div>
        </aside>

        <div className="beluer-panel-perfil-form-card">
          <h3>Información principal</h3>

          <div className="beluer-panel-form-grid">
            <div className="beluer-panel-form-group">
              <label>Nombre público</label>
              <input
  type="text"
  value={perfil.nombrePublico}
  readOnly
/>
            </div>

            <div className="beluer-panel-form-group">
              <label>Instagram</label>
              <input
                type="text"
                value={perfil.instagram}
                onChange={(event) =>
                  onActualizarCampo("instagram", event.target.value)
                }
              />
            </div>

            <div className="beluer-panel-form-group">
              <label>WhatsApp</label>
              <input
                type="tel"
                value={perfil.whatsapp}
                onChange={(event) =>
                  onActualizarCampo("whatsapp", event.target.value)
                }
              />
            </div>

            <div className="beluer-panel-form-group">
              <label>Años de experiencia</label>
              <input
  type="number"
  min={0}
  value={perfil.experiencia}
  readOnly
/>
            </div>
          </div>

          <div className="beluer-panel-form-group">
            <label>Bio pública</label>
            <textarea
              value={perfil.bio}
              onChange={(event) =>
                onActualizarCampo("bio", event.target.value)
              }
            />
          </div>

          <div className="beluer-panel-form-grid">
            <div className="beluer-panel-form-group">
              <label>Nivel Beluer</label>
              <input
  type="text"
  value={perfil.nivel}
  readOnly
/>
            </div>

            <div className="beluer-panel-form-group">
              <label>Estado del perfil</label>
              <input
  type="text"
  value={perfil.estado}
  readOnly
/>
            </div>
          </div>

          <div className="beluer-panel-distritos-box">
            <label>Distritos de atención</label>

            <div className="beluer-panel-distritos-grid">
              {distritosDisponibles.map((distrito) => (
  <button
    key={distrito}
    type="button"
    className={perfil.distritos.includes(distrito) ? "active" : ""}
    disabled
  >
    {distrito}
  </button>
))}
            </div>
          </div>

          <label className="beluer-panel-disponibilidad-toggle">
            <input
  type="checkbox"
  checked={perfil.disponibilidadGeneral}
  readOnly
/>
            <span>
              Estoy disponible para recibir nuevas solicitudes de belu.
            </span>
          </label>

          <button
            className="beluer-panel-btn-primary beluer-panel-full-btn"
            type="button"
            onClick={onGuardar}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </section>
  );
}

function BeluerPill({
  nombre = "Beluer",
  iniciales = "B",
}: {
  nombre?: string;
  iniciales?: string;
}) {
  return (
    <div className="beluer-panel-user-pill">
      <div className="beluer-panel-avatar">{iniciales}</div>
      <span>{nombre}</span>
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