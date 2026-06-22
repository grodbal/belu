"use client";

import { useEffect, useMemo, useState } from "react";
import { createBookingAction } from "@/app/actions/client/createBooking";
import { cancelBookingAction } from "@/app/actions/client/cancelBooking";
import { updateClientProfileAction } from "@/app/actions/client/updateClientProfile";
import {
  addonsLashes,
  addonsNails,
  crearPlaceholder,
} from "./clientePanelData";
import type {
  Addon,
  AssignmentMode,
  Beluer,
  GestionReservaModal,
  PanelSection,
  PaymentMethod,
  Service,
  ServiceCategory,
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

function getLimaGreeting() {
  const limaHour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Lima",
    }).format(new Date())
  );

  if (limaHour < 12) return "Buenos días";
  if (limaHour < 19) return "Buenas tardes";
  return "Buenas noches";
}

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
  bookingHistory,
  realBeluers,
  realServices,
}: ClientePanelOriginalPageProps) {
  const [activeSection, setActiveSection] = useState<PanelSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeServiceCategory, setActiveServiceCategory] =
    useState<ServiceCategory>("lashes");
  const [serviceView, setServiceView] =
    useState<"featured" | "complete">("featured");
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceDetail, setServiceDetail] = useState<Service | null>(null);

  const [servicioLashes, setServicioLashes] = useState<Service | null>(null);
  const [servicioNails, setServicioNails] = useState<Service | null>(null);
  const [addonsSeleccionados, setAddonsSeleccionados] = useState<string[]>([]);
const [fecha, setFecha] = useState(getTodayLocalDate);
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
const [cancelLoading, setCancelLoading] = useState(false);
const [beluersFavoritas] = useState<string[]>([]);
const [modalGestion, setModalGestion] =
  useState<GestionReservaModal>(null);

const [nuevaFecha, setNuevaFecha] = useState(fecha);
const [nuevaHora, setNuevaHora] = useState(hora);
const [nuevaBeluer, setNuevaBeluer] = useState("");
const catalogoLashes = sortServicesForReservation(
  realServices.filter((servicio) => servicio.categoria === "lashes")
);
const catalogoNails = sortServicesForReservation(
  realServices.filter((servicio) => servicio.categoria === "nails")
);
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

const activeCatalog =
  activeServiceCategory === "lashes" ? catalogoLashes : catalogoNails;
const activeSelectedService =
  activeServiceCategory === "lashes" ? servicioLashes : servicioNails;
const activeCategoryLabel =
  activeServiceCategory === "lashes" ? "Lashes" : "Nails";
const activeCategoryDescription =
  activeServiceCategory === "lashes"
    ? "Extensiones, lifting y servicios para pestañas."
    : "Manicure, gel y servicios de uñas a domicilio.";
const normalizedServiceSearch = normalizarTexto(serviceSearch);
const activeFilteredServices = normalizedServiceSearch
  ? activeCatalog.filter((servicio) =>
      normalizarTexto(`${servicio.nombre} ${servicio.desc}`).includes(
        normalizedServiceSearch
      )
    )
  : activeCatalog;
const activeFeaturedServices = activeFilteredServices.slice(0, 4);
const urgenciaAutomatica = isWithinNextTwoHours(fecha, hora);

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

useEffect(() => {
  if (selectedTimeHasPassed && nextAvailableTime && nextAvailableTime !== hora) {
    setHora(nextAvailableTime);
  }
}, [selectedTimeHasPassed, nextAvailableTime, hora]);

useEffect(() => {
  setUrgencia(urgenciaAutomatica);
}, [urgenciaAutomatica]);

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
      setServicioLashes(servicio);
    }

    if (servicio.categoria === "nails") {
      setServicioNails(servicio);
    }

    setBeluerSeleccionada("");
  };

  const handleChooseServiceFromDetail = (servicio: Service) => {
    handleServicioClick(servicio);
    setServiceDetail(null);
  };

const handleConfirmarReserva = () => {
  if (serviciosSeleccionados.length === 0) {
    alert("Selecciona al menos un servicio.");
    return;
  }

  if (serviciosSeleccionados.length > 1) {
    // Fase 2: reservas combinadas requieren booking_items para persistir múltiples servicios con snapshots de precio, comisión y duración.
    alert(
      "Por ahora cada servicio se reserva por separado para asegurar disponibilidad y asignar correctamente a la Beluer. Elige un servicio para continuar y luego podrás reservar el siguiente."
    );
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
  const servicioPrincipal = serviciosSeleccionados[0];

  if (!servicioPrincipal) {
    alert("Selecciona un servicio antes de confirmar.");
    return;
  }

  setBookingLoading(true);

  const formData = new FormData();
  if (servicioPrincipal.id) {
    formData.append("serviceId", servicioPrincipal.id);
  }
  formData.append("serviceName", servicioPrincipal.nombre);
  formData.append("bookingMode", modoAsignacion);
formData.append("selectedBeluerName", beluerSeleccionada);
  formData.append("scheduledDate", fecha);
  formData.append("scheduledTime", hora);
  formData.append("address", direccionReserva.trim());
  formData.append("district", distritoReserva.trim());
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
  alert(
    `Favoritas se activará pronto. Por ahora, contáctanos por WhatsApp si quieres solicitar a ${nombre}.`
  );
};
const handleReprogramarReserva = () => {
  setModalGestion(null);
  alert(
    "Para reprogramar esta reserva, contáctanos por WhatsApp. Pronto podrás hacerlo desde tu panel."
  );
};

const handleCambiarBeluer = () => {
  setModalGestion(null);
  alert(
    "El cambio de Beluer será gestionado por belu para asegurar disponibilidad. Contáctanos por WhatsApp."
  );
};

const handleCancelarReserva = async () => {
  if (!nextBooking?.id) {
    setReservaConfirmada(false);
    setModalGestion(null);
    alert("Tu reserva ha sido cancelada.");
    return;
  }

  setCancelLoading(true);

  const result = await cancelBookingAction(nextBooking.id);

  setCancelLoading(false);

  if (!result.success) {
    alert(result.message);
    return;
  }

  setReservaConfirmada(false);
  setModalGestion(null);
  alert(result.message);

  window.location.reload();
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

              <div className="cliente-panel-reserva-card">
                <div className="cliente-panel-booking-left">
                  <div className="cliente-panel-booking-block cliente-panel-service-picker">
                    <div className="cliente-panel-reserva-block-title">
                      <span>1 · Elige tu servicio</span>
                      <h2>Servicio para tu cita</h2>
                      <p>
                        Explora por categoría, revisa destacados o usa la lista
                        completa para encontrar opciones rápido.
                      </p>
                    </div>

                    <div
                      className="cliente-panel-service-tabs"
                      aria-label="Categoría de servicio"
                    >
                      <button
                        type="button"
                        className={
                          activeServiceCategory === "lashes" ? "active" : ""
                        }
                        onClick={() => setActiveServiceCategory("lashes")}
                      >
                        Lashes
                      </button>
                      <button
                        type="button"
                        className={
                          activeServiceCategory === "nails" ? "active" : ""
                        }
                        onClick={() => setActiveServiceCategory("nails")}
                      >
                        Nails
                      </button>
                    </div>

                    <div className="cliente-panel-service-tools">
                      <div
                        className="cliente-panel-service-view-toggle"
                        aria-label="Vista de servicios"
                      >
                        <button
                          type="button"
                          className={serviceView === "featured" ? "active" : ""}
                          onClick={() => setServiceView("featured")}
                        >
                          Destacados
                        </button>
                        <button
                          type="button"
                          className={serviceView === "complete" ? "active" : ""}
                          onClick={() => setServiceView("complete")}
                        >
                          Lista completa
                        </button>
                      </div>

                      <label className="cliente-panel-service-search">
                        <span>Buscar servicio</span>
                        <input
                          type="search"
                          value={serviceSearch}
                          onChange={(event) =>
                            setServiceSearch(event.target.value)
                          }
                          placeholder="Buscar servicio..."
                        />
                      </label>
                    </div>

                    <div className="cliente-panel-categoria-titulo">
                      {activeCategoryLabel}
                      <small>{activeCategoryDescription}</small>
                    </div>

                    {serviceView === "featured" ? (
                      <div className="cliente-panel-servicios-grid">
                        {activeFeaturedServices.map((servicio) => (
                          <ServiceCard
                            key={servicio.nombre}
                            servicio={servicio}
                            selected={
                              activeSelectedService?.nombre === servicio.nombre
                            }
                            onClick={() => setServiceDetail(servicio)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="cliente-panel-service-visual-list">
                        {activeFilteredServices.map((servicio) => (
                          <ServiceCompactCard
                            key={servicio.nombre}
                            servicio={servicio}
                            selected={
                              activeSelectedService?.nombre === servicio.nombre
                            }
                            onClick={() => setServiceDetail(servicio)}
                          />
                        ))}
                      </div>
                    )}

                    {activeFilteredServices.length === 0 && (
                      <div className="cliente-panel-service-empty">
                        No encontramos servicios con ese nombre.
                      </div>
                    )}

                    {activeServiceCategory === "lashes" && servicioLashes && (
                      <AddonsSection
                        label="Servicios adicionales (100% para tu Beluer)"
                        addons={addonsLashes}
                        selectedAddons={addonsSeleccionados}
                        onToggle={toggleAddon}
                      />
                    )}

                    {activeServiceCategory === "nails" && servicioNails && (
                      <AddonsSection
                        label="Servicios adicionales de uñas (100% para tu Beluer)"
                        addons={addonsNails}
                        selectedAddons={addonsSeleccionados}
                        onToggle={toggleAddon}
                      />
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
                    checked={urgencia}
                    onChange={(event) => setUrgencia(event.target.checked)}
                  />
                  <span>
                    ⚡ Necesito este servicio con urgencia (máx. 2 horas)
                  </span>
                </label>
                {urgenciaAutomatica && (
                  <small className="cliente-panel-urgencia-auto-note">
                    Se marcó como urgente porque tu cita está dentro de las
                    próximas 2 horas.
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
  <small>Opcional: agrega preferencias o indicaciones de acceso.</small>
</div>
                    </div>
                </div>
                </div>

                <aside className="cliente-panel-booking-summary">
                <div className="cliente-panel-reserva-block-title cliente-panel-reserva-summary-title">
                  <span>Resumen de reserva</span>
                  <h2>Resumen de reserva</h2>
                  <p>
                    Revisa los datos principales antes de continuar con la
                    confirmación.
                  </p>
                </div>

                {serviciosSeleccionados.length === 0 && (
                  <div className="cliente-panel-resumen-pago cliente-panel-resumen-empty">
                    <strong>Elige un servicio para ver el resumen de tu reserva.</strong>
                    <span>
                      Aquí aparecerán servicio, fecha, hora, distrito y total.
                    </span>
                  </div>
                )}

                {serviciosSeleccionados.length > 0 && (
                  <div className="cliente-panel-resumen-pago">
                    <div className="linea">
                      <span>Servicio</span>
                      <strong>
                        {serviciosSeleccionados
                          .map((servicio) => servicio.nombre)
                          .join(" + ")}
                      </strong>
                    </div>

                    {serviciosSeleccionados.length > 1 && (
                      <div className="cliente-panel-reserva-single-note">
                        Por ahora cada servicio se reserva por separado. Elige
                        un servicio para continuar y luego podrás reservar el
                        siguiente.
                      </div>
                    )}

                    <div className="linea">
                      <span>Fecha</span>
                      <strong>{formatDisplayDate(fecha)}</strong>
                    </div>

                    <div className="linea">
                      <span>Hora</span>
                      <strong>{formatDisplayTime(hora)}</strong>
                    </div>

                    <div className="linea">
                      <span>Distrito</span>
                      <strong>{distritoReserva}</strong>
                    </div>

                    <div className="linea">
                      <span>Dirección</span>
                      <strong>
                        {direccionReserva.trim() || "Pendiente de completar"}
                      </strong>
                    </div>

                    {addonsActivos.length > 0 && (
                      <div className="addons-wrapper">
                        <div className="addons-title">
                          Servicios adicionales
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
                      <span>Cargo logístico</span>
                      <strong>S/ {cargoLogistico}</strong>
                    </div>

                    <div className="linea total">
                      <span>Total</span>
                      <strong>S/ {urgencia ? total : subtotal}</strong>
                    </div>

                    {urgencia && (
                      <div className="express">
                        <div className="linea">
                          <span>Belu Express</span>
                          <strong>+ S/ {recargoExpress}</strong>
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
                  Confirmar reserva
                </button>

                <p className="cliente-panel-reserva-mvp-note">
                  En esta etapa, la confirmación y coordinación final se realiza
                  por WhatsApp belu.
                </p>
                </aside>
              </div>
            </section>
          )}

          {activeSection === "beluers" && (
  <EspecialistasSection
    beluers={realBeluers}
    favoritas={beluersFavoritas}
    onToggleFavorita={toggleBeluerFavorita}
    goToReserva={() => goToSection("reserva")}
    clientName={clientName}
  />
)}


{activeSection === "favoritas" && (
  <FavoritasSection
    beluers={realBeluers}
    favoritas={beluersFavoritas}
    onToggleFavorita={toggleBeluerFavorita}
    goToReserva={() => goToSection("reserva")}
    goToEspecialistas={() => goToSection("beluers")}
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
    favoritesCount={beluersFavoritas.length}
  />
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
      {serviceDetail && (
        <ServiceDetailModal
          servicio={serviceDetail}
          selected={activeSelectedService?.nombre === serviceDetail.nombre}
          onChoose={() => handleChooseServiceFromDetail(serviceDetail)}
          onClose={() => setServiceDetail(null)}
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
        Para reprogramar esta reserva, contáctanos por WhatsApp.
      </p>

      <div className="cliente-panel-gestion-aviso">
        Pronto podrás hacerlo desde tu panel. En esta fase, el equipo belu
        gestionará el cambio manualmente para validar disponibilidad.
      </div>

      <div className="cliente-panel-form-group">
        <label>Nueva fecha</label>
        <input
          type="date"
          value={nuevaFecha}
          onChange={(event) => setNuevaFecha(event.target.value)}
          disabled
        />
      </div>

      <div className="cliente-panel-form-group">
        <label>Nueva hora</label>
        <input
          type="text"
          value={formatDisplayTime(nuevaHora)}
          readOnly
          disabled
        />
      </div>

      <button
        className="cliente-panel-btn-r cliente-panel-full-btn"
        type="button"
        onClick={handleReprogramarReserva}
      >
        Solicitar reprogramación por WhatsApp
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
        El cambio de Beluer será gestionado por belu para asegurar disponibilidad.
      </p>

      <div className="cliente-panel-gestion-aviso">
        Contáctanos por WhatsApp y el equipo belu revisará disponibilidad antes
        de confirmar cualquier cambio.
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
              disabled
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
        Solicitar cambio por WhatsApp
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
  disabled={cancelLoading}
>
  {cancelLoading ? "Cancelando..." : "Sí, cancelar"}
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
  const assignedBeluerName = nextBooking?.beluer_profiles?.public_name || "";
  const greeting = getLimaGreeting();
  const reservationStatus = nextBooking?.status || "pending";
  const reservationStatusLabels: Record<string, string> = {
    pending: "Pendiente",
    assigned: "Asignada",
    confirmed: "Confirmada",
    in_progress: "En curso",
    completed: "Completada",
    cancelled: "Cancelada",
  };
  const appointmentService =
    nextBooking?.services?.name ||
    serviciosSeleccionados.map((servicio) => servicio.nombre).join(" + ") ||
    "Servicio belu";
  const appointmentBeluer =
    assignedBeluerName ||
    (modoAsignacion === "libre" && beluerSeleccionada
      ? beluerSeleccionada
      : "Beluer pendiente de asignación");
  const assignmentMessage = nextBooking
    ? assignedBeluerName
      ? nextBooking.status === "confirmed"
        ? `Tu reserva fue confirmada por ${assignedBeluerName}.`
        : nextBooking.status === "assigned"
          ? `Tu servicio será realizado por ${assignedBeluerName}. Pendiente de confirmación.`
          : `Tu servicio será realizado por ${assignedBeluerName}.`
      : "belu está asignando una especialista para tu servicio."
    : "Tu servicio ya está agendado. Te notificaremos por WhatsApp con los datos de tu Beluer.";
  const dashboardLocation = nextBooking?.district
    ? `Atención en ${nextBooking.district}`
    : "";

  return (
    <section className="cliente-panel-section cliente-panel-dashboard active">
      <div className="cliente-panel-top-bar cliente-panel-dashboard-topbar">
        <div className="cliente-panel-greeting">
          <h1>
            {greeting}, {clientFirstName} ✦
          </h1>
          <p>Tu próxima cita y accesos esenciales en un solo lugar.</p>
        </div>

        {dashboardLocation ? (
          <span className="cliente-panel-dashboard-location">
            {dashboardLocation}
          </span>
        ) : null}

        <UserPill clientName={clientName} />
      </div>

      <div className="cliente-panel-dashboard-main-grid">
        {!reservaConfirmada ? (
          <div className="cliente-panel-dashboard-empty">
            <div className="cliente-panel-dashboard-appointment-visual">
              <span>Próxima cita</span>
              <strong>belu</strong>
            </div>

            <div className="cliente-panel-dashboard-empty-copy">
              <span className="cliente-panel-dashboard-kicker">
                Próxima cita
              </span>
              <h2>Aún no tienes una cita activa</h2>
              <p>
                Agenda tu próximo servicio y belu coordinará la atención
                contigo.
              </p>

              <button
                className="cliente-panel-btn-r cliente-panel-dashboard-primary"
                type="button"
                onClick={() => goToSection("reserva")}
              >
                Nueva reserva
              </button>
            </div>
          </div>
        ) : (
          <article className="cliente-panel-reserva-activa-card cliente-panel-dashboard-appointment">
            <div className="cliente-panel-dashboard-appointment-visual">
              <span>Servicio</span>
              <strong>{appointmentService}</strong>
            </div>

            <div className="cliente-panel-dashboard-appointment-content">
              <div className="cliente-panel-dashboard-card-head">
                <div>
                  <span className="cliente-panel-dashboard-kicker">
                    Próxima cita
                  </span>
                  <h2>
                    {nextBooking
                      ? "Tu próxima cita belu ✦"
                      : "Tu cita belu está confirmada ✦"}
                  </h2>
                  <p>{assignmentMessage}</p>
                </div>

                <span
                  className="belu-badge cliente-panel-dashboard-status"
                  data-status={reservationStatus}
                >
                  {reservationStatusLabels[reservationStatus] ||
                    reservationStatus}
                </span>

                {nextBooking?.is_express ? (
                  <span className="belu-badge cliente-panel-express-pill">
                    Belu Express
                  </span>
                ) : null}
              </div>

              <div className="cliente-panel-dashboard-appointment-details">
                <div>
                  <span>Servicio</span>
                  <strong>{appointmentService}</strong>
                </div>

                <div>
                  <span>Beluer</span>
                  <strong>{appointmentBeluer}</strong>
                </div>

                <div>
                  <span>Fecha y hora</span>
                  <strong>
                    {formatDisplayDate(nextBooking?.scheduled_date || fecha)} ·{" "}
                    {formatDisplayTime(nextBooking?.scheduled_time || hora)}
                  </strong>
                </div>

                {nextBooking ? (
                  <div>
                    <span>Ubicación</span>
                    <strong>
                      {nextBooking.district} · {nextBooking.address}
                    </strong>
                  </div>
                ) : null}

                <div>
                  <span>Total</span>
                  <strong>
                    {formatSoles(
                      nextBooking ? getClientBookingTotal(nextBooking).total : total
                    )}
                  </strong>
                </div>

                {addonsActivos.length > 0 && (
                  <div>
                    <span>Adicionales</span>
                    <strong>
                      {addonsActivos.map((addon) => addon.nombre).join(" + ")}
                    </strong>
                  </div>
                )}
              </div>

              <div className="cliente-panel-ra-acciones">
                <button type="button" onClick={() => goToSection("historial")}>
                  Ver detalle
                </button>

                <button type="button" onClick={() => onOpenGestion("reprogramar")}>
                  Reprogramar
                </button>

                <button
                  type="button"
                  onClick={() => onOpenGestion("cambiarBeluer")}
                >
                  Cambiar Beluer
                </button>

                <button type="button" onClick={() => onOpenGestion("cancelar")}>
                  Cancelar
                </button>
              </div>

              <p className="cliente-panel-dashboard-manual-note">
                Reprogramaciones y cambios se coordinan por WhatsApp en esta
                etapa.
              </p>
            </div>
          </article>
        )}

        <aside className="cliente-panel-dashboard-quick-card">
          <span className="cliente-panel-dashboard-kicker">Atajos</span>
          <h2>Accesos rápidos</h2>

          <div className="cliente-panel-dashboard-quick-list">
            <button type="button" onClick={() => goToSection("reserva")}>
              <span className="cliente-panel-nav-icon">{icons.reserva}</span>
              Nueva reserva
            </button>

            <button type="button" onClick={() => goToSection("beluers")}>
              <span className="cliente-panel-nav-icon">{icons.beluers}</span>
              Especialistas
            </button>

            <button type="button" onClick={() => goToSection("historial")}>
              <span className="cliente-panel-nav-icon">{icons.historial}</span>
              Historial
            </button>

            <button type="button" onClick={() => goToSection("pagos")}>
              <span className="cliente-panel-nav-icon">{icons.pagos}</span>
              Pagos
            </button>

            <button type="button" onClick={() => goToSection("perfil")}>
              <span className="cliente-panel-nav-icon">{icons.perfil}</span>
              Mi perfil
            </button>
          </div>
        </aside>
      </div>

      <div className="cliente-panel-dashboard-section-heading">
        <span className="cliente-panel-dashboard-kicker">Explora servicios</span>
        <h2>Lashes y nails a domicilio</h2>
        <p>Elige una categoría y agenda cada servicio por separado.</p>
      </div>

      <div className="cliente-panel-dashboard-service-grid">
        <button type="button" onClick={() => goToSection("reserva")}>
          <span>Lashes</span>
          <strong>Pestañas diseñadas para tu estilo</strong>
          <small>Extensiones, lifting y servicios relacionados.</small>
        </button>

        <button type="button" onClick={() => goToSection("reserva")}>
          <span>Nails</span>
          <strong>Manicure y uñas con acabado premium</strong>
          <small>Servicios de uñas coordinados por belu.</small>
        </button>
      </div>
    </section>
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
          <h1>Tu historial</h1>
          <p>Revisa tus servicios anteriores y repite tus reservas favoritas.</p>
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
                  Repetir reserva ✦
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
  const comprobanteMessage =
    "Comprobante disponible cuando se conecte la pasarela de pagos.";

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

            <div className="cliente-panel-pago-actions">
              <button
                type="button"
                className="cliente-panel-btn-ghost"
                onClick={() => alert(comprobanteMessage)}
              >
                Ver comprobante
              </button>

              <button
                type="button"
                className="cliente-panel-btn-ghost"
                onClick={() => alert(comprobanteMessage)}
              >
                Descargar
              </button>
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
  favoritesCount,
}: {
  clientName: string;
  clientProfile: ClientProfile | null;
  bookingCount: number;
  favoritesCount: number;
}) {
  const nombre = clientName;
  const email = clientProfile?.email || "";
  const [whatsapp, setWhatsapp] = useState(clientProfile?.phone || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const distrito = "Miraflores";
  const direccion = "Av. Comandante Espinar 456, Miraflores";
  const [preferencia, setPreferencia] = useState(
    clientProfile?.beauty_preference || "Lashes naturales"
  );
  const notificaciones = true;
  

  const handleGuardarPerfil = async () => {
    setProfileLoading(true);

    const formData = new FormData();
    formData.append("phone", whatsapp);
    formData.append("beautyPreference", preferencia);

    const result = await updateClientProfileAction(formData);

    setProfileLoading(false);
    alert(result.message);
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
              <strong>{bookingCount}</strong>
              <span>Reservas</span>
            </div>

            <div>
              <strong>{favoritesCount}</strong>
              <span>Favoritas</span>
            </div>

            <div>
              <strong>✦</strong>
              <span>belu</span>
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
                disabled
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
              readOnly
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
              disabled
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
            disabled={profileLoading}
          >
            {profileLoading ? "Guardando..." : "Guardar cambios"}
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
        {beluersFiltradas.length === 0 ? (
          <div className="cliente-panel-card">
            <p>Aún no hay especialistas disponibles.</p>
          </div>
        ) : (
          beluersFiltradas.map((beluer) => (
          <BeluerCard
            key={beluer.nombre}
            beluer={beluer}
            esFavorita={favoritas.includes(beluer.nombre)}
            onToggleFavorita={() => onToggleFavorita(beluer.nombre)}
            goToReserva={goToReserva}
          />
          ))
        )}
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
          <h2>Aún no tienes Beluers favoritas.</h2>
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
      <div
        className={`cliente-panel-servicio-thumb cliente-panel-servicio-thumb-${servicio.categoria}`}
        aria-hidden="true"
      >
        <span>foto servicio</span>
      </div>
      <div className="cliente-panel-servicio-card-body">
        <span className="cliente-panel-servicio-category">
          {servicio.categoria === "lashes" ? "Lashes" : "Nails"}
        </span>
        <h4>{servicio.nombre}</h4>
        {servicio.desc ? <p>{servicio.desc}</p> : null}
        <span>S/ {servicio.precio}</span>
        {selected ? (
          <small className="cliente-panel-servicio-selected-label">
            Seleccionado
          </small>
        ) : null}
      </div>
    </button>
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
      <img
        className="cliente-panel-service-compact-image"
        src={servicio.foto}
        alt={servicio.nombre}
      />

      <span className="cliente-panel-service-compact-body">
        <span className="cliente-panel-servicio-category">
          {servicio.categoria === "lashes" ? "Lashes" : "Nails"}
        </span>
        <strong>{servicio.nombre}</strong>
        {servicio.desc ? <small>{servicio.desc}</small> : null}
        <span className="cliente-panel-service-compact-meta">
          <b>S/ {servicio.precio}</b>
          {duration ? <em>{duration}</em> : null}
        </span>
      </span>

      {selected ? <span className="cliente-panel-service-row-check">OK</span> : null}
    </button>
  );
}

function ServiceDetailModal({
  servicio,
  selected,
  onChoose,
  onClose,
}: {
  servicio: Service;
  selected: boolean;
  onChoose: () => void;
  onClose: () => void;
}) {
  const duration = getServiceDuration(servicio);

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
          x
        </button>

        <div className="cliente-panel-service-detail-gallery">
          <img src={servicio.foto} alt={servicio.nombre} />
          <div className="cliente-panel-service-detail-thumbs" aria-hidden="true">
            <span className="active" />
          </div>
        </div>

        <div className="cliente-panel-service-detail-content">
          <span className="cliente-panel-servicio-category">
            {servicio.categoria === "lashes" ? "Lashes" : "Nails"}
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
              Duracion
              <strong>{duration || "Por confirmar"}</strong>
            </span>
          </div>

          <div className="cliente-panel-service-detail-actions">
            <button
              className="cliente-panel-btn-r cliente-panel-full-btn"
              type="button"
              onClick={onChoose}
            >
              Elegir este servicio
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
              Este servicio ya esta seleccionado en tu reserva.
            </small>
          ) : null}
        </div>
      </div>
    </div>
  );
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
