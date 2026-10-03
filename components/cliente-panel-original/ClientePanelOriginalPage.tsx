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
  BeluersCatalog,
  BookingHistoryList,
  BookingChoice,
  BookingChoiceGrid,
  BookingField,
  BookingFields,
  BookingFlow,
  BookingNotice,
  BookingOption,
  BookingStep,
  BookingSummary,
  BookingToggle,
  PaymentHistory,
  ServicesCatalog,
  type BeluerCatalogItem,
  type BeluerCardData,
  type BookingHeroData,
  type BookingHistoryDetailData,
  type BookingHistoryItemData,
  type ClientNavigationItem,
  type ServiceCatalogItem,
  type ServiceCardData,
  type PaymentHistoryItemData,
  type StatusBadgeData,
} from "@/components/belu";
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
  upcomingBookings: ClientBooking[];
  bookingHistory: ClientBooking[];
  realBeluers: Beluer[];
  realServices: Service[];
};

const bookingStatusPresentation: Record<string, StatusBadgeData> = {
  pending: { label: "Pendiente", tone: "warning" },
  assigned: { label: "Asignada", tone: "info" },
  confirmed: { label: "Confirmada", tone: "success" },
  in_progress: { label: "En curso", tone: "accent" },
  completed: { label: "Completada", tone: "success" },
  cancelled: { label: "Cancelada", tone: "danger" },
  redo_requested: { label: "Revisión solicitada", tone: "warning" },
  redo_approved: { label: "Revisión aprobada", tone: "info" },
};

const paymentStatusPresentation: Record<string, StatusBadgeData> = {
  pending: { label: "Pago pendiente", tone: "warning" },
  paid: { label: "Pago confirmado", tone: "success" },
  failed: { label: "Pago fallido", tone: "danger" },
  refunded: { label: "Reembolsado", tone: "neutral" },
};

function getBookingStatusPresentation(status: string): StatusBadgeData {
  return (
    bookingStatusPresentation[status] || { label: status, tone: "neutral" }
  );
}

function getPaymentStatusPresentation(status: string): StatusBadgeData {
  return (
    paymentStatusPresentation[status] || { label: status, tone: "neutral" }
  );
}

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
  upcomingBookings,
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
const nextBooking = upcomingBookings[0] || null;
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
      <div
        className={
          activeSection === "servicios" ||
          activeSection === "beluers" ||
          activeSection === "reserva" ||
          activeSection === "historial" ||
          activeSection === "pagos" ||
          activeSection === "perfil"
            ? "cliente-panel-shell cliente-panel-shell--canvas-direct"
            : "cliente-panel-shell"
        }
      >
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
  upcomingBookings={upcomingBookings}
  realBeluers={realBeluers}
  realServices={realServices}
/>
)}

          {activeSection === "reserva" && (
            <BookingFlow
              eyebrow="Nueva reserva"
              title="Agenda tu nueva cita"
              description="Elige tu servicio, fecha y dirección. belu coordina el resto."
              summary={
                <BookingSummary
                  serviceName={servicioSeleccionado?.nombre}
                  serviceDescription={servicioSeleccionado?.desc || undefined}
                  servicePrice={servicioSeleccionado ? `S/ ${precioServicio}` : undefined}
                  date={formatDisplayDate(fecha)}
                  time={formatDisplayTime(hora)}
                  district={distritoReserva}
                  address={direccionReserva.trim()}
                  logisticFee={servicioSeleccionado ? `S/ ${cargoLogistico}` : undefined}
                  expressFee={urgenciaEfectiva && servicioSeleccionado ? `S/ ${recargoExpress}` : undefined}
                  total={servicioSeleccionado ? `S/ ${total}` : undefined}
                  expressNote={
                    urgenciaEfectiva && servicioSeleccionado
                      ? "Te confirmamos una beluer en máximo 30 minutos o te reembolsamos el recargo."
                      : undefined
                  }
                  onConfirm={handleConfirmarReserva}
                />
              }
            >
              <BookingStep
                number="01"
                eyebrow="Servicio"
                title="Servicio para tu cita"
                description="Una reserva corresponde a un único servicio. Puedes cambiarlo desde el catálogo."
              >
                {servicioSeleccionado ? (
                  <BookingOption
                    media={
                      servicioSeleccionado.image_url ? (
                        <img
                          src={servicioSeleccionado.foto}
                          alt={servicioSeleccionado.nombre}
                        />
                      ) : (
                        <span aria-hidden="true">
                          <b>{servicioSeleccionado.nombre.slice(0, 1).toUpperCase()}</b>
                          <small>✦</small>
                        </span>
                      )
                    }
                    eyebrow={servicioSeleccionado.categoria === "lashes" ? "Lashes" : "Nails"}
                    title={servicioSeleccionado.nombre}
                    description={servicioSeleccionado.desc || undefined}
                    meta={
                      <>
                        <strong>{formatSoles(servicioSeleccionado.precio)}</strong>
                        <span>{getServiceDuration(servicioSeleccionado) || "Duración por confirmar"}</span>
                      </>
                    }
                    actionLabel="Cambiar servicio"
                    onAction={() => goToSection("servicios")}
                  />
                ) : (
                  <BookingOption
                    title="Elige el servicio que quieres reservar"
                    description="Explora Lashes y Nails, revisa los detalles y selecciona una opción para continuar."
                    actionLabel="Ver servicios"
                    onAction={() => goToSection("servicios")}
                    empty
                  />
                )}
              </BookingStep>

              <BookingStep
                number="02"
                eyebrow="Cuándo"
                title="Fecha y hora"
                description="Elige un horario disponible para tu atención."
              >
                <BookingFields>
                  <BookingField label="Fecha deseada" hint="Elige el día ideal para tu atención.">
                    <input
                      type="date"
                      value={fecha}
                      min={getTodayLocalDate()}
                      onChange={(event) => setFecha(event.target.value)}
                    />
                  </BookingField>

                  <BookingField label="Hora" hint={horaHelpText}>
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
                            disabled={getHoraOptionDisabled(timeOption, horaPicker.meridiem)}
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
                  </BookingField>
                </BookingFields>
              </BookingStep>

              <BookingStep
                number="03"
                eyebrow="Dónde"
                title="Ubicación"
                description="Indica dónde quieres recibir a tu Beluer."
              >
                <BookingFields>
                  <BookingField
                    label="Distrito"
                    hint="Escribe tu distrito. belu validará cobertura antes de confirmar."
                  >
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
                  </BookingField>

                  <BookingField
                    label="Dirección del servicio"
                    hint="Ingresa la dirección donde quieres recibir a tu Beluer."
                  >
                    <input
                      type="text"
                      value={direccionReserva}
                      onChange={(event) => setDireccionReserva(event.target.value)}
                      placeholder="Ej: Av. Santa Cruz 950, dpto 402"
                    />
                  </BookingField>
                </BookingFields>
              </BookingStep>

              <BookingStep
                number="04"
                eyebrow="Preferencias"
                title="Express y asignación"
                description="Define la modalidad y agrega indicaciones para tu cita."
              >
                <BookingFields>
                  <BookingToggle
                    checked={urgenciaEfectiva}
                    disabled={urgenciaAutomatica}
                    title={
                      urgenciaAutomatica
                        ? "Belu Express obligatorio"
                        : "Necesito este servicio con urgencia (máx. 2 horas)"
                    }
                    description={
                      urgenciaAutomatica
                        ? "Belu Express se activó automáticamente porque tu cita está dentro de las próximas 2 horas."
                        : undefined
                    }
                    onChange={(checked) => {
                      if (!urgenciaAutomatica) setUrgencia(checked);
                    }}
                  />

                  <BookingField label="Modo de asignación" fullWidth>
                    <select
                      value={modoAsignacion}
                      onChange={(event) => {
                        setModoAsignacion(event.target.value as AssignmentMode);
                        setBeluerSeleccionada("");
                      }}
                    >
                      <option value="gestionado">Gestionado (belu elige por ti)</option>
                      <option value="libre">Libre (tú eliges a tu beluer)</option>
                    </select>
                  </BookingField>

                  {modoAsignacion === "gestionado" ? (
                    <BookingNotice
                      title="¿Cómo funciona el Modo Gestionado?"
                      footer="Precio fijo garantizado. Sin sorpresas."
                    >
                      Publicamos tu solicitud en nuestro canal interno. La primera beluer
                      disponible en tu zona aceptará y recibirás confirmación inmediata.
                    </BookingNotice>
                  ) : null}

                  {modoAsignacion === "libre" ? (
                    <BookingChoiceGrid
                      title="Elige a tu beluer (precio fijo para todas):"
                      hint="Solo se muestran las beluers que realizan el servicio seleccionado."
                    >
                      {beluersDisponibles.length > 0 ? (
                        beluersDisponibles.map((beluer) => (
                          <BookingChoice
                            key={beluer.nombre}
                            media={<img src={beluer.foto} alt={beluer.nombre} />}
                            title={beluer.nombre}
                            meta={`⭐ ${beluer.rating} · ${beluer.citas} citas`}
                            selected={beluerSeleccionada === beluer.nombre}
                            onSelect={() => setBeluerSeleccionada(beluer.nombre)}
                          />
                        ))
                      ) : (
                        <p>No hay beluers disponibles para estos servicios en este momento.</p>
                      )}
                    </BookingChoiceGrid>
                  ) : null}

                  <BookingField
                    label="Instrucciones adicionales"
                    hint="Opcional: agrega preferencias o indicaciones de acceso."
                    fullWidth
                  >
                    <textarea
                      value={notasReserva}
                      onChange={(event) => setNotasReserva(event.target.value)}
                      placeholder="Ej: prefiero diseño francés, color rojo intenso..."
                    />
                  </BookingField>
                </BookingFields>
              </BookingStep>
            </BookingFlow>
          )}

          {activeSection === "servicios" && (
            <ServiciosSection
              services={realServices}
              selectedService={servicioSeleccionado}
              onSelectServiceForBooking={selectServiceForBooking}
            />
          )}

          {activeSection === "beluers" && (
  <EspecialistasSection
    beluers={realBeluers}
    goToReserva={() => goToSection("servicios")}
  />
)}

{activeSection === "historial" && (
  <HistorialSection
    bookingHistory={bookingHistory}
    goToReserva={() => goToSection("reserva")}
  />
)}
{activeSection === "pagos" && (
  <PagosSection bookingHistory={bookingHistory} />
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
  upcomingBookings,
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
  upcomingBookings: ClientBooking[];
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
  const bookings: BookingHeroData[] = upcomingBookings.map((booking) => ({
    id: booking.id,
    service: booking.services?.name || "Servicio belu",
    status:
      reservationStatusLabels[booking.status] || booking.status,
    date: formatDisplayDate(booking.scheduled_date),
    time: formatDisplayTime(booking.scheduled_time),
    district: booking.district || undefined,
    beluer: booking.beluer_profiles?.public_name || undefined,
    total: formatSoles(getClientBookingTotal(booking).total),
  }));

  if (bookings.length === 0 && reservaConfirmada) {
    bookings.push({
      id: "new-booking",
      service: servicioSeleccionado?.nombre || "Servicio belu",
      status: "Confirmada",
      date: formatDisplayDate(fecha),
      time: formatDisplayTime(hora),
      beluer:
        modoAsignacion === "libre" && beluerSeleccionada
          ? beluerSeleccionada
          : undefined,
      total: formatSoles(total),
    });
  }
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
      bookings={bookings}
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
}: {
  bookingHistory: ClientBooking[];
  goToReserva: () => void;
}) {
  const [selectedBooking, setSelectedBooking] = useState<ClientBooking | null>(
    null
  );
  const items: BookingHistoryItemData[] = bookingHistory.map((booking) => {
    const bookingTotal = getClientBookingTotal(booking);

    return {
      id: booking.id,
      service: booking.services?.name || "Servicio belu",
      beluer:
        booking.beluer_profiles?.public_name || "Pendiente de asignación",
      date: formatDisplayDate(booking.scheduled_date),
      time: formatDisplayTime(booking.scheduled_time),
      location: `${booking.district} · ${booking.address}`,
      amount: formatSoles(bookingTotal.total),
      status: getBookingStatusPresentation(booking.status),
      paymentStatus: getPaymentStatusPresentation(booking.payment_status),
      isExpress: Boolean(booking.is_express),
    };
  });

  let selectedItem: BookingHistoryDetailData | null = null;

  if (selectedBooking) {
    const selectedBookingTotal = getClientBookingTotal(selectedBooking);
    const breakdown: BookingHistoryDetailData["breakdown"] = [
      {
        label: "Servicio",
        value: formatSoles(selectedBookingTotal.serviceAmount),
      },
    ];

    if (selectedBookingTotal.logisticFee > 0) {
      breakdown.push({
        label: "Cargo logístico",
        value: formatSoles(selectedBookingTotal.logisticFee),
      });
    }

    if (selectedBooking.is_express || selectedBookingTotal.expressFee > 0) {
      breakdown.push({
        label: "Belu Express",
        value: formatSoles(selectedBookingTotal.expressFee),
      });
    }

    breakdown.push({
      label: "Total",
      value: formatSoles(selectedBookingTotal.total),
      isTotal: true,
    });

    selectedItem = {
      id: selectedBooking.id,
      service: selectedBooking.services?.name || "Servicio belu",
      beluer:
        selectedBooking.beluer_profiles?.public_name ||
        "Pendiente de asignación",
      date: formatDisplayDate(selectedBooking.scheduled_date),
      time: formatDisplayTime(selectedBooking.scheduled_time),
      location: `${selectedBooking.district} · ${selectedBooking.address}`,
      district: selectedBooking.district,
      address: selectedBooking.address,
      amount: formatSoles(selectedBookingTotal.total),
      status: getBookingStatusPresentation(selectedBooking.status),
      paymentStatus: getPaymentStatusPresentation(
        selectedBooking.payment_status
      ),
      isExpress: Boolean(selectedBooking.is_express),
      breakdown,
    };
  }

  return (
    <BookingHistoryList
      items={items}
      selectedItem={selectedItem}
      onBook={goToReserva}
      onViewDetails={(bookingId) =>
        setSelectedBooking(
          bookingHistory.find((booking) => booking.id === bookingId) || null
        )
      }
      onCloseDetails={() => setSelectedBooking(null)}
    />
  );
}

function PagosSection({
  bookingHistory,
}: {
  bookingHistory: ClientBooking[];
}) {
  const totalRegistrado = bookingHistory.reduce(
    (acc, booking) => acc + getClientBookingTotal(booking).total,
    0
  );
  const latestPaymentStatus = bookingHistory[0]?.payment_status
    ? getPaymentStatusPresentation(bookingHistory[0].payment_status)
    : null;
  const items: PaymentHistoryItemData[] = bookingHistory.map((booking) => ({
    id: booking.id,
    service: booking.services?.name || "Servicio belu",
    beluer:
      booking.beluer_profiles?.public_name || "Pendiente de asignación",
    date: formatDisplayDate(booking.scheduled_date),
    time: formatDisplayTime(booking.scheduled_time),
    amount: formatSoles(getClientBookingTotal(booking).total),
    status: getPaymentStatusPresentation(booking.payment_status),
    isExpress: Boolean(booking.is_express),
  }));

  return (
    <PaymentHistory
      summary={{
        total: formatSoles(totalRegistrado),
        bookingCount: bookingHistory.length,
        latestStatus: latestPaymentStatus,
      }}
      items={items}
    />
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
}: {
  beluers: Beluer[];
  goToReserva: () => void;
}) {
  const catalogBeluers: BeluerCatalogItem[] = beluers.map((beluer, index) => {
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
      level: "Verificada",
      services: beluer.serviciosActivos,
      categoryKey: beluer.categoria,
    };
  });

  return (
    <BeluersCatalog
      beluers={catalogBeluers}
      onViewServices={goToReserva}
    />
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
}: {
  services: Service[];
  selectedService: Service | null;
  onSelectServiceForBooking: (servicio: Service) => void;
}) {
  const [detailService, setDetailService] = useState<Service | null>(null);

  const isServiceSelected = (servicio: Service) =>
    Boolean(
      selectedService &&
        (selectedService.id
          ? selectedService.id === servicio.id
          : selectedService.nombre === servicio.nombre)
    );

  const catalogEntries = sortServicesForReservation(services).map(
    (servicio, index) => {
      const id = servicio.id || `${servicio.nombre}-${index}`;
      const viewModel: ServiceCatalogItem = {
        id,
        name: servicio.nombre,
        category: servicio.categoria === "lashes" ? "Lashes" : "Nails",
        categoryKey: servicio.categoria,
        price: formatSoles(servicio.precio),
        imageUrl: servicio.image_url ? servicio.foto : undefined,
        description: servicio.desc || undefined,
        duration: getServiceDuration(servicio) || undefined,
        isFeatured: Boolean(servicio.is_featured),
        isSelected: isServiceSelected(servicio),
      };

      return { id, servicio, viewModel };
    }
  );
  const catalogServices = catalogEntries.map((entry) => entry.viewModel);

  const handleViewService = (serviceId: string) => {
    const entry = catalogEntries.find((item) => item.id === serviceId);
    if (entry) setDetailService(entry.servicio);
  };

  const handleReserveFromDetail = (servicio: Service) => {
    setDetailService(null);
    onSelectServiceForBooking(servicio);
  };

  return (
    <>
      <ServicesCatalog
        services={catalogServices}
        onViewService={handleViewService}
      />

      {detailService ? (
        <ServiceDetailModal
          servicio={detailService}
          selected={isServiceSelected(detailService)}
          primaryLabel="Reservar este servicio"
          onChoose={() => handleReserveFromDetail(detailService)}
          onClose={() => setDetailService(null)}
        />
      ) : null}
    </>
  );
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
