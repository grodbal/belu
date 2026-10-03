"use client";

import { useEffect, useMemo, useState } from "react";
import { createBookingAction } from "@/app/actions/client/createBooking";
import { updateClientProfileAction } from "@/app/actions/client/updateClientProfile";
import LogoutButton from "@/components/auth/LogoutButton";
import {
  ClientHome,
  ClientBottomNav,
  ClientHeader,
  ClientShell,
  ClientSidebar,
  type BeluerCardData,
  type BookingHeroData,
  type ClientNavigationItem,
  type ServiceCardData,
} from "@/components/belu";
import { crearPlaceholder } from "./clientePanelData";
import type {
  AssignmentMode,
  Beluer,
  PanelSection,
  PaymentMethod,
  Service,
} from "./clientePanelTypes";

type ClientProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  beauty_preference: string | null;
};

type ClientBooking = {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  payment_status: string;
  public_price: number;
  logistic_fee: number | null;
  is_express: boolean | null;
  express_fee: number | null;
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
  bookingHistory: ClientBooking[];
  realBeluers: Beluer[];
  realServices: Service[];
};

type ServiceCatalogFilter = "all" | "featured" | "lashes" | "nails";
type ServiceCatalogSection = "featured" | "lashes" | "nails";

function getTodayLocalDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value?: string | null) {
  if (!value) return "Fecha por definir";

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDisplayTime(value?: string | null) {
  if (!value) return "Hora por definir";

  const [rawHour = "0", rawMinute = "00"] = value.split(":");
  const hour24 = Number(rawHour);
  const minute = rawMinute.padStart(2, "0").slice(0, 2);

  if (Number.isNaN(hour24)) return value;

  const meridiem = hour24 >= 12 ? "pm" : "am";
  const hour12 = hour24 % 12 || 12;

  return `${hour12}:${minute} ${meridiem}`;
}

function formatSoles(value: number) {
  const amount = Number(value || 0);
  const displayValue = Number.isInteger(amount)
    ? amount.toFixed(0)
    : amount.toFixed(2);

  return `S/ ${displayValue}`;
}

function sortServicesForReservation(services: Service[]) {
  return [...services].sort((first, second) => {
    const featuredDifference =
      Number(Boolean(second.is_featured)) - Number(Boolean(first.is_featured));

    if (featuredDifference !== 0) return featuredDifference;

    const priceDifference =
      Number(first.precio || 0) - Number(second.precio || 0);

    if (priceDifference !== 0) return priceDifference;

    return first.nombre.localeCompare(second.nombre, "es");
  });
}

function getClientBookingTotal(booking: ClientBooking) {
  const serviceAmount = Number(booking.public_price || 0);
  const logisticFee = Number(booking.logistic_fee || 0);
  const expressFee = booking.is_express ? Number(booking.express_fee || 0) : 0;

  return {
    serviceAmount,
    logisticFee,
    expressFee,
    total: serviceAmount + logisticFee + expressFee,
  };
}

function getTimePickerParts(value: string) {
  const [rawHour = "14", rawMinute = "30"] = value.split(":");
  const hour24 = Number(rawHour);
  const minute = rawMinute.padStart(2, "0").slice(0, 2);
  const safeHour = Number.isNaN(hour24) ? 14 : hour24;
  const meridiem = safeHour >= 12 ? "PM" : "AM";
  const hour12 = safeHour % 12 || 12;

  return {
    time12: `${hour12}:${minute}`,
    meridiem,
  };
}

function toTwentyFourHourTime(time12: string, meridiem: string) {
  const [rawHour = "12", rawMinute = "00"] = time12.split(":");
  const parsedHour = Number(rawHour);
  const hour12 = Number.isNaN(parsedHour) ? 12 : parsedHour;
  const minute = rawMinute.padStart(2, "0").slice(0, 2);
  let hour24 = hour12 % 12;

  if (meridiem === "PM") hour24 += 12;

  return `${String(hour24).padStart(2, "0")}:${minute}`;
}

function isWithinNextTwoHours(dateValue: string, timeValue: string) {
  if (!dateValue || !timeValue) return false;

  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);

  if ([year, month, day, hour, minute].some((value) => Number.isNaN(value))) {
    return false;
  }

  const selectedDate = new Date(year, month - 1, day, hour, minute);
  const now = new Date();
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  return selectedDate >= now && selectedDate <= twoHoursFromNow;
}

function getDateTimeFromBookingParts(dateValue: string, timeValue: string) {
  if (!dateValue || !timeValue) return null;

  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);

  if ([year, month, day, hour, minute].some((value) => Number.isNaN(value))) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute);
}

function isPastTimeForSelectedDate(dateValue: string, timeValue: string) {
  const selectedDate = getDateTimeFromBookingParts(dateValue, timeValue);
  if (!selectedDate) return false;

  return selectedDate <= new Date();
}

const primaryNavItems: ClientNavigationItem<PanelSection>[] = [
  { id: "dashboard", label: "Inicio", icon: "home" },
  { id: "servicios", label: "Servicios", icon: "sparkles" },
  { id: "reserva", label: "Reservar", icon: "calendar" },
  { id: "historial", label: "Historial", icon: "clock" },
  { id: "perfil", label: "Mi perfil", icon: "user" },
];

const secondaryNavItems: ClientNavigationItem<PanelSection>[] = [
  { id: "beluers", label: "Especialistas", icon: "user" },
  { id: "pagos", label: "Pagos", icon: "card" },
];

const mobileNavItems: ClientNavigationItem<PanelSection>[] = [
  { id: "dashboard", label: "Inicio", icon: "home" },
  { id: "servicios", label: "Servicios", icon: "sparkles" },
  { id: "reserva", label: "Reserva", icon: "calendar", prominent: true },
  { id: "historial", label: "Historial", icon: "clock" },
  { id: "perfil", label: "Perfil", icon: "user" },
];

export default function ClientePanelOriginalPage({
  clientProfile,
  nextBooking,
  bookingHistory,
  realBeluers,
  realServices,
}: ClientePanelOriginalPageProps) {
  const [activeSection, setActiveSection] = useState<PanelSection>("dashboard");
  const [, setSidebarOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] =
    useState<Service | null>(null);
const [fecha, setFecha] = useState(getTodayLocalDate);
const [hora, setHora] = useState("14:30");
const [direccionReserva, setDireccionReserva] = useState("");
const [distritoReserva, setDistritoReserva] = useState("");
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
const distritoSugerencias = [
  "Miraflores",
  "San Isidro",
  "Surco",
  "La Molina",
  "Barranco",
  "San Borja",
  "San Miguel",
];
const horaOpciones12 = [
  "12:00",
  "12:30",
  "1:00",
  "1:30",
  "2:00",
  "2:30",
  "3:00",
  "3:30",
  "4:00",
  "4:30",
  "5:00",
  "5:30",
  "6:00",
  "6:30",
  "7:00",
  "7:30",
  "8:00",
  "8:30",
  "9:00",
  "9:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
];
const meridiemOptions = ["AM", "PM"];
const horaPicker = getTimePickerParts(hora);
const getHoraOptionValue = (timeOption: string, meridiem: string) =>
  toTwentyFourHourTime(timeOption, meridiem);
const horaOpciones24 = meridiemOptions
  .flatMap((meridiem) =>
    horaOpciones12.map((timeOption) => getHoraOptionValue(timeOption, meridiem))
  )
  .sort();
const nextAvailableTime = horaOpciones24.find(
  (timeOption) => !isPastTimeForSelectedDate(fecha, timeOption)
);
const hasAvailableTimesForSelectedDate = Boolean(nextAvailableTime);
const selectedTimeHasPassed = Boolean(
  fecha && hora && isPastTimeForSelectedDate(fecha, hora)
);
const selectedDateIsToday = fecha === getTodayLocalDate();
const noAvailableTimesToday =
  selectedDateIsToday && !hasAvailableTimesForSelectedDate;
const getHoraOptionDisabled = (timeOption: string, meridiem: string) =>
  isPastTimeForSelectedDate(fecha, getHoraOptionValue(timeOption, meridiem));
const getMeridiemDisabled = (meridiem: string) =>
  horaOpciones12.every((timeOption) =>
    getHoraOptionDisabled(timeOption, meridiem)
  );
const horaHelpText = noAvailableTimesToday
  ? "Ya no hay horarios disponibles para hoy. Elige otra fecha."
  : selectedTimeHasPassed
    ? "Esa hora ya paso. Elige un horario disponible."
    : selectedDateIsToday
      ? "Solo mostramos horarios disponibles desde ahora."
      : "Elige la hora en formato 12 horas.";

  const goToSection = (section: PanelSection) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

const normalizarTexto = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const urgenciaAutomatica = isWithinNextTwoHours(fecha, hora);
const urgenciaEfectiva = urgenciaAutomatica || urgencia;

const beluersDisponibles = useMemo(() => {
  if (!servicioSeleccionado) return realBeluers;

  const servicioRequerido = normalizarTexto(servicioSeleccionado.nombre);

  return realBeluers.filter((beluer) => {
    const serviciosBeluer = beluer.serviciosActivos.map((servicio) =>
      normalizarTexto(servicio)
    );

    return serviciosBeluer.some(
      (servicioBeluer) =>
        servicioBeluer.includes(servicioRequerido) ||
        servicioRequerido.includes(servicioBeluer)
    );
  });
}, [servicioSeleccionado, realBeluers]);

useEffect(() => {
  if (selectedTimeHasPassed && nextAvailableTime && nextAvailableTime !== hora) {
    setHora(nextAvailableTime);
  }
}, [selectedTimeHasPassed, nextAvailableTime, hora]);

useEffect(() => {
  if (urgenciaAutomatica) {
    setUrgencia(true);
  }
}, [urgenciaAutomatica]);

  const precioServicio = servicioSeleccionado?.precio ?? 0;
  const cargoLogistico = servicioSeleccionado ? 10 : 0;
  const recargoExpress = urgenciaEfectiva && servicioSeleccionado ? 20 : 0;
  const subtotal = precioServicio + cargoLogistico;
  const total = subtotal + recargoExpress;

  const handleServicioClick = (servicio: Service) => {
    setServicioSeleccionado(servicio);
    setBeluerSeleccionada("");
  };

  const selectServiceForBooking = (servicio: Service) => {
    handleServicioClick(servicio);
    setActiveSection("reserva");
    setSidebarOpen(false);
  };

const handleConfirmarReserva = () => {
  if (!servicioSeleccionado) {
    alert("Selecciona un servicio para continuar.");
    return;
  }

  if (!fecha || !hora) {
    alert("Selecciona fecha y hora.");
    return;
  }

  if (isPastTimeForSelectedDate(fecha, hora)) {
    alert("Elige una hora disponible posterior a la hora actual.");
    return;
  }

  if (!direccionReserva.trim()) {
    alert("Ingresa la dirección donde se realizará el servicio.");
    return;
  }

  if (!distritoReserva.trim()) {
    alert("Escribe el distrito donde recibirás el servicio.");
    return;
  }

  if (modoAsignacion === "libre" && !beluerSeleccionada) {
    alert("Elige a tu beluer antes de continuar.");
    return;
  }

  setPagoOpen(true);
};

const handleConfirmarPago = async () => {
  if (!servicioSeleccionado) {
    alert("Selecciona un servicio antes de confirmar.");
    return;
  }

  setBookingLoading(true);

  const formData = new FormData();
  if (servicioSeleccionado.id) {
    formData.append("serviceId", servicioSeleccionado.id);
  }
  formData.append("serviceName", servicioSeleccionado.nombre);
  formData.append("bookingMode", modoAsignacion);
formData.append("selectedBeluerName", beluerSeleccionada);
  formData.append("scheduledDate", fecha);
  formData.append("scheduledTime", hora);
  formData.append("address", direccionReserva.trim());
  formData.append("district", distritoReserva.trim());
  formData.append("notes", notasReserva.trim());
  formData.append("isExpress", urgenciaEfectiva ? "true" : "false");

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
const clientName = clientProfile?.full_name || "Clienta";
const clientFirstName = clientProfile?.full_name?.split(" ")[0] || "Clienta";
const hasRealBooking = Boolean(nextBooking);
const selectedBookingService = servicioSeleccionado;

  return (
    <ClientShell
      sidebar={
        <ClientSidebar
          items={primaryNavItems}
          secondaryItems={secondaryNavItems}
          activeItem={activeSection}
          onNavigate={goToSection}
          onLogoClick={() => goToSection("dashboard")}
          note={<><span aria-hidden="true">✦</span><p>Belleza experta,<br/>donde tú estés.</p></>}
          logout={<LogoutButton />}
        />
      }
      header={
        <ClientHeader
          clientName={clientName}
          avatarText={getInitials(clientName) || "B"}
          eyebrow="Tu espacio belu"
          onLogoClick={() => goToSection("dashboard")}
          onProfileClick={() => goToSection("perfil")}
        />
      }
      bottomNav={
        <ClientBottomNav
          items={mobileNavItems}
          activeItem={activeSection}
          onNavigate={goToSection}
        />
      }
    >
      <div className="cliente-panel-shell">
          {activeSection === "dashboard" && (
<DashboardSection
  goToSection={goToSection}
  reservaConfirmada={reservaConfirmada || hasRealBooking}
  servicioSeleccionado={servicioSeleccionado}
  fecha={fecha}
  hora={hora}
  total={total}
  modoAsignacion={modoAsignacion}
  beluerSeleccionada={beluerSeleccionada}
  clientFirstName={clientFirstName}
  nextBooking={nextBooking}
  realBeluers={realBeluers}
  realServices={realServices}
/>
)}

          {activeSection === "reserva" && (
            <section className="cliente-panel-section cliente-panel-reserva-section active">
              <div className="cliente-panel-top-bar cliente-panel-reserva-topbar">
                <div className="cliente-panel-greeting">
                  <span className="cliente-panel-dashboard-kicker">
                    Nueva reserva
                  </span>
                  <h1>Agenda tu nueva cita</h1>
                  <p>
                    Elige tu servicio, fecha y dirección. belu coordina el
                    resto.
                  </p>
                </div>

                <UserPill clientName={clientName} />
              </div>

              <div
                className={`cliente-panel-reserva-card ${
                  !servicioSeleccionado ? "no-service" : ""
                }`}
              >
                <div className="cliente-panel-booking-left">
                  <div className="cliente-panel-booking-block cliente-panel-selected-service-block">
                    <div className="cliente-panel-reserva-block-title">
                      <span>1 · Servicio</span>
                      <h2>Servicio para tu cita</h2>
                      <p>
                        Elige con calma desde Servicios y vuelve aquí para
                        completar fecha, dirección y pago.
                      </p>
                    </div>

                    {servicioSeleccionado ? (
                      <div className="cliente-panel-selected-service-card">
                        {servicioSeleccionado.image_url ? (
                          <img
                            src={servicioSeleccionado.foto}
                            alt={servicioSeleccionado.nombre}
                          />
                        ) : (
                          <span
                            className="cliente-panel-selected-service-placeholder"
                            aria-hidden="true"
                          >
                            <b>
                              {servicioSeleccionado.nombre
                                .slice(0, 1)
                                .toUpperCase()}
                            </b>
                            <small>✦</small>
                          </span>
                        )}

                        <div className="cliente-panel-selected-service-copy">
                          <span className="cliente-panel-servicio-category">
                            {servicioSeleccionado.categoria === "lashes"
                              ? "Lashes"
                              : "Nails"}
                          </span>
                          <h3>{servicioSeleccionado.nombre}</h3>
                          {servicioSeleccionado.desc ? (
                            <p>{servicioSeleccionado.desc}</p>
                          ) : null}
                          <div className="cliente-panel-selected-service-meta">
                            <strong>
                              {formatSoles(servicioSeleccionado.precio)}
                            </strong>
                            <span>
                              {getServiceDuration(servicioSeleccionado) ||
                                "Duración por confirmar"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="cliente-panel-change-service-btn"
                          onClick={() => goToSection("servicios")}
                        >
                          Cambiar servicio
                        </button>
                      </div>
                    ) : (
                      <div className="cliente-panel-selected-service-empty">
                        <span>&#10022;</span>
                        <h3>Elige el servicio que quieres reservar</h3>
                        <p>
                          Explora Lashes y Nails, revisa los detalles y
                          selecciona una opción para continuar.
                        </p>
                        <button
                          type="button"
                          className="cliente-panel-btn-r"
                          onClick={() => goToSection("servicios")}
                        >
                          Ver servicios
                        </button>
                      </div>
                    )}

                  </div>
                  <div className="cliente-panel-booking-block cliente-panel-details-block">
                    <div className="cliente-panel-reserva-block-title">
                      <span>2 · Fecha, lugar y detalles</span>
                      <h2>Detalles de tu cita</h2>
                      <p>
                        Define cuándo y dónde quieres recibir a tu Beluer.
                        Mantén la dirección lo más clara posible.
                      </p>
                    </div>

                    <div className="cliente-panel-booking-form-grid">
                <div className="cliente-panel-form-group">
                  <label>Fecha deseada</label>
                  <input
                    type="date"
                    value={fecha}
                    min={getTodayLocalDate()}
                    onChange={(event) => setFecha(event.target.value)}
                  />
                  <small>Elige el día ideal para tu atención.</small>
                </div>

                <div className="cliente-panel-form-group">
                  <label>Hora</label>
                  <div className="cliente-panel-time-picker">
                    <select
                      value={horaPicker.time12}
                      onChange={(event) => {
                        const nextTime = toTwentyFourHourTime(
                          event.target.value,
                          horaPicker.meridiem
                        );

                        if (!isPastTimeForSelectedDate(fecha, nextTime)) {
                          setHora(nextTime);
                        }
                      }}
                      aria-label="Hora"
                    >
                      {horaOpciones12.map((timeOption) => (
                        <option
                          key={timeOption}
                          value={timeOption}
                          disabled={getHoraOptionDisabled(
                            timeOption,
                            horaPicker.meridiem
                          )}
                        >
                          {timeOption}
                        </option>
                      ))}
                    </select>
                    <select
                      value={horaPicker.meridiem}
                      onChange={(event) => {
                        const nextTime = toTwentyFourHourTime(
                          horaPicker.time12,
                          event.target.value
                        );

                        if (!isPastTimeForSelectedDate(fecha, nextTime)) {
                          setHora(nextTime);
                        }
                      }}
                      aria-label="AM o PM"
                    >
                      {meridiemOptions.map((meridiem) => (
                        <option
                          key={meridiem}
                          value={meridiem}
                          disabled={getMeridiemDisabled(meridiem)}
                        >
                          {meridiem}
                        </option>
                      ))}
                    </select>
                  </div>
                  <small>{horaHelpText}</small>
                </div>

                <div className="cliente-panel-form-group">
  <label>Distrito</label>
  <input
    type="text"
    list="cliente-panel-distritos"
    value={distritoReserva}
    onChange={(event) => setDistritoReserva(event.target.value)}
    placeholder="Ej: Miraflores, Magdalena, Jesús María..."
  />
  <datalist id="cliente-panel-distritos">
    {distritoSugerencias.map((distrito) => (
      <option key={distrito} value={distrito} />
    ))}
  </datalist>
  <small>Escribe tu distrito. belu validará cobertura antes de confirmar.</small>
</div>

<div className="cliente-panel-form-group">
  <label>Dirección del servicio</label>
  <input
    type="text"
    value={direccionReserva}
    onChange={(event) => setDireccionReserva(event.target.value)}
    placeholder="Ej: Av. Santa Cruz 950, dpto 402"
  />
  <small>Ingresa la dirección donde quieres recibir a tu Beluer.</small>
</div>

                <label className="cliente-panel-urgencia-toggle">
                  <input
                    type="checkbox"
                    checked={urgenciaEfectiva}
                    disabled={urgenciaAutomatica}
                    onChange={(event) => {
                      if (!urgenciaAutomatica) {
                        setUrgencia(event.target.checked);
                      }
                    }}
                  />
                  <span>
                    {urgenciaAutomatica
                      ? "⚡ Belu Express obligatorio"
                      : "⚡ Necesito este servicio con urgencia (máx. 2 horas)"}
                  </span>
                </label>
                {urgenciaAutomatica && (
                  <small className="cliente-panel-urgencia-auto-note">
                    Belu Express se activó automáticamente porque tu cita está
                    dentro de las próximas 2 horas.
                  </small>
                )}

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
                      Solo se muestran las beluers que realizan el servicio
                      seleccionado.
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
  <small>Opcional: agrega preferencias o indicaciones de acceso.</small>
</div>
                    </div>
                </div>
                </div>

                <aside className="cliente-panel-booking-summary">
                <div className="cliente-panel-reserva-block-title cliente-panel-reserva-summary-title">
                  <span>Resumen</span>
                  <h2>Tu reserva ✦</h2>
                  <p>
                    Revisa los datos principales antes de continuar con la
                    confirmación.
                  </p>
                </div>

                {!servicioSeleccionado && (
                  <div className="cliente-panel-resumen-pago cliente-panel-resumen-empty">
                    <strong>Elige un servicio para ver el resumen de tu reserva.</strong>
                    <span>
                      Aquí aparecerán servicio, fecha, hora, distrito y total.
                    </span>
                  </div>
                )}

                {servicioSeleccionado && (
                  <div className="cliente-panel-resumen-pago">
                    <div className="cliente-panel-summary-service-line">
                      <span className="cliente-panel-summary-service-label">
                        Servicio
                      </span>
                      <strong
                        className="cliente-panel-summary-service-name"
                        title={servicioSeleccionado.nombre}
                      >
                        {servicioSeleccionado.nombre}
                      </strong>
                      {servicioSeleccionado.desc ? (
                        <p className="cliente-panel-summary-service-description">
                          {servicioSeleccionado.desc}
                        </p>
                      ) : null}
                    </div>

                    <div className="linea cliente-panel-summary-date-line">
                      <span>Fecha</span>
                      <strong>{formatDisplayDate(fecha)}</strong>
                    </div>

                    <div className="linea cliente-panel-summary-date-line">
                      <span>Hora</span>
                      <strong>{formatDisplayTime(hora)}</strong>
                    </div>

                    <div className="linea cliente-panel-summary-location-line">
                      <span>Distrito</span>
                      <strong>{distritoReserva}</strong>
                    </div>

                    <div className="linea cliente-panel-summary-address-line">
                      <span>Dirección</span>
                      <strong>
                        {direccionReserva.trim() || "Pendiente de completar"}
                      </strong>
                    </div>

                    <div className="cliente-panel-summary-financial-breakdown">
                      <div className="cliente-panel-summary-financial-line cliente-panel-summary-service-price-line">
                        <span title={servicioSeleccionado.nombre}>
                          {servicioSeleccionado.nombre}
                        </span>
                        <strong>S/ {precioServicio}</strong>
                      </div>

                      <div className="cliente-panel-summary-financial-line cliente-panel-summary-logistic-line">
                        <span>Cargo logístico</span>
                        <strong>S/ {cargoLogistico}</strong>
                      </div>

                      {urgenciaEfectiva && (
                        <div className="cliente-panel-summary-financial-line cliente-panel-summary-express-line">
                          <span>Belu Express</span>
                          <strong>S/ {recargoExpress}</strong>
                        </div>
                      )}
                    </div>

                    <div className="linea total">
                      <span>Total</span>
                      <strong>S/ {total}</strong>
                    </div>

                    {urgenciaEfectiva && (
                      <div className="express cliente-panel-summary-express-info">
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
                  Confirmar reserva
                </button>

                </aside>
              </div>
            </section>
          )}

          {activeSection === "servicios" && (
            <ServiciosSection
              services={realServices}
              selectedService={servicioSeleccionado}
              onSelectServiceForBooking={selectServiceForBooking}
              clientName={clientName}
            />
          )}

          {activeSection === "beluers" && (
  <EspecialistasSection
    beluers={realBeluers}
    goToReserva={() => goToSection("servicios")}
    clientName={clientName}
  />
)}

{activeSection === "historial" && (
  <HistorialSection
    bookingHistory={bookingHistory}
    goToReserva={() => goToSection("reserva")}
    clientName={clientName}
  />
)}
{activeSection === "pagos" && (
  <PagosSection clientName={clientName} bookingHistory={bookingHistory} />
)}
{activeSection === "perfil" && (
  <PerfilSection
    clientName={clientName}
    clientProfile={clientProfile}
    bookingCount={bookingHistory.length}
  />
)}

{activeSection !== "dashboard" &&
  activeSection !== "reserva" &&
  activeSection !== "servicios" &&
  activeSection !== "beluers" &&
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
      {selectedBookingService &&
      (activeSection === "dashboard" || activeSection === "servicios") ? (
        <button
          className="cliente-panel-floating-booking-cta"
          type="button"
          onClick={() => goToSection("reserva")}
        >
          <span>Reservar {selectedBookingService.nombre}</span>
          <strong>Total desde {formatSoles(total)}</strong>
        </button>
      ) : null}

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
    {nextBooking?.services?.name || servicioSeleccionado?.nombre}
  </strong>
</div>

        <div className="linea-pago">
          <span>{servicioSeleccionado?.nombre || "Servicio"}</span>
          <strong>S/ {precioServicio}</strong>
        </div>

        <div className="linea-pago">
          <span>Cargo logístico</span>
          <strong>S/ 10</strong>
        </div>

        {urgenciaEfectiva && (
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
          {servicioSeleccionado?.nombre}
        </p>

        <p>
          <strong>Fecha:</strong> {formatDisplayDate(fecha)}
        </p>

        <p>
          <strong>Hora:</strong> {formatDisplayTime(hora)}
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
    </ClientShell>
  );
}

function DashboardSection({
  goToSection,
  reservaConfirmada,
  servicioSeleccionado,
  fecha,
  hora,
  total,
  modoAsignacion,
  beluerSeleccionada,
  clientFirstName,
  nextBooking,
  realBeluers,
  realServices,
}: {
  goToSection: (section: PanelSection) => void;
  reservaConfirmada: boolean;
  servicioSeleccionado: Service | null;
  fecha: string;
  hora: string;
  total: number;
  modoAsignacion: AssignmentMode;
  beluerSeleccionada: string;
  clientFirstName: string;
  nextBooking: ClientBooking | null;
  realBeluers: Beluer[];
  realServices: Service[];
}) {
  const reservationStatusLabels: Record<string, string> = {
    pending: "Pendiente",
    assigned: "Asignada",
    confirmed: "Confirmada",
    in_progress: "En curso",
    completed: "Completada",
    cancelled: "Cancelada",
  };
  const hasBooking = Boolean(nextBooking || reservaConfirmada);
  const booking: BookingHeroData | null = hasBooking
    ? {
        service:
          nextBooking?.services?.name ||
          servicioSeleccionado?.nombre ||
          "Servicio belu",
        status:
          reservationStatusLabels[nextBooking?.status || "confirmed"] ||
          nextBooking?.status ||
          "Confirmada",
        date: formatDisplayDate(nextBooking?.scheduled_date || fecha),
        time: formatDisplayTime(nextBooking?.scheduled_time || hora),
        district: nextBooking?.district || undefined,
        beluer:
          nextBooking?.beluer_profiles?.public_name ||
          (modoAsignacion === "libre" && beluerSeleccionada
            ? beluerSeleccionada
            : undefined),
        total: formatSoles(
          nextBooking ? getClientBookingTotal(nextBooking).total : total
        ),
      }
    : null;
  const services: ServiceCardData[] = sortServicesForReservation(realServices)
    .slice(0, 3)
    .map((service, index) => ({
      id: service.id || `${service.nombre}-${index}`,
      name: service.nombre,
      category: service.categoria === "lashes" ? "Lashes" : "Nails",
      price: formatSoles(service.precio),
      imageUrl: service.image_url ? service.foto : undefined,
    }));
  const beluers: BeluerCardData[] = realBeluers.slice(0, 3).map((beluer, index) => {
    const numericRating = Number(beluer.rating);

    return {
      id: `${beluer.nombre}-${index}`,
      name: beluer.nombre,
      specialty: beluer.espec,
      imageUrl:
        beluer.foto && beluer.foto !== "/beluer-placeholder.jpg"
          ? beluer.foto
          : undefined,
      isNew:
        beluer.rating === "Sin calificación" ||
        Number.isNaN(numericRating) ||
        numericRating <= 0,
    };
  });

  return (
    <ClientHome
      clientFirstName={clientFirstName}
      booking={booking}
      services={services}
      beluers={beluers}
      onBook={() => goToSection("reserva")}
      onExploreServices={() => goToSection("servicios")}
      onViewHistory={() => goToSection("historial")}
      onViewBeluers={() => goToSection("beluers")}
    />
  );
}

function HistorialSection({
  bookingHistory,
  goToReserva,
  clientName,
}: {
  bookingHistory: ClientBooking[];
  goToReserva: () => void;
  clientName: string;
}) {
  const [selectedBooking, setSelectedBooking] = useState<ClientBooking | null>(
    null
  );

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    pending_payment: "Pendiente de pago",
    paid: "Pagada",
    pending_beluer_assignment: "Pendiente de asignación",
    assigned: "Asignada",
    confirmed: "Confirmada",
    in_progress: "En curso",
    completed: "Completada",
    cancelled: "Cancelada",
    rescheduled: "Reprogramada",
    refunded: "Reembolsada",
  };

  const paymentStatusLabels: Record<string, string> = {
    pending: "Pago pendiente de confirmación",
    paid: "Pago confirmado",
    failed: "Pago fallido",
    refunded: "Reembolsado",
    partially_refunded: "Reembolso parcial",
  };
  const selectedBookingTotal = selectedBooking
    ? getClientBookingTotal(selectedBooking)
    : null;
  
  return (
    <section className="cliente-panel-section active">
      <div className="cliente-panel-top-bar">
        <div className="cliente-panel-greeting">
          <span className="cliente-panel-dashboard-kicker">Tus reservas</span>
          <h1>Tu historial</h1>
          <p>Consulta el detalle de tus reservas registradas.</p>
        </div>

        <UserPill clientName={clientName} />
      </div>

      <div className="cliente-panel-historial-grid">
        {bookingHistory.length === 0 && (
          <div className="cliente-panel-card">
            <p>Aún no tienes reservas registradas.</p>
          </div>
        )}

        {bookingHistory.map((item) => {
          const itemTotal = getClientBookingTotal(item);

          return (
          <article className="cliente-panel-historial-card" key={item.id}>
            <div className="cliente-panel-historial-img">
              <img
                src={crearPlaceholder(
                  item.services?.name || "Servicio belu",
                  item.services?.category === "nails" ? "D81B60" : "AD1457"
                )}
                alt={item.services?.name || "Servicio belu"}
              />
              <span>{statusLabels[item.status] || item.status}</span>
            </div>

            <div className="cliente-panel-historial-body">
              <div className="cliente-panel-historial-header">
                <div>
                  <h3>{item.services?.name || "Servicio belu"}</h3>
                  <p>
                    Beluer:{" "}
                    {item.beluer_profiles?.public_name ||
                      "Pendiente de asignación"}
                  </p>
                </div>

                <strong>{formatSoles(itemTotal.total)}</strong>
              </div>

              <div className="cliente-panel-historial-meta">
                <span>{formatDisplayDate(item.scheduled_date)}</span>
                <span>{formatDisplayTime(item.scheduled_time)}</span>
                {item.is_express ? (
                  <span className="cliente-panel-express-pill">
                    Belu Express
                  </span>
                ) : null}
                <span>
                  💳{" "}
                  {paymentStatusLabels[item.payment_status] ||
                    item.payment_status}
                </span>
              </div>

              <div className="cliente-panel-historial-rating">
                Reserva registrada en belu
              </div>

              <p className="cliente-panel-historial-comment">
                {item.district} · {item.address}
              </p>

              <div className="cliente-panel-historial-actions">
                <button
                  type="button"
                  className="cliente-panel-btn-r"
                  onClick={goToReserva}
                >
                  Nueva reserva
                </button>

                <button
                  type="button"
                  className="cliente-panel-btn-ghost"
                  onClick={() => setSelectedBooking(item)}
                >
                  Ver detalle
                </button>
              </div>
            </div>
          </article>
          );
        })}
      </div>

      {selectedBooking && (
        <div className="cliente-panel-modal-overlay">
          <div className="cliente-panel-gestion-modal">
            <button
              type="button"
              className="cliente-panel-modal-close"
              onClick={() => setSelectedBooking(null)}
              aria-label="Cerrar detalle de reserva"
            >
              ×
            </button>

            <h3>Detalle de reserva</h3>

            <div className="cliente-panel-detalle-reserva">
              <p>
                <strong>Servicio:</strong>{" "}
                {selectedBooking.services?.name || "Servicio belu"}
              </p>
              <p>
                <strong>Beluer:</strong>{" "}
                {selectedBooking.beluer_profiles?.public_name ||
                  "Pendiente de asignación"}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {formatDisplayDate(selectedBooking.scheduled_date)}
              </p>
              <p>
                <strong>Hora:</strong>{" "}
                {formatDisplayTime(selectedBooking.scheduled_time)}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                {statusLabels[selectedBooking.status] || selectedBooking.status}
              </p>
              <p>
                <strong>Estado de pago:</strong>{" "}
                {paymentStatusLabels[selectedBooking.payment_status] ||
                  selectedBooking.payment_status}
              </p>
              {selectedBookingTotal ? (
                <div className="cliente-panel-booking-breakdown">
                  <div>
                    <span>Servicio</span>
                    <strong>
                      {formatSoles(selectedBookingTotal.serviceAmount)}
                    </strong>
                  </div>

                  {selectedBookingTotal.logisticFee > 0 ? (
                    <div>
                      <span>Cargo logistico</span>
                      <strong>
                        {formatSoles(selectedBookingTotal.logisticFee)}
                      </strong>
                    </div>
                  ) : null}

                  {selectedBooking.is_express ||
                  selectedBookingTotal.expressFee > 0 ? (
                    <div>
                      <span>Belu Express</span>
                      <strong>
                        {formatSoles(selectedBookingTotal.expressFee)}
                      </strong>
                    </div>
                  ) : null}

                  <div className="cliente-panel-booking-breakdown-total">
                    <span>Total</span>
                    <strong>{formatSoles(selectedBookingTotal.total)}</strong>
                  </div>
                </div>
              ) : null}
              <p>
                <strong>Distrito:</strong> {selectedBooking.district}
              </p>
              <p>
                <strong>Dirección:</strong> {selectedBooking.address}
              </p>
            </div>

            <button
              type="button"
              className="cliente-panel-btn-ghost"
              onClick={() => setSelectedBooking(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
function PagosSection({
  clientName,
  bookingHistory,
}: {
  clientName: string;
  bookingHistory: ClientBooking[];
}) {
  const paymentStatusLabels: Record<string, string> = {
    pending: "Pago pendiente de confirmación",
    paid: "Pago confirmado",
    failed: "Pago fallido",
    refunded: "Reembolsado",
    partially_refunded: "Reembolso parcial",
  };
  const totalRegistrado = bookingHistory.reduce(
    (acc, booking) => acc + getClientBookingTotal(booking).total,
    0
  );
  const ultimoEstadoPago = bookingHistory[0]?.payment_status
    ? paymentStatusLabels[bookingHistory[0].payment_status] ||
      bookingHistory[0].payment_status
    : "Sin pagos";
  return (
    <section className="cliente-panel-section active">
      <div className="cliente-panel-top-bar">
        <div className="cliente-panel-greeting">
          <span className="cliente-panel-dashboard-kicker">Tus movimientos</span>
          <h1>Historial de pagos</h1>
          <p>Consulta los montos y estados de pago de tus reservas.</p>
        </div>

        <UserPill clientName={clientName} />
      </div>

      <div className="cliente-panel-pagos-summary">
        <div>
  <span>Total registrado</span>
          <strong>{formatSoles(totalRegistrado)}</strong>
</div>

        <div>
          <span>Reservas</span>
          <strong>{bookingHistory.length}</strong>
        </div>

        <div>
          <span>Último estado</span>
          <strong>{ultimoEstadoPago}</strong>
        </div>
      </div>

      <div className="cliente-panel-pagos-list">
        {bookingHistory.length === 0 ? (
          <div className="cliente-panel-card">
            <p>Aún no tienes pagos registrados.</p>
          </div>
        ) : (
          bookingHistory.map((booking) => {
            const bookingTotal = getClientBookingTotal(booking);

            return (
          <article className="cliente-panel-pago-card" key={booking.id}>
            <div className="cliente-panel-pago-main">
              <div>
                <div className="cliente-panel-pago-id">
                  {paymentStatusLabels[booking.payment_status] ||
                    booking.payment_status}
                </div>
                <h3>{booking.services?.name || "Servicio belu"}</h3>
                <p>
                  Beluer:{" "}
                  {booking.beluer_profiles?.public_name ||
                    "Pendiente de asignación"}
                </p>
              </div>

              <div className="cliente-panel-pago-monto">
                <span>
                  {paymentStatusLabels[booking.payment_status] ||
                    booking.payment_status}
                </span>
                <strong>{formatSoles(bookingTotal.total)}</strong>
              </div>
            </div>

            <div className="cliente-panel-pago-meta">
              <span>Fecha: {formatDisplayDate(booking.scheduled_date)}</span>
              <span>Hora: {formatDisplayTime(booking.scheduled_time)}</span>
              {booking.is_express ? (
                <span className="cliente-panel-express-pill">
                  Belu Express
                </span>
              ) : null}
              <span>
                Pago:{" "}
                {paymentStatusLabels[booking.payment_status] ||
                  booking.payment_status}
              </span>
            </div>

          </article>
            );
          })
        )}
      </div>
    </section>
  );
}
function PerfilSection({
  clientName,
  clientProfile,
  bookingCount,
}: {
  clientName: string;
  clientProfile: ClientProfile | null;
  bookingCount: number;
}) {
  const nombre = clientName;
  const email = clientProfile?.email || "";
  const [phone, setPhone] = useState(clientProfile?.phone || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [preferencia, setPreferencia] = useState(
    clientProfile?.beauty_preference || ""
  );
  

  const handleGuardarPerfil = async () => {
    setProfileLoading(true);

    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("beautyPreference", preferencia);

    const result = await updateClientProfileAction(formData);

    setProfileLoading(false);
    alert(result.message);
  };

  

  return (
    <section className="cliente-panel-section active">
      <div className="cliente-panel-top-bar">
        <div className="cliente-panel-greeting">
          <span className="cliente-panel-dashboard-kicker">Tu cuenta</span>
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
              <strong>{bookingCount}</strong>
              <span>Reservas</span>
            </div>

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
                readOnly
              />
            </div>

            <div className="cliente-panel-form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                readOnly
              />
            </div>

            <div className="cliente-panel-form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
          </div>

          <div className="cliente-panel-form-group">
            <label>Preferencia de belleza</label>
            <select
              value={preferencia}
              onChange={(event) => setPreferencia(event.target.value)}
            >
              <option value="" disabled>
                Selecciona una preferencia
              </option>
              <option value="Lashes naturales">Lashes naturales</option>
              <option value="Lashes con volumen">Lashes con volumen</option>
              <option value="Nails minimalistas">Nails minimalistas</option>
              <option value="Nails protagonistas">Nails protagonistas</option>
              <option value="Lashes y nails">Lashes y nails</option>
            </select>
          </div>

          <button
            className="cliente-panel-btn-r cliente-panel-full-btn"
            type="button"
            onClick={handleGuardarPerfil}
            disabled={profileLoading || !preferencia}
          >
            {profileLoading ? "Guardando..." : "Guardar cambios"}
          </button>

          <div className="cliente-panel-session-block">
            <div>
              <h3>Sesión</h3>
              <p>Cierra tu sesión de forma segura en este dispositivo.</p>
            </div>
            <LogoutButton className="cliente-panel-logout-button" />
          </div>
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
  goToReserva,
  clientName,
}: {
  beluers: Beluer[];
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
          <span className="cliente-panel-dashboard-kicker">Talento belu</span>
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
        {beluersFiltradas.length === 0 ? (
          <div className="cliente-panel-card">
            <p>Aún no hay especialistas disponibles.</p>
          </div>
        ) : (
          beluersFiltradas.map((beluer) => (
          <BeluerCard
            key={beluer.nombre}
            beluer={beluer}
            goToReserva={goToReserva}
          />
          ))
        )}
      </div>
    </section>
  );
}
function BeluerCard({
  beluer,
  goToReserva,
}: {
  beluer: Beluer;
  goToReserva: () => void;
}) {
  return (
    <article className="cliente-panel-beluer-card">
      <div className="cliente-panel-beluer-card-header">
        <img src={beluer.foto} alt={beluer.nombre} />
      </div>

      <div className="cliente-panel-beluer-card-body">
        <div className="cliente-panel-beluer-badge">
          {getBeluerBadge(beluer.categoria)}
        </div>

        <h3>{beluer.nombre}</h3>
        <p>{beluer.espec}</p>

        <div className="cliente-panel-beluer-meta">
          <span>
            {beluer.rating === "Sin calificación"
              ? beluer.rating
              : `⭐ ${beluer.rating}`}
          </span>
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
            Ver servicios →
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

function ServiceCompactCard({
  servicio,
  selected,
  onClick,
}: {
  servicio: Service;
  selected: boolean;
  onClick: () => void;
}) {
  const duration = getServiceDuration(servicio);

  return (
    <button
      className={`cliente-panel-service-compact-card ${selected ? "selected" : ""}`}
      type="button"
      onClick={onClick}
    >
      {servicio.image_url ? (
        <img
          className="cliente-panel-service-compact-image"
          src={servicio.foto}
          alt={servicio.nombre}
        />
      ) : (
        <span
          className="cliente-panel-service-compact-placeholder"
          aria-hidden="true"
        >
          <b>{servicio.nombre.slice(0, 1).toUpperCase()}</b>
          <small>✦</small>
        </span>
      )}

      <span className="cliente-panel-service-compact-body">
        <span className="cliente-panel-service-compact-kickers">
          <span className="cliente-panel-servicio-category">
            {servicio.categoria === "lashes" ? "Lashes" : "Nails"}
          </span>
          {servicio.is_featured ? (
            <span className="cliente-panel-service-featured-mini">
              Destacado ✦
            </span>
          ) : null}
        </span>
        <strong>{servicio.nombre}</strong>
        {servicio.desc ? <small>{servicio.desc}</small> : null}
        <span className="cliente-panel-service-compact-meta">
          <b>S/ {servicio.precio}</b>
          {duration ? <em>{duration}</em> : null}
        </span>
        <span className="cliente-panel-service-compact-cta">
          {selected ? "Seleccionado" : "Ver"}
        </span>
      </span>

      {selected ? (
        <span className="cliente-panel-service-row-check">✓</span>
      ) : null}
    </button>
  );
}

function ServiceDetailModal({
  servicio,
  selected,
  onChoose,
  onClose,
  primaryLabel = "Elegir este servicio",
}: {
  servicio: Service;
  selected: boolean;
  onChoose: () => void;
  onClose: () => void;
  primaryLabel?: string;
}) {
  const duration = getServiceDuration(servicio);
  const galleryImages = getServiceGalleryImages(servicio);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = galleryImages[activeImageIndex] || galleryImages[0];
  const hasMultipleImages = galleryImages.length > 1;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [servicio.id, servicio.nombre]);

  const goToPreviousImage = () => {
    setActiveImageIndex((currentIndex) =>
      currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1
    );
  };

  const goToNextImage = () => {
    setActiveImageIndex((currentIndex) =>
      currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1
    );
  };

  return (
    <div className="cliente-panel-modal-overlay">
      <div
        className="cliente-panel-service-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cliente-panel-service-detail-title"
      >
        <button
          className="cliente-panel-modal-close cliente-panel-service-detail-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle del servicio"
        >
          ✕
        </button>

        <div className="cliente-panel-service-detail-gallery">
          <div className="cliente-panel-service-detail-main-image">
            <img src={activeImage.url} alt={servicio.nombre} />

            {hasMultipleImages ? (
              <div className="cliente-panel-service-detail-nav">
                <button
                  type="button"
                  onClick={goToPreviousImage}
                  aria-label="Ver foto anterior"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={goToNextImage}
                  aria-label="Ver foto siguiente"
                >
                  Siguiente
                </button>
              </div>
            ) : null}
          </div>

          {hasMultipleImages ? (
            <div className="cliente-panel-service-detail-thumbs">
              {galleryImages.map((image, index) => (
                <button
                  key={image.key}
                  type="button"
                  className={index === activeImageIndex ? "active" : ""}
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`Ver foto ${index + 1} de ${servicio.nombre}`}
                >
                  <img src={image.url} alt="" aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="cliente-panel-service-detail-content">
          <span className="cliente-panel-service-detail-kickers">
            <span className="cliente-panel-servicio-category">
              {servicio.categoria === "lashes" ? "Lashes" : "Nails"}
            </span>
            {servicio.is_featured ? (
              <span className="cliente-panel-service-featured-mini">
                Destacado ✦
              </span>
            ) : null}
          </span>
          <h2 id="cliente-panel-service-detail-title">{servicio.nombre}</h2>
          <p>
            {servicio.desc ||
              "Servicio belu realizado por una especialista verificada."}
          </p>

          <div className="cliente-panel-service-detail-facts">
            <span>
              Precio
              <strong>S/ {servicio.precio}</strong>
            </span>
            <span>
              Duración
              <strong>{duration || "Por confirmar"}</strong>
            </span>
          </div>

          <div className="cliente-panel-service-detail-actions">
            <button
              className="cliente-panel-btn-r cliente-panel-full-btn"
              type="button"
              onClick={onChoose}
            >
              {primaryLabel}
            </button>
            <button
              className="cliente-panel-service-detail-secondary"
              type="button"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>

          {selected ? (
            <small className="cliente-panel-service-detail-selected">
              Este servicio ya está seleccionado en tu reserva.
            </small>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getServiceGalleryImages(servicio: Service) {
  const images: { key: string; url: string }[] = [];
  const usedUrls = new Set<string>();

  const addImage = (key: string, url?: string | null) => {
    if (!url || usedUrls.has(url)) return;

    images.push({ key, url });
    usedUrls.add(url);
  };

  addImage("principal", servicio.image_url);

  const sortedGalleryImages = [...(servicio.gallery_images || [])].sort(
    (first, second) => {
      const orderDifference =
        Number(first.sort_order || 0) - Number(second.sort_order || 0);

      if (orderDifference !== 0) return orderDifference;

      return String(first.created_at || "").localeCompare(
        String(second.created_at || "")
      );
    }
  );

  for (const image of sortedGalleryImages) {
    addImage(image.id, image.image_url);
  }

  if (images.length === 0) {
    addImage("placeholder", servicio.foto);
  }

  return images;
}

function getServiceDuration(servicio: Service) {
  const serviceWithDuration = servicio as Service & {
    duration_minutes?: number | null;
    duracionMinutos?: number | null;
    duracion?: string | null;
    duration?: string | null;
  };

  const minutes =
    serviceWithDuration.duration_minutes ?? serviceWithDuration.duracionMinutos;

  if (typeof minutes === "number" && minutes > 0) return `${minutes} min`;
  if (serviceWithDuration.duracion) return serviceWithDuration.duracion;
  if (serviceWithDuration.duration) return serviceWithDuration.duration;

  return "";
}

function ServiciosSection({
  services,
  selectedService,
  onSelectServiceForBooking,
  clientName,
}: {
  services: Service[];
  selectedService: Service | null;
  onSelectServiceForBooking: (servicio: Service) => void;
  clientName: string;
}) {
  const [filter, setFilter] = useState<ServiceCatalogFilter>("all");
  const [search, setSearch] = useState("");
  const [detailService, setDetailService] = useState<Service | null>(null);

  const normalizedSearch = normalizeServiceCatalogText(search);
  const sortedServices = sortServicesForReservation(services);
  const filteredServices = sortedServices.filter((servicio) => {
    if (filter === "featured" && !servicio.is_featured) return false;

    if (
      (filter === "lashes" || filter === "nails") &&
      servicio.categoria !== filter
    ) {
      return false;
    }

    if (!normalizedSearch) return true;

    return normalizeServiceCatalogText(
      `${servicio.nombre} ${servicio.desc} ${servicio.categoria}`
    ).includes(normalizedSearch);
  });

  const allSections: {
    id: ServiceCatalogSection;
    title: string;
    eyebrow: string;
    services: Service[];
  }[] = [
    {
      id: "featured",
      title: "Destacados ✦",
      eyebrow: "Seleccion belu",
      services: filteredServices.filter((servicio) =>
        Boolean(servicio.is_featured)
      ),
    },
    {
      id: "lashes",
      title: "Lashes",
      eyebrow: "Pestañas",
      services: filteredServices.filter(
        (servicio) => servicio.categoria === "lashes"
      ),
    },
    {
      id: "nails",
      title: "Nails",
      eyebrow: "Manos",
      services: filteredServices.filter(
        (servicio) => servicio.categoria === "nails"
      ),
    },
  ];
  const sections = allSections.filter((section) => {
    if (section.services.length === 0) return false;
    if (filter === "featured") return section.id === "featured";
    if (filter === "lashes") return section.id === "lashes";
    if (filter === "nails") return section.id === "nails";

    return true;
  });

  const filters: { id: ServiceCatalogFilter; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "featured", label: "Destacados ✦" },
    { id: "lashes", label: "Lashes" },
    { id: "nails", label: "Nails" },
  ];

  const isServiceSelected = (servicio: Service) =>
    Boolean(
      selectedService &&
        (selectedService.id
          ? selectedService.id === servicio.id
          : selectedService.nombre === servicio.nombre)
    );

  const handleReserveFromDetail = (servicio: Service) => {
    setDetailService(null);
    onSelectServiceForBooking(servicio);
  };

  return (
    <section className="cliente-panel-section cliente-panel-services-section active">
      <div className="cliente-panel-top-bar cliente-panel-services-topbar">
        <div className="cliente-panel-greeting">
          <span className="cliente-panel-dashboard-kicker">Catálogo ✦</span>
          <h1>Explora servicios</h1>
          <p>Lashes y nails a domicilio, cuando quieras.</p>
        </div>

        <UserPill clientName={clientName} />
      </div>

      <div className="cliente-panel-services-tools">
        <label className="cliente-panel-service-search cliente-panel-services-search">
          <span>Buscar servicio</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar servicio"
          />
        </label>

        <div
          className="cliente-panel-services-chips"
          aria-label="Filtros de servicios"
        >
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              className={filter === item.id ? "active" : ""}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cliente-panel-services-summary">
        <span>{filteredServices.length} servicios activos</span>
        <small>Explora con calma. Elige un servicio y agenda en Nueva Reserva.</small>
      </div>

      <div className="cliente-panel-services-sections">
        {sections.map((section) => (
          <section className="cliente-panel-services-group" key={section.id}>
            <div className="cliente-panel-services-group-head">
              <span>{section.eyebrow}</span>
              <h2>{section.title}</h2>
            </div>

            <div className="cliente-panel-services-grid">
              {section.services.map((servicio) => (
                <ServiceCatalogCard
                  key={`${section.id}-${servicio.id || servicio.nombre}`}
                  servicio={servicio}
                  selected={isServiceSelected(servicio)}
                  onViewDetail={() => setDetailService(servicio)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {sections.length === 0 ? (
        <div className="cliente-panel-services-empty">
          <strong>No encontramos servicios con ese filtro.</strong>
          <span>Prueba otro término o cambia de categoría.</span>
        </div>
      ) : null}

      {detailService ? (
        <ServiceDetailModal
          servicio={detailService}
          selected={isServiceSelected(detailService)}
          primaryLabel="Reservar este servicio"
          onChoose={() => handleReserveFromDetail(detailService)}
          onClose={() => setDetailService(null)}
        />
      ) : null}
    </section>
  );
}

function ServiceCatalogCard({
  servicio,
  selected,
  onViewDetail,
}: {
  servicio: Service;
  selected: boolean;
  onViewDetail: () => void;
}) {
  const duration = getServiceDuration(servicio);

  return (
    <article
      className={`cliente-panel-services-card ${selected ? "selected" : ""}`}
    >
      <div className="cliente-panel-services-card-image">
        {servicio.image_url ? (
          <img src={servicio.foto} alt={servicio.nombre} />
        ) : (
          <span className="cliente-panel-services-placeholder" aria-hidden="true">
            <b>{servicio.nombre.slice(0, 1).toUpperCase()}</b>
            <small>✦</small>
          </span>
        )}

        {servicio.is_featured ? (
          <span className="cliente-panel-services-featured">Destacado ✦</span>
        ) : null}

        {selected ? (
          <span className="cliente-panel-services-selected">
            Seleccionado para tu reserva
          </span>
        ) : null}
      </div>

      <div className="cliente-panel-services-card-body">
        <span className="cliente-panel-services-category">
          {servicio.categoria === "lashes" ? "Lashes" : "Nails"}
        </span>
        <h3>{servicio.nombre}</h3>
        <p>
          {servicio.desc ||
            "Servicio belu realizado por una especialista verificada."}
        </p>

        <div className="cliente-panel-services-card-meta">
          <strong>Desde {formatSoles(servicio.precio)}</strong>
          <span>{duration || "Duración por confirmar"}</span>
        </div>

        <button type="button" onClick={onViewDetail}>
          {selected ? "Ver servicio" : "Ver detalle"}
        </button>
      </div>
    </article>
  );
}

function normalizeServiceCatalogText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getSectionTitle(section: PanelSection) {
  const titles: Record<PanelSection, string> = {
    dashboard: "Inicio",
    reserva: "Agendar nueva cita",
    servicios: "Servicios",
    beluers: "Nuestras Especialistas",
    historial: "Tu historial",
    pagos: "Historial de pagos",
    perfil: "Mi perfil",
  };

  return titles[section];
}
