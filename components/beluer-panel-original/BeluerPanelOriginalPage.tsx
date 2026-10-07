"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { updateBeluerGoalsAction } from "@/app/actions/beluer/updateBeluerGoals";
import { updateBeluerPublicProfileAction } from "@/app/actions/beluer/updateBeluerPublicProfile";
import { updateBeluerBookingStatusAction } from "@/app/actions/beluer/updateBeluerBookingStatus";
import {
  BELUER_COVERAGE_DISTRICTS,
  getCanonicalBeluerCoverageDistrict,
} from "@/lib/bookings/foundation";
import { perfilInicial } from "./beluerPanelData";
import type {
  BeluerPanelProfile,
  BeluerPanelReadState,
  BeluerSection,
  FotoPortafolio,
  IngresoBeluer,
  PerfilBeluer,
  ReservaBeluer,
  ServicioBeluer,
} from "./beluerPanelTypes";
import { BeluerHome } from "@/components/belu-beluer/home/BeluerHome";
import { BeluerShellAdapter } from "@/components/belu-beluer/shell/BeluerShellAdapter";
import styles from "@/components/belu-beluer/shell/beluer-shell.module.css";

type BeluerPanelOriginalPageProps = {
  beluerProfile: BeluerPanelProfile;
  realReservas: ReservaBeluer[];
  realIngresos: IngresoBeluer[];
  realServicios: ServicioBeluer[];
  realPortafolio: FotoPortafolio[];
  readState: BeluerPanelReadState;
  logoutButton: ReactNode;
};

function formatMoney(value: number) {
  return Number(value || 0).toFixed(2);
}

function getReservaTotalBeluer(reserva: ReservaBeluer) {
  return reserva.totalBeluer ?? reserva.total ?? null;
}

function formatPayout(value: number | null | undefined) {
  return value == null ? "Por calcular" : `S/ ${formatMoney(value)}`;
}

function formatPayoutAggregate(total: number, uncalculatedCount: number) {
  if (uncalculatedCount === 0) return `S/ ${formatMoney(total)}`;
  if (total === 0) return "Por calcular";

  return `S/ ${formatMoney(total)} + ${uncalculatedCount} por calcular`;
}

function formatCommissionRate(rate: number | null) {
  if (rate === null || !Number.isFinite(rate)) return "Pendiente";

  const percentage = rate > 1 ? rate : rate * 100;

  return `${Number(percentage.toFixed(2))}%`;
}

function formatAppliedLevel(level: string | null) {
  if (!level) return "Pendiente de snapshot";

  const normalized = level
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (normalized.includes("top")) return "Top ✦";
  if (normalized.includes("premium")) return "Premium";
  if (normalized.includes("verificada") || normalized.includes("verified")) {
    return "Verificada";
  }
  if (normalized.includes("nueva") || normalized.includes("new")) {
    return "Nueva";
  }
  if (normalized.includes("standard") || normalized.includes("estandar")) {
    return "Estándar";
  }

  return level;
}

export default function BeluerPanelOriginalPage({
  beluerProfile,
  realReservas,
  realIngresos,
  realServicios,
  realPortafolio,
  readState,
  logoutButton,
}: BeluerPanelOriginalPageProps) {
  const [activeSection, setActiveSection] =
    useState<BeluerSection>("dashboard");

  const [reservas] = useState<ReservaBeluer[]>(realReservas || []);
  const [reservaDetalle, setReservaDetalle] =
    useState<ReservaBeluer | null>(null);

  const [servicios] = useState<ServicioBeluer[]>(realServicios || []);

  const [fotosPortafolio] = useState<FotoPortafolio[]>(
    realPortafolio || []
  );

  const [ingresos] = useState<IngresoBeluer[]>(realIngresos || []);

  const [perfilBeluer, setPerfilBeluer] = useState<PerfilBeluer>(() => ({
    ...perfilInicial,
    nombrePublico: beluerProfile?.publicName || perfilInicial.nombrePublico,
    instagram: beluerProfile?.instagram || "",
    whatsapp: beluerProfile?.phone || "",
    experiencia: beluerProfile?.experienceYears || 0,
    bio: beluerProfile?.bio || "",
    nivel: beluerProfile?.levelLabel || perfilInicial.nivel,
    estado: beluerProfile?.statusLabel || perfilInicial.estado,
    distritos: (beluerProfile?.districts || [])
      .map(getCanonicalBeluerCoverageDistrict)
      .filter(Boolean) as string[],
    disponibilidadGeneral: beluerProfile?.isAvailable ?? false,
  }));

  const beluerDisplayName =
    beluerProfile?.publicName || perfilBeluer.nombrePublico || "Beluer";
  const beluerPhoto = beluerProfile?.photoUrl || "/beluer-placeholder.jpg";
  const beluerInitials = beluerProfile?.initials || getInitials(beluerDisplayName);
  const beluerRating =
    beluerProfile.rating == null
      ? "Sin calificación"
      : beluerProfile.rating.toFixed(1);

  const weeklyIncome = beluerProfile.weeklyRealizedIncome;
  const monthlyIncome = beluerProfile.monthlyRealizedIncome;
  const monthlyIncomeGoal = beluerProfile.monthlyIncomeGoal;
  const monthlyProgress =
    monthlyIncomeGoal > 0
      ? Math.min((monthlyIncome / monthlyIncomeGoal) * 100, 100)
      : 0;
  const homeMonthlyProgress =
    monthlyIncomeGoal > 0 &&
    readState.bookings === "ready" &&
    beluerProfile.monthlyUncalculatedCompletedCount === 0
      ? monthlyProgress
      : null;

  const [monthlyGoalInput, setMonthlyGoalInput] = useState(
    String(monthlyIncomeGoal)
  );
  const [goalLoading, setGoalLoading] = useState(false);

  const reservasPendientes = reservas.filter(
    (reserva) => reserva.status === "assigned"
  );

  const goToSection = (section: BeluerSection) => {
    setActiveSection(section);
  };

  const handleAceptarReserva = async (id: string) => {
    const result = await updateBeluerBookingStatusAction({
      bookingId: id,
      action: "accept",
    });

    if (!result.success) {
      alert(result.message);
      return;
    }

    alert(result.message);
    window.location.reload();
  };

  const handleRechazarReserva = async (id: string) => {
    const confirmar = window.confirm(
      "¿Seguro que no puedes tomar esta reserva? Volverá a belu para ser reasignada."
    );

    if (!confirmar) return;

    const result = await updateBeluerBookingStatusAction({
      bookingId: id,
      action: "reject",
    });

    if (!result.success) {
      alert(result.message);
      return;
    }

    alert(result.message);
    window.location.reload();
  };

  const handleToggleServicio = (id: string) => {
    alert("La edición de servicios se gestionará desde Admin en esta fase.");
  };

  const handleCambiarPrecioServicio = (id: string, precio: number) => {
    alert("La edición de servicios se gestionará desde Admin en esta fase.");
  };

  const handleGuardarServicios = () => {
    alert("La edición de servicios se gestionará desde Admin en esta fase.");
  };

  const handleAgregarFoto = () => {
    alert(
      "La subida de fotos se activará cuando conectemos Supabase Storage."
    );
  };

  const handleEliminarFoto = (id: string) => {
    alert("La gestión de fotos se realizará desde Admin en esta fase.");
  };

  const handleMarcarPortada = (id: string) => {
    alert("La gestión de fotos se realizará desde Admin en esta fase.");
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

  const handleToggleDistrito = (district: string) => {
    setPerfilBeluer((current) => ({
      ...current,
      distritos: current.distritos.includes(district)
        ? current.distritos.filter((item) => item !== district)
        : [...current.distritos, district],
    }));
  };

  const handleGuardarPerfilBeluer = async () => {
    const formData = new FormData();

    formData.append("instagram", perfilBeluer.instagram);
    formData.append("phone", perfilBeluer.whatsapp);
    formData.append("bio", perfilBeluer.bio);
    perfilBeluer.distritos.forEach((district) => {
      formData.append("districts", district);
    });

    const result = await updateBeluerPublicProfileAction(formData);

    if (!result.success) {
      alert(result.message);
      return;
    }

    alert(result.message);
    window.location.reload();
  };

  return (
    <BeluerShellAdapter
      activeSection={activeSection}
      onNavigate={goToSection}
      name={beluerDisplayName}
      initials={beluerInitials}
      logoutButton={logoutButton}
    >
      <div className={activeSection === "dashboard" ? undefined : styles.legacyScope}>
        {activeSection === "dashboard" && (
          <BeluerHome
            profile={beluerProfile}
            readState={readState}
            pendingRequests={reservasPendientes}
            monthlyProgress={homeMonthlyProgress}
            onNavigate={goToSection}
          />
        )}

          {activeSection === "reservas" && (
            <ReservasSection
              reservas={reservas}
              dataAvailable={readState.bookings === "ready"}
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
              dataAvailable={readState.services === "ready"}
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
              dataAvailable={readState.portfolio === "ready"}
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
              dataAvailable={readState.bookings === "ready"}
              beluerDisplayName={beluerDisplayName}
              beluerInitials={beluerInitials}
              weeklyIncome={weeklyIncome}
              weeklyUncalculatedCount={
                beluerProfile.weeklyUncalculatedCompletedCount
              }
              monthlyIncome={monthlyIncome}
              monthlyUncalculatedCount={
                beluerProfile.monthlyUncalculatedCompletedCount
              }
              monthlyIncomeGoal={monthlyIncomeGoal}
              monthlyProgress={monthlyProgress}
              monthlyGoalInput={monthlyGoalInput}
              goalLoading={goalLoading}
              onMonthlyGoalChange={setMonthlyGoalInput}
              onSaveGoals={async () => {
                setGoalLoading(true);

                const formData = new FormData();
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
              photoUrl={beluerPhoto}
              rating={beluerRating}
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

                  <BeluerPill
                    nombre={beluerDisplayName}
                    iniciales={beluerInitials}
                  />
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
      </div>

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
              {getBookingStatusLabel(reservaDetalle)}
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
                <span>Total Beluer</span>
                <strong>{formatPayout(getReservaTotalBeluer(reservaDetalle))}</strong>
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
                <span>Estado del pago de la clienta</span>
                <strong>{reservaDetalle.metodoPago}</strong>
              </div>
            </div>

            <ReservaPayoutSummary reserva={reservaDetalle} />

            {reservaDetalle.status === "assigned" && (
              <div className="beluer-panel-modal-actions">
                <button
                  type="button"
                  className="beluer-panel-btn-secondary"
                  onClick={() => handleRechazarReserva(reservaDetalle.id)}
                >
                  No puedo
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
    </BeluerShellAdapter>
  );
}

function ReservasSection({
  reservas,
  dataAvailable,
  onAceptar,
  onRechazar,
  onVerDetalle,
  beluerDisplayName,
  beluerInitials,
}: {
  reservas: ReservaBeluer[];
  dataAvailable: boolean;
  onAceptar: (id: string) => void;
  onRechazar: (id: string) => void;
  onVerDetalle: (reserva: ReservaBeluer) => void;
  beluerDisplayName: string;
  beluerInitials: string;
}) {
  const pendientes = reservas.filter((reserva) => reserva.status === "assigned");
  const aceptadas = reservas.filter(
    (reserva) =>
      reserva.status === "confirmed" || reserva.status === "in_progress"
  );
  const completadas = reservas.filter(
    (reserva) => reserva.status === "completed"
  );

  return (
    <section className="beluer-panel-section beluer-panel-reservas-page active">
      <div className="beluer-panel-top-bar beluer-panel-reservas-topbar">
        <div className="beluer-panel-greeting">
          <span className="beluer-panel-reservas-kicker">Panel Beluer</span>
          <h1>Reservas</h1>
          <p>Gestiona tus solicitudes y citas aceptadas.</p>
        </div>

        <BeluerPill nombre={beluerDisplayName} iniciales={beluerInitials} />
      </div>

      <div className="beluer-panel-reservas-summary">
        <div>
          <span>Pendientes</span>
          <strong>{dataAvailable ? pendientes.length : "—"}</strong>
        </div>

        <div>
          <span>Aceptadas</span>
          <strong>{dataAvailable ? aceptadas.length : "—"}</strong>
        </div>

        <div>
          <span>Completadas</span>
          <strong>{dataAvailable ? completadas.length : "—"}</strong>
        </div>
      </div>

      <div className="beluer-panel-reservas-section-block">
        <div className="beluer-panel-reservas-section-head">
          <span className="beluer-panel-reservas-kicker">Decisión requerida</span>
          <h2>Solicitudes asignadas</h2>
          <p>
            Revisa cada solicitud antes de aceptarla. Si no puedes tomarla,
            belu la devolverá a la cola para reasignarla.
          </p>
        </div>

        {!dataAvailable ? (
          <div className="beluer-panel-empty-state">
            No fue posible cargar las reservas en este momento.
          </div>
        ) : pendientes.length > 0 ? (
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
            <h3>No tienes solicitudes pendientes</h3>
            <p>Cuando belu te asigne una nueva reserva, aparecerá aquí.</p>
          </div>
        )}
      </div>

      <div className="beluer-panel-reservas-section-block">
        <div className="beluer-panel-reservas-section-head">
          <span className="beluer-panel-reservas-kicker">Agenda</span>
          <h2>Reservas aceptadas</h2>
          <p>Las citas confirmadas quedan organizadas para tu jornada.</p>
        </div>

        {!dataAvailable ? null : aceptadas.length > 0 ? (
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
            <h3>Aún no tienes citas aceptadas</h3>
            <p>Las reservas que aceptes aparecerán en tu agenda.</p>
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
        <span>{getBookingStatusLabel(reserva)}</span>
        <strong>Tú recibes: {formatPayout(getReservaTotalBeluer(reserva))}</strong>
      </div>

      <h3>{reserva.servicio}</h3>
      <p>Clienta: {reserva.clienta}</p>

      <div className="beluer-panel-reserva-full-meta">
        <span>Distrito: {reserva.distrito}</span>
        <span>Fecha: {reserva.fecha}</span>
        <span>Hora: {reserva.hora}</span>
      </div>

      {reserva.direccion ? (
        <p className="beluer-panel-reserva-address">
          Dirección: {reserva.direccion}
        </p>
      ) : null}

      {reserva.instrucciones ? (
        <p className="beluer-panel-reserva-notes">
          Nota: {reserva.instrucciones}
        </p>
      ) : null}

      <ReservaPayoutSummary reserva={reserva} />

      {reserva.status === "assigned" ? (
        <p className="beluer-panel-reserva-reassign-note">
          Si no puedes tomarla, belu la devolverá a la cola para reasignarla.
        </p>
      ) : null}

      <div className="beluer-panel-reserva-full-actions">
        <button type="button" onClick={() => onVerDetalle(reserva)}>
          Ver detalle
        </button>

        {reserva.status === "assigned" && (
          <>
            <button
              type="button"
              className="secondary"
              onClick={() => onRechazar(reserva.id)}
            >
              No puedo
            </button>

            <button
              type="button"
              className="primary"
              onClick={() => onAceptar(reserva.id)}
            >
              Aceptar reserva
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function ReservaPayoutSummary({ reserva }: { reserva: ReservaBeluer }) {
  const totalBeluer = getReservaTotalBeluer(reserva);
  const pagoLogisticaBeluer = reserva.pagoLogisticaBeluer;
  const pagoExpressBeluer = reserva.pagoExpressBeluer;
  const pagoServicioBeluer = reserva.pagoServicioBeluer;
  const showExpress = (pagoExpressBeluer ?? 0) > 0;

  return (
    <div className="beluer-panel-payout-card">
      <div className="beluer-panel-payout-card-head">
        <span>Tú recibes</span>
        <strong>Total Beluer: {formatPayout(totalBeluer)}</strong>
      </div>

      <div className="beluer-panel-payout-breakdown">
        <div>
          <span>Servicio</span>
          <strong>{formatPayout(pagoServicioBeluer)}</strong>
        </div>

        <div>
          <span>Movilidad / logística</span>
          <strong>{formatPayout(pagoLogisticaBeluer)}</strong>
        </div>

        {showExpress ? (
          <div>
            <span>Express</span>
            <strong>{formatPayout(pagoExpressBeluer)}</strong>
          </div>
        ) : null}
      </div>

      <div className="beluer-panel-payout-meta">
        <span>Nivel aplicado: {formatAppliedLevel(reserva.nivelAplicado ?? null)}</span>
        <span>
          Comisión aplicada:{" "}
          {formatCommissionRate(reserva.comisionAplicada ?? null)}
        </span>
        <span>
          Estado:{" "}
          {reserva.commissionLockedAt
            ? "Comisión congelada"
            : "Pendiente de congelar"}
        </span>
        {(reserva.comisionBelu ?? 0) > 0 ? (
          <span>Comisión plataforma: S/ {formatMoney(reserva.comisionBelu ?? 0)}</span>
        ) : null}
      </div>
    </div>
  );
}

function getBookingStatusLabel(reserva: ReservaBeluer) {
  const labels: Record<ReservaBeluer["status"], string> = {
    pending: "Pendiente de asignación",
    assigned: "Solicitud asignada",
    confirmed: "Confirmada",
    in_progress: "En curso",
    completed: "Completada",
    cancelled: "Cancelada",
    redo_requested: "Retoque solicitado",
    redo_approved: "Retoque aprobado",
  };

  return labels[reserva.status];
}

function ServiciosSection({
  servicios,
  dataAvailable,
  onToggleServicio,
  onCambiarPrecio,
  onGuardar,
  beluerDisplayName,
  beluerInitials,
}: {
  servicios: ServicioBeluer[];
  dataAvailable: boolean;
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
            Revisa los servicios que Admin asignó a tu perfil Beluer.
          </p>
        </div>

        <BeluerPill nombre={beluerDisplayName} iniciales={beluerInitials} />
      </div>

      <div className="beluer-panel-servicios-summary">
        <div>
          <span>Servicios activos</span>
          <strong>{dataAvailable ? activos.length : "—"}</strong>
        </div>

        <div>
          <span>Lashes</span>
          <strong>
            {dataAvailable
              ? lashes.filter((servicio) => servicio.activo).length
              : "—"}
          </strong>
        </div>

        <div>
          <span>Nails</span>
          <strong>
            {dataAvailable
              ? nails.filter((servicio) => servicio.activo).length
              : "—"}
          </strong>
        </div>

        <div>
          <span>Brows</span>
          <strong>
            {dataAvailable
              ? brows.filter((servicio) => servicio.activo).length
              : "—"}
          </strong>
        </div>
      </div>

      <div className="beluer-panel-servicios-alert">
        <strong>Servicios gestionados por Admin ✦</strong>
        <span>
          La edición de servicios se gestionará desde Admin en esta fase.
        </span>
      </div>

      {!dataAvailable ? (
        <div className="beluer-panel-empty-state">
          No fue posible cargar tus servicios en este momento.
        </div>
      ) : servicios.length === 0 ? (
        <div className="beluer-panel-empty-state">
          Aún no tienes servicios asignados.
        </div>
      ) : (
        <>
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
        </>
      )}

      <div className="beluer-panel-servicios-footer">
        <button
          className="beluer-panel-btn-primary"
          type="button"
          onClick={onGuardar}
        >
          Edición gestionada por Admin
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
                  disabled
                />
                <span />
              </label>
            </div>

            <div className="beluer-panel-servicio-meta">
              <span>Duración: {servicio.duracion}</span>
              <span>Mínimo belu: S/ {servicio.precioMinimo}</span>
              <span>Estado: {servicio.activo ? "Activo" : "Inactivo"}</span>
            </div>

            <div className="beluer-panel-servicio-price">
              <label>Tu precio</label>

              <div>
                <span>S/</span>
                <input
                  type="number"
                  min={servicio.precioMinimo}
                  value={servicio.precio}
                  disabled
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
  dataAvailable,
  onAgregarFoto,
  onEliminarFoto,
  onMarcarPortada,
  beluerDisplayName,
  beluerInitials,
}: {
  fotos: FotoPortafolio[];
  dataAvailable: boolean;
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

  return (
    <section className="beluer-panel-section active">
      <div className="beluer-panel-top-bar">
        <div className="beluer-panel-greeting">
          <h1>Portafolio</h1>
          <p>
            Revisa las fotos aprobadas de tu portafolio belu.
          </p>
        </div>

        <BeluerPill nombre={beluerDisplayName} iniciales={beluerInitials} />
      </div>

      <div className="beluer-panel-portafolio-summary">
        <div>
          <span>Total de fotos</span>
          <strong>{dataAvailable ? fotos.length : "—"}</strong>
        </div>

        <div>
          <span>Aprobadas</span>
          <strong>{dataAvailable ? aprobadas : "—"}</strong>
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
          Subir foto
        </button>
      </div>

      {!dataAvailable ? (
        <div className="beluer-panel-empty-state">
          No fue posible cargar el portafolio en este momento.
        </div>
      ) : fotosFiltradas.length > 0 ? (
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
                    disabled
                  >
                    {foto.portada ? "Ya es portada" : "Marcar portada"}
                  </button>

                  <button
                    type="button"
                    className="danger"
                    onClick={() => onEliminarFoto(foto.id)}
                    disabled
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
          {fotos.length === 0
            ? "Aún no tienes fotos aprobadas en tu portafolio."
            : "No hay fotos aprobadas para este filtro."}
        </div>
      )}
    </section>
  );
}

function IngresosSection({
  ingresos,
  dataAvailable,
  beluerDisplayName,
  beluerInitials,
  weeklyIncome,
  weeklyUncalculatedCount,
  monthlyIncome,
  monthlyUncalculatedCount,
  monthlyIncomeGoal,
  monthlyProgress,
  monthlyGoalInput,
  goalLoading,
  onMonthlyGoalChange,
  onSaveGoals,
}: {
  ingresos: IngresoBeluer[];
  dataAvailable: boolean;
  beluerDisplayName: string;
  beluerInitials: string;
  weeklyIncome: number;
  weeklyUncalculatedCount: number;
  monthlyIncome: number;
  monthlyUncalculatedCount: number;
  monthlyIncomeGoal: number;
  monthlyProgress: number;
  monthlyGoalInput: string;
  goalLoading: boolean;
  onMonthlyGoalChange: (value: string) => void;
  onSaveGoals: () => void;
}) {
  const ingresosRealizados = ingresos.filter(
    (ingreso) => ingreso.bookingStatus === "completed"
  );
  const ingresosProyectados = ingresos.filter(
    (ingreso) =>
      ingreso.bookingStatus === "confirmed" ||
      ingreso.bookingStatus === "in_progress"
  );
  const totalBruto = ingresosRealizados.reduce(
    (acc, ingreso) => acc + ingreso.totalServicio,
    0
  );

  const totalComision = ingresosRealizados.reduce(
    (acc, ingreso) => acc + (ingreso.comisionBelu ?? 0),
    0
  );

  const totalNeto = ingresosRealizados.reduce(
    (acc, ingreso) => acc + (ingreso.netoBeluer ?? 0),
    0
  );

  const totalProyectado = ingresosProyectados.reduce(
    (acc, ingreso) => acc + (ingreso.netoBeluer ?? 0),
    0
  );
  const realizadosPorCalcular = ingresosRealizados.filter(
    (ingreso) => ingreso.netoBeluer == null
  ).length;
  const comisionesPorCalcular = ingresosRealizados.filter(
    (ingreso) => ingreso.comisionBelu == null
  ).length;
  const proyectadosPorCalcular = ingresosProyectados.filter(
    (ingreso) => ingreso.netoBeluer == null
  ).length;
  const serviciosCompletados = ingresosRealizados.length;

  return (
    <section className="beluer-panel-section active">
      <div className="beluer-panel-top-bar">
        <div className="beluer-panel-greeting">
          <h1>Ingresos</h1>
          <p>
            Revisa tu pago real por reserva, el desglose congelado y lo que
            tienes pendiente por cobrar.
          </p>
        </div>

        <BeluerPill nombre={beluerDisplayName} iniciales={beluerInitials} />
      </div>

      <div className="beluer-panel-card beluer-panel-goals-card">
        <div className="beluer-panel-card-header">
          <div>
            <span className="beluer-panel-eyebrow">Meta personal</span>
            <h2>Mi meta mensual</h2>
            <p>
              Define cuánto quieres generar este mes. belu calculará tu avance
              con servicios completados y payout disponible.
            </p>
          </div>
        </div>

        <div className="beluer-panel-goals-grid">
          <div className="beluer-panel-goal-box">
            <h3>Meta mensual</h3>

            <p>
              {formatPayoutAggregate(
                monthlyIncome,
                monthlyUncalculatedCount
              )}{" "}
              de S/{" "}
              {formatMoney(monthlyIncomeGoal)}
            </p>

            <div className="beluer-panel-progress">
              <span style={{ width: `${monthlyProgress}%` }} />
            </div>

            <small>
              Avance actual: {monthlyProgress.toFixed(0)}%. Esta semana generaste
              {formatPayoutAggregate(weeklyIncome, weeklyUncalculatedCount)}.
            </small>

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
          {goalLoading ? "Guardando meta..." : "Guardar meta"}
        </button>
      </div>

      <div className="beluer-panel-ingresos-hero">
        <div>
          <span>Ingreso realizado del mes</span>
          <strong>
            {dataAvailable
              ? formatPayoutAggregate(monthlyIncome, monthlyUncalculatedCount)
              : "No disponible"}
          </strong>
          <p>
            Suma únicamente servicios completados con payout calculado.
          </p>
        </div>

        <div className="beluer-panel-ingresos-progress">
          <span style={{ width: `${monthlyProgress}%` }} />
        </div>

        <small>
          {monthlyProgress.toFixed(0)}% de tu meta mensual de S/{" "}
          {formatMoney(monthlyIncomeGoal)}
        </small>
      </div>

      <div className="beluer-panel-ingresos-summary">
        <div>
          <span>Precio público completado</span>
          <strong>{dataAvailable ? `S/ ${formatMoney(totalBruto)}` : "—"}</strong>
        </div>

        <div>
          <span>Comisión plataforma</span>
          <strong>
            {dataAvailable
              ? formatPayoutAggregate(totalComision, comisionesPorCalcular)
              : "—"}
          </strong>
        </div>

        <div>
          <span>Ingreso realizado</span>
          <strong>
            {dataAvailable
              ? formatPayoutAggregate(totalNeto, realizadosPorCalcular)
              : "—"}
          </strong>
        </div>

        <div>
          <span>Proyectado / por realizar</span>
          <strong>
            {dataAvailable
              ? formatPayoutAggregate(totalProyectado, proyectadosPorCalcular)
              : "—"}
          </strong>
        </div>

        <div>
          <span>Servicios completados</span>
          <strong>{dataAvailable ? serviciosCompletados : "—"}</strong>
        </div>
      </div>

      <div className="beluer-panel-ingresos-card">
        <div className="beluer-panel-ingresos-card-header">
          <div>
            <h2>Historial de ingresos</h2>
            <p>Detalle de servicios realizados y por realizar en belu.</p>
          </div>

          <button
            type="button"
            className="beluer-panel-btn-secondary"
            onClick={() =>
              alert("Más adelante aquí se descargará un reporte real en PDF o Excel.")
            }
          >
            Descargar reporte
          </button>
        </div>

        {!dataAvailable ? (
          <div className="beluer-panel-empty-state">
            No fue posible cargar los datos de ingresos en este momento.
          </div>
        ) : ingresos.length > 0 ? (
          <div className="beluer-panel-ingresos-list">
            {ingresos.map((ingreso) => (
              <article className="beluer-panel-ingreso-row" key={ingreso.id}>
                <div className="beluer-panel-ingreso-main">
                  <span className={`estado ${ingreso.estadoPago}`}>
                    {getIngresoEstadoLabel(ingreso.estadoPago)}
                  </span>

                  <h3>{ingreso.servicio}</h3>
                  <p>
                    {ingreso.clienta} · {ingreso.fecha} ·{" "}
                    {getBookingFinancialLabel(ingreso.bookingStatus)}
                  </p>
                </div>

                <div className="beluer-panel-ingreso-numeros">
                  <div>
                    <span>Público</span>
                    <strong>S/ {formatMoney(ingreso.totalServicio)}</strong>
                  </div>

                  <div>
                    <span>Comisión plataforma</span>
                    <strong>{formatPayout(ingreso.comisionBelu)}</strong>
                  </div>

                  <div>
                    <span>Tú recibes</span>
                    <strong className="neto">
                      {formatPayout(ingreso.netoBeluer)}
                    </strong>
                  </div>
                </div>

                <div className="beluer-panel-ingreso-breakdown">
                  <span>
                    Servicio: S/{" "}
                    {formatPayout(ingreso.pagoServicioBeluer)}
                  </span>
                  <span>
                    Movilidad / logística:{" "}
                    {formatPayout(ingreso.pagoLogisticaBeluer)}
                  </span>
                  {(ingreso.pagoExpressBeluer ?? 0) > 0 ? (
                    <span>
                      Express: {formatPayout(ingreso.pagoExpressBeluer)}
                    </span>
                  ) : null}
                  <span>
                    Nivel aplicado: {formatAppliedLevel(ingreso.nivelAplicado ?? null)}
                  </span>
                  <span>
                    Comisión aplicada:{" "}
                    {formatCommissionRate(ingreso.comisionAplicada ?? null)}
                  </span>
                  <span>
                    Estado:{" "}
                    {ingreso.commissionLockedAt
                      ? "Comisión congelada"
                      : "Pendiente de congelar"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="beluer-panel-empty-state">
            Aún no tienes ingresos registrados.
          </div>
        )}
      </div>
    </section>
  );
}

function getIngresoEstadoLabel(estado: IngresoBeluer["estadoPago"]) {
  const labels: Record<IngresoBeluer["estadoPago"], string> = {
    pending: "Pago de clienta pendiente",
    paid: "Pago de clienta registrado",
    failed: "Pago de clienta fallido",
    refunded: "Pago de clienta reembolsado",
  };

  return labels[estado];
}

function getBookingFinancialLabel(status: IngresoBeluer["bookingStatus"]) {
  if (status === "completed") return "Ingreso realizado";
  if (status === "in_progress") return "Servicio en curso · por realizar";

  return "Servicio confirmado · por realizar";
}

function PerfilBeluerSection({
  perfil,
  photoUrl,
  rating,
  onActualizarCampo,
  onToggleDistrito,
  onGuardar,
  beluerDisplayName,
  beluerInitials,
}: {
  perfil: PerfilBeluer;
  photoUrl: string;
  rating: string;
  onActualizarCampo: <K extends keyof PerfilBeluer>(
    campo: K,
    valor: PerfilBeluer[K]
  ) => void;
  onToggleDistrito: (distrito: string) => void;
  onGuardar: () => void;
  beluerDisplayName: string;
  beluerInitials: string;
}) {
  const distritosDisponibles = BELUER_COVERAGE_DISTRICTS;
  const [editandoDistritos, setEditandoDistritos] = useState(false);
  const [distritosAntesDeEditar, setDistritosAntesDeEditar] = useState<
    string[]
  >([]);
  const distritosSeleccionados = distritosDisponibles.filter((distrito) =>
    perfil.distritos.includes(distrito)
  );

  const iniciarEdicionDistritos = () => {
    setDistritosAntesDeEditar([...perfil.distritos]);
    setEditandoDistritos(true);
  };

  const cancelarEdicionDistritos = () => {
    onActualizarCampo("distritos", distritosAntesDeEditar);
    setEditandoDistritos(false);
  };

  return (
    <section className="beluer-panel-section active">
      <div className="beluer-panel-top-bar">
        <div className="beluer-panel-greeting">
          <h1>Mi perfil</h1>
          <p>
            Actualiza tu información pública y las zonas donde deseas atender.
          </p>
        </div>

        <BeluerPill nombre={beluerDisplayName} iniciales={beluerInitials} />
      </div>

      <div className="beluer-panel-perfil-layout">
        <aside className="beluer-panel-perfil-card">
          <img src={photoUrl} alt={perfil.nombrePublico} />

          <h2>{perfil.nombrePublico}</h2>
          <p>{perfil.nivel}</p>

          <div
            className={`beluer-panel-perfil-status ${perfil.estado
              .toLowerCase()
              .replace(" ", "-")}`}
          >
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
              <strong>{rating}</strong>
              <span>Rating</span>
            </div>
          </div>

          <div className="beluer-panel-perfil-note">
            <strong>Perfil público</strong>
            <span>
              Tu Instagram, WhatsApp y bio serán visibles para clientas cuando
              elijan una Beluer en modo libre.
            </span>
          </div>
        </aside>

        <div className="beluer-panel-perfil-form-card">
          <h3>Información principal</h3>

          <div className="beluer-panel-form-grid">
            <div className="beluer-panel-form-group">
              <label>Nombre público</label>
              <input type="text" value={perfil.nombrePublico} readOnly />
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
              <input type="number" min={0} value={perfil.experiencia} readOnly />
            </div>
          </div>

          <div className="beluer-panel-form-group">
            <label>Bio pública</label>
            <textarea
              value={perfil.bio}
              onChange={(event) => onActualizarCampo("bio", event.target.value)}
            />
          </div>

          <div className="beluer-panel-form-grid">
            <div className="beluer-panel-form-group">
              <label>Nivel Beluer</label>
              <input type="text" value={perfil.nivel} readOnly />
            </div>

            <div className="beluer-panel-form-group">
              <label>Estado del perfil</label>
              <input type="text" value={perfil.estado} readOnly />
            </div>
          </div>

          <div className="beluer-panel-distritos-box">
            <label>Distritos de atención</label>

            {!editandoDistritos ? (
              <div className="beluer-panel-distritos-resumen">
                <strong>Tus zonas</strong>

                {distritosSeleccionados.length > 0 ? (
                  <div
                    className="beluer-panel-distritos-seleccionados"
                    aria-label="Zonas de atención actuales"
                  >
                    {distritosSeleccionados.map((distrito) => (
                      <span key={distrito}>{distrito}</span>
                    ))}
                  </div>
                ) : (
                  <p>Aún no tienes zonas de atención configuradas.</p>
                )}

                <button
                  type="button"
                  className="beluer-panel-btn-secondary beluer-panel-distritos-editar"
                  onClick={iniciarEdicionDistritos}
                  aria-expanded="false"
                  aria-controls="beluer-panel-distritos-editor"
                >
                  Editar zonas de atención
                </button>
              </div>
            ) : (
              <div
                className="beluer-panel-distritos-editor"
                id="beluer-panel-distritos-editor"
              >
                <div className="beluer-panel-distritos-editor-heading">
                  <strong>Selecciona tus zonas</strong>
                  <span>{perfil.distritos.length} seleccionadas</span>
                </div>

                <div className="beluer-panel-distritos-grid">
                  {distritosDisponibles.map((distrito) => (
                    <button
                      key={distrito}
                      type="button"
                      className={
                        perfil.distritos.includes(distrito) ? "active" : ""
                      }
                      onClick={() => onToggleDistrito(distrito)}
                      aria-pressed={perfil.distritos.includes(distrito)}
                    >
                      {distrito}
                    </button>
                  ))}
                </div>

                <small>
                  Selecciona al menos una zona. Cuando termines, usa Guardar
                  cambios al final del perfil.
                </small>

                <button
                  type="button"
                  className="beluer-panel-btn-secondary beluer-panel-distritos-cancelar"
                  onClick={cancelarEdicionDistritos}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <label className="beluer-panel-disponibilidad-toggle">
            <input
              type="checkbox"
              checked={perfil.disponibilidadGeneral}
              readOnly
            />
            <span>
              Disponible para recibir nuevas solicitudes de belu. Este estado lo
              gestiona Admin.
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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
