"use client";

import { useEffect, useMemo, useState } from "react";
import { createBookingAction } from "@/app/actions/client/createBooking";
import { cancelBookingAction } from "@/app/actions/client/cancelBooking";
import { updateClientProfileAction } from "@/app/actions/client/updateClientProfile";
import {
  addonsLashes,
  addonsNails,
  crearPlaceholder,
} from "@/components/cliente-panel-original/clientePanelData";
import type {
  Addon,
  AssignmentMode,
  Beluer,
  GestionReservaModal,
  PanelSection,
  PaymentMethod,
  Service,
  ServiceCategory,
} from "@/components/cliente-panel-original/clientePanelTypes";

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

type ClienteDesignaliPageProps = {
  clientProfile: ClientProfile | null;
  nextBooking: ClientBooking | null;
  bookingHistory: ClientBooking[];
  realBeluers: Beluer[];
  realServices: Service[];
};

type ServiceCatalogFilter = "all" | "featured" | "lashes" | "nails";

// Tipo local para el prototipo Designali que incluye sección de soporte
type DesignaliSection = PanelSection | "soporte";
type ServiceCatalogSection = "featured" | "lashes" | "nails";

// ============================================================
// UTILITY FUNCTIONS (REUTILIZADAS DE ClientePanelOriginalPage)
// ============================================================

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
      timeZone: "America/Lima",
      hour: "2-digit",
      hour12: false,
    }).format(new Date())
  );

  if (limaHour >= 5 && limaHour < 12) return "Buenos días";
  if (limaHour >= 12 && limaHour < 18) return "Buenas tardes";
  return "Buenas noches";
}

// ============================================================
// COMPONENTES DE LA UI
// ============================================================

function Sidebar({
  isOpen,
  onClose,
  activeSection,
  onSelectSection,
  clientProfile,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeSection: DesignaliSection;
  onSelectSection: (section: DesignaliSection) => void;
  clientProfile: ClientProfile | null;
}) {
  const menuItems: { id: DesignaliSection; label: string; icon: string }[] = [
    { id: "dashboard", label: "Inicio", icon: "🏠" },
    { id: "reserva", label: "Nueva Reserva", icon: "✨" },
    { id: "servicios", label: "Servicios", icon: "💅" },
    { id: "historial", label: "Mis Reservas", icon: "📅" },
    { id: "pagos", label: "Pagos", icon: "💳" },
    { id: "perfil", label: "Mi Perfil", icon: "👤" },
    { id: "soporte", label: "Soporte", icon: "💬" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 transform bg-white transition-transform duration-300 ease-in-out lg:static lg:z-0 lg:transform-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-white to-[#F7F3F0] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-[#E8E0E3]">
            <div className="text-2xl font-bold text-[#E60023]">belu</div>
            <p className="text-xs text-neutral-500 mt-1">Panel de cliente</p>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition ${
                  activeSection === item.id
                    ? "bg-[#E60023] text-white shadow-md"
                    : "text-[#1A1A1A] hover:bg-[#FFD6E2]/30"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Profile Footer */}
          <div className="p-4 border-t border-[#E8E0E3] space-y-3">
            {clientProfile && (
              <div className="px-3 py-2 bg-[#FFD6E2]/20 rounded-xl">
                <p className="text-xs text-neutral-500">Logged in as</p>
                <p className="text-sm font-bold text-[#1A1A1A] truncate">
                  {clientProfile.full_name || "Cliente"}
                </p>
              </div>
            )}
            <button className="w-full py-2 px-4 rounded-xl bg-[#F7F3F0] text-sm font-medium text-[#1A1A1A] hover:bg-[#E8E0E3] transition">
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({
  title,
  onOpenSidebar,
  clientProfile,
}: {
  title: string;
  onOpenSidebar: () => void;
  clientProfile: ClientProfile | null;
}) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#E8E0E3]">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 hover:bg-[#F7F3F0] rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E60023] to-[#FFD6E2] flex items-center justify-center text-white font-bold text-sm">
            {clientProfile?.full_name?.charAt(0) || "C"}
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ClienteDesignaliPage({
  clientProfile,
  nextBooking,
  bookingHistory,
  realBeluers,
  realServices,
}: ClienteDesignaliPageProps) {
  const [activeSection, setActiveSection] = useState<DesignaliSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeServiceCategory, setActiveServiceCategory] =
    useState<ServiceCategory>("lashes");
  const [serviceCatalogFilter, setServiceCatalogFilter] =
    useState<ServiceCatalogFilter>("all");
  const [openServiceSections, setOpenServiceSections] = useState<
    Record<ServiceCatalogSection, boolean>
  >(() => {
    const hasFeaturedServices = realServices.some((servicio) =>
      Boolean(servicio.is_featured)
    );
    return {
      featured: hasFeaturedServices,
      lashes: !hasFeaturedServices,
      nails: false,
    };
  });
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
      horaOpciones12.map((timeOption) =>
        getHoraOptionValue(timeOption, meridiem)
      )
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
      ? "Esa hora ya pasó. Elige un horario disponible."
      : selectedDateIsToday
        ? "Solo mostramos horarios disponibles desde ahora."
        : "Elige la hora en formato 12 horas.";

  const goToSection = (section: DesignaliSection) => {
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

  const normalizedServiceSearch = normalizarTexto(serviceSearch);
  const catalogServices = sortServicesForReservation(realServices);
  const filteredCatalogServices = catalogServices.filter((servicio) => {
    if (serviceCatalogFilter === "featured" && !servicio.is_featured) {
      return false;
    }
    if (
      (serviceCatalogFilter === "lashes" || serviceCatalogFilter === "nails") &&
      servicio.categoria !== serviceCatalogFilter
    ) {
      return false;
    }
    if (!normalizedServiceSearch) return true;
    return normalizarTexto(
      `${servicio.nombre} ${servicio.desc} ${servicio.categoria}`
    ).includes(normalizedServiceSearch);
  });

  const getSelectedServiceForCategory = (category: ServiceCategory) =>
    category === "lashes" ? servicioLashes : servicioNails;

  const allCatalogSections: {
    id: ServiceCatalogSection;
    title: string;
    services: Service[];
  }[] = [
    {
      id: "featured",
      title: "Destacados ✦",
      services: filteredCatalogServices.filter((servicio) =>
        Boolean(servicio.is_featured)
      ),
    },
    {
      id: "lashes",
      title: "Lashes",
      services: filteredCatalogServices.filter(
        (servicio) => servicio.categoria === "lashes"
      ),
    },
    {
      id: "nails",
      title: "Nails",
      services: filteredCatalogServices.filter(
        (servicio) => servicio.categoria === "nails"
      ),
    },
  ];

  const catalogSections = allCatalogSections.filter((section) => {
    if (section.services.length === 0) return false;
    if (serviceCatalogFilter === "featured") return section.id === "featured";
    if (serviceCatalogFilter === "lashes") return section.id === "lashes";
    if (serviceCatalogFilter === "nails") return section.id === "nails";
    return true;
  });

  const toggleServiceSection = (section: ServiceCatalogSection) => {
    setOpenServiceSections((currentSections) => ({
      ...currentSections,
      [section]: !currentSections[section],
    }));
  };

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
    if (
      selectedTimeHasPassed &&
      nextAvailableTime &&
      nextAvailableTime !== hora
    ) {
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
  const recargoExpress =
    urgencia && serviciosSeleccionados.length > 0 ? 20 : 0;
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
    setActiveServiceCategory(servicio.categoria);

    if (servicio.categoria === "lashes") {
      setServicioLashes(servicio);
      setServicioNails(null);
    }

    if (servicio.categoria === "nails") {
      setServicioNails(servicio);
      setServicioLashes(null);
    }

    setAddonsSeleccionados([]);
    setBeluerSeleccionada("");
  };

  const handleChooseServiceFromDetail = (servicio: Service) => {
    handleServicioClick(servicio);
    setServiceDetail(null);
  };

  const selectServiceForBooking = (servicio: Service) => {
    handleServicioClick(servicio);
    setServiceDetail(null);
    setActiveSection("reserva");
    setSidebarOpen(false);
  };

  const handleConfirmarReserva = () => {
    if (serviciosSeleccionados.length === 0) {
      alert("Selecciona al menos un servicio.");
      return;
    }

    if (serviciosSeleccionados.length > 1) {
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
      alert(result.message || "Error al cancelar.");
      return;
    }

    setReservaConfirmada(false);
    setModalGestion(null);
    alert("Tu reserva ha sido cancelada.");
  };

  // Render sections
  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardSection
            clientProfile={clientProfile}
            nextBooking={nextBooking}
            bookingHistory={bookingHistory}
            onSelectSection={goToSection}
          />
        );
      case "reserva":
        return (
          <ReservaSection
            serviciosSeleccionados={serviciosSeleccionados}
            servicioLashes={servicioLashes}
            servicioNails={servicioNails}
            realServices={realServices}
            handleServicioClick={handleServicioClick}
            setServiceDetail={setServiceDetail}
            serviceDetail={serviceDetail}
            fecha={fecha}
            setFecha={setFecha}
            hora={hora}
            setHora={setHora}
            horaOpciones24={horaOpciones24}
            horaPicker={horaPicker}
            meridiemOptions={meridiemOptions}
            getHoraOptionDisabled={getHoraOptionDisabled}
            getMeridiemDisabled={getMeridiemDisabled}
            horaHelpText={horaHelpText}
            direccionReserva={direccionReserva}
            setDireccionReserva={setDireccionReserva}
            distritoReserva={distritoReserva}
            setDistritoReserva={setDistritoReserva}
            distritoSugerencias={distritoSugerencias}
            notasReserva={notasReserva}
            setNotasReserva={setNotasReserva}
            urgencia={urgencia}
            setUrgencia={setUrgencia}
            modoAsignacion={modoAsignacion}
            setModoAsignacion={setModoAsignacion}
            beluerSeleccionada={beluerSeleccionada}
            setBeluerSeleccionada={setBeluerSeleccionada}
            beluersDisponibles={beluersDisponibles}
            totalServicios={totalServicios}
            totalAddons={totalAddons}
            cargoLogistico={cargoLogistico}
            recargoExpress={recargoExpress}
            total={total}
            handleConfirmarReserva={handleConfirmarReserva}
            pagoOpen={pagoOpen}
            setPagoOpen={setPagoOpen}
            metodoPago={metodoPago}
            setMetodoPago={setMetodoPago}
            handleConfirmarPago={handleConfirmarPago}
            bookingLoading={bookingLoading}
            confirmacionOpen={confirmacionOpen}
            handleIrDashboard={handleIrDashboard}
          />
        );
      case "servicios":
        return (
          <ServiciosSection
            realServices={realServices}
            servicioLashes={servicioLashes}
            servicioNails={servicioNails}
            serviceDetail={serviceDetail}
            setServiceDetail={setServiceDetail}
            selectServiceForBooking={selectServiceForBooking}
            handleChooseServiceFromDetail={handleChooseServiceFromDetail}
            setActiveServiceCategory={setActiveServiceCategory}
            setServiceCatalogFilter={setServiceCatalogFilter}
            serviceCatalogFilter={serviceCatalogFilter}
            catalogSections={catalogSections}
            openServiceSections={openServiceSections}
            toggleServiceSection={toggleServiceSection}
            serviceSearch={serviceSearch}
            setServiceSearch={setServiceSearch}
          />
        );
      case "historial":
        return <HistorialSection bookingHistory={bookingHistory} />;
      case "pagos":
        return <PagosSection bookingHistory={bookingHistory} />;
      case "perfil":
        return (
          <PerfilSection
            clientProfile={clientProfile}
            updateClientProfileAction={updateClientProfileAction}
          />
        );
      case "soporte":
        return <SoporteSection />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#FFFFFF]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        onSelectSection={goToSection}
        clientProfile={clientProfile}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={
            activeSection === "dashboard"
              ? "Inicio"
              : activeSection === "reserva"
                ? "Nueva Reserva"
                : activeSection === "servicios"
                  ? "Servicios"
                  : activeSection === "historial"
                    ? "Mis Reservas"
                    : activeSection === "pagos"
                      ? "Pagos"
                      : activeSection === "perfil"
                        ? "Mi Perfil"
                        : "Soporte"
          }
          onOpenSidebar={() => setSidebarOpen(true)}
          clientProfile={clientProfile}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================
// SECTION COMPONENTS
// ============================================================

function DashboardSection({
  clientProfile,
  nextBooking,
  bookingHistory,
  onSelectSection,
}: {
  clientProfile: ClientProfile | null;
  nextBooking: ClientBooking | null;
  bookingHistory: ClientBooking[];
  onSelectSection: (section: PanelSection) => void;
}) {
  const greeting = getLimaGreeting();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#E60023] to-[#FFD6E2] rounded-3xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">
          {greeting}, {clientProfile?.full_name?.split(" ")[0] || "Cliente"}!
        </h2>
        <p className="text-white/90">Bienvenida a tu panel de belleza a domicilio</p>
      </div>

      {/* Next Booking Banner */}
      {nextBooking ? (
        <div className="bg-white border-2 border-[#E60023] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[#E60023] mb-4">✦ Próxima cita</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Servicio</p>
              <p className="font-bold text-[#1A1A1A]">
                {nextBooking.services?.name || "Servicio"}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Fecha</p>
              <p className="font-bold text-[#1A1A1A]">
                {formatDisplayDate(nextBooking.scheduled_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Hora</p>
              <p className="font-bold text-[#1A1A1A]">
                {formatDisplayTime(nextBooking.scheduled_time)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Estado</p>
              <p className="font-bold text-[#1A1A1A]">
                {nextBooking.status === "pending"
                  ? "Pendiente"
                  : nextBooking.status === "assigned"
                    ? "Asignada"
                    : "Confirmada"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFD6E2]/30 border-2 border-[#FFD6E2] rounded-2xl p-6 text-center">
          <p className="text-[#1A1A1A] font-bold mb-4">No tienes próxima cita</p>
          <button
            onClick={() => onSelectSection("reserva")}
            className="bg-[#E60023] text-white px-6 py-2 rounded-full font-bold hover:bg-[#C4001D] transition"
          >
            Reservar ahora
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => onSelectSection("reserva")}
          className="bg-[#E60023] text-white rounded-2xl p-6 text-center hover:bg-[#C4001D] transition"
        >
          <p className="text-2xl mb-2">✨</p>
          <p className="font-bold text-sm">Nueva Reserva</p>
        </button>
        <button
          onClick={() => onSelectSection("servicios")}
          className="bg-[#FFD6E2] text-[#1A1A1A] rounded-2xl p-6 text-center hover:bg-[#FFD6E2]/80 transition"
        >
          <p className="text-2xl mb-2">💅</p>
          <p className="font-bold text-sm">Servicios</p>
        </button>
        <button
          onClick={() => onSelectSection("historial")}
          className="bg-[#F7F3F0] text-[#1A1A1A] rounded-2xl p-6 text-center hover:bg-[#E8E0E3] transition"
        >
          <p className="text-2xl mb-2">📅</p>
          <p className="font-bold text-sm">Mis Reservas</p>
        </button>
        <button
          onClick={() => onSelectSection("pagos")}
          className="bg-[#F7F3F0] text-[#1A1A1A] rounded-2xl p-6 text-center hover:bg-[#E8E0E3] transition"
        >
          <p className="text-2xl mb-2">💳</p>
          <p className="font-bold text-sm">Pagos</p>
        </button>
      </div>

      {/* Recent Bookings */}
      {bookingHistory.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-[#E8E0E3]">
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Reservas recientes</h3>
          <div className="space-y-3">
            {bookingHistory.slice(0, 3).map((booking) => (
              <div
                key={booking.id}
                className="flex items-between justify-between p-3 bg-[#F7F3F0] rounded-xl"
              >
                <div>
                  <p className="font-bold text-sm text-[#1A1A1A]">
                    {booking.services?.name || "Servicio"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatDisplayDate(booking.scheduled_date)}
                  </p>
                </div>
                <p className="font-bold text-sm text-[#E60023]">
                  {formatSoles(getClientBookingTotal(booking).total)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReservaSection(props: any) {
  const {
    serviciosSeleccionados,
    servicioLashes,
    servicioNails,
    realServices,
    handleServicioClick,
    setServiceDetail,
    serviceDetail,
    fecha,
    setFecha,
    hora,
    setHora,
    horaOpciones24,
    horaPicker,
    meridiemOptions,
    getHoraOptionDisabled,
    getMeridiemDisabled,
    horaHelpText,
    direccionReserva,
    setDireccionReserva,
    distritoReserva,
    setDistritoReserva,
    distritoSugerencias,
    notasReserva,
    setNotasReserva,
    urgencia,
    setUrgencia,
    modoAsignacion,
    setModoAsignacion,
    beluerSeleccionada,
    setBeluerSeleccionada,
    beluersDisponibles,
    totalServicios,
    totalAddons,
    cargoLogistico,
    recargoExpress,
    total,
    handleConfirmarReserva,
    pagoOpen,
    setPagoOpen,
    metodoPago,
    setMetodoPago,
    handleConfirmarPago,
    bookingLoading,
    confirmacionOpen,
    handleIrDashboard,
  } = props;
  return (
    <div className="space-y-6">
      {/* Service Selection */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E0E3]">
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Selecciona tus servicios</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lashes */}
          <div>
            <p className="text-sm font-bold text-neutral-600 mb-3">Lashes</p>
            <div className="space-y-2">
              {realServices
                .filter((s: Service) => s.categoria === "lashes")
                .map((service: Service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServicioClick(service)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition ${
                      servicioLashes?.id === service.id
                        ? "border-[#E60023] bg-[#FFD6E2]/20"
                        : "border-[#E8E0E3] hover:border-[#FFD6E2]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-[#1A1A1A]">
                          {service.nombre}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {service.desc}
                        </p>
                      </div>
                      <p className="font-bold text-sm text-[#E60023]">
                        {formatSoles(service.precio)}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Nails */}
          <div>
            <p className="text-sm font-bold text-neutral-600 mb-3">Nails</p>
            <div className="space-y-2">
              {realServices
                .filter((s: Service) => s.categoria === "nails")
                .map((service: Service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServicioClick(service)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition ${
                      servicioNails?.id === service.id
                        ? "border-[#E60023] bg-[#FFD6E2]/20"
                        : "border-[#E8E0E3] hover:border-[#FFD6E2]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-[#1A1A1A]">
                          {service.nombre}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {service.desc}
                        </p>
                      </div>
                      <p className="font-bold text-sm text-[#E60023]">
                        {formatSoles(service.precio)}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {serviciosSeleccionados.length > 0 && (
        <>
          {/* Datetime and Address */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0E3] space-y-4">
            <h3 className="text-lg font-bold text-[#1A1A1A]">Fecha y hora</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-[#1A1A1A]">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full mt-2 px-4 py-2 border border-[#E8E0E3] rounded-xl focus:border-[#E60023] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#1A1A1A]">Hora</label>
                <div className="flex gap-2 mt-2">
                  <select
                    value={horaPicker.time12}
                    onChange={(e) => {
                      const newTime = toTwentyFourHourTime(
                        e.target.value,
                        horaPicker.meridiem
                      );
                      setHora(newTime);
                    }}
                    className="flex-1 px-4 py-2 border border-[#E8E0E3] rounded-xl focus:border-[#E60023] focus:outline-none"
                  >
                    {["12:00", "12:30", "1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30", "5:00", "5:30", "6:00", "6:30", "7:00", "7:30", "8:00", "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30"].map(
                      (time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      )
                    )}
                  </select>
                  <select
                    value={horaPicker.meridiem}
                    onChange={(e) => {
                      const newTime = toTwentyFourHourTime(
                        horaPicker.time12,
                        e.target.value
                      );
                      setHora(newTime);
                    }}
                    className="w-20 px-4 py-2 border border-[#E8E0E3] rounded-xl focus:border-[#E60023] focus:outline-none"
                  >
                    {meridiemOptions.map((meridiem: string) => (
                      <option key={meridiem} value={meridiem}>
                        {meridiem}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-neutral-500 mt-2">{horaHelpText}</p>
              </div>
            </div>
          </div>

          {/* Address and Distrito */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0E3] space-y-4">
            <h3 className="text-lg font-bold text-[#1A1A1A]">Ubicación</h3>

            <div>
              <label className="text-sm font-bold text-[#1A1A1A]">Distrito</label>
              <select
                value={distritoReserva}
                onChange={(e) => setDistritoReserva(e.target.value)}
                className="w-full mt-2 px-4 py-2 border border-[#E8E0E3] rounded-xl focus:border-[#E60023] focus:outline-none"
              >
                {distritoSugerencias.map((distrito: string) => (
                  <option key={distrito} value={distrito}>
                    {distrito}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-[#1A1A1A]">Dirección</label>
              <input
                type="text"
                value={direccionReserva}
                onChange={(e) => setDireccionReserva(e.target.value)}
                placeholder="Av. / Calle / Número / Referencia"
                className="w-full mt-2 px-4 py-2 border border-[#E8E0E3] rounded-xl focus:border-[#E60023] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[#1A1A1A]">Notas (opcional)</label>
              <textarea
                value={notasReserva}
                onChange={(e) => setNotasReserva(e.target.value)}
                placeholder="Ej: Tengo estacionamiento, entrar por recepción..."
                className="w-full mt-2 px-4 py-2 border border-[#E8E0E3] rounded-xl focus:border-[#E60023] focus:outline-none resize-none h-24"
              />
            </div>
          </div>

          {/* Express */}
          <div className="bg-[#FFD6E2]/20 border-2 border-[#FFD6E2] rounded-2xl p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={urgencia}
                onChange={(e) => setUrgencia(e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="font-bold text-[#1A1A1A]">belu Express</p>
                <p className="text-xs text-neutral-600 mt-1">
                  Reserva urgente. Agrega S/ 20 para la Beluer que acepte el servicio.
                </p>
              </div>
            </label>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0E3] space-y-3">
            <h3 className="text-lg font-bold text-[#1A1A1A]">Resumen</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <p>Servicio(s)</p>
                <p className="font-bold">{formatSoles(totalServicios)}</p>
              </div>
              {cargoLogistico > 0 && (
                <div className="flex justify-between">
                  <p>Cargo logístico</p>
                  <p className="font-bold">{formatSoles(cargoLogistico)}</p>
                </div>
              )}
              {urgencia && (
                <div className="flex justify-between text-[#E60023]">
                  <p>Recargo Express</p>
                  <p className="font-bold">{formatSoles(recargoExpress)}</p>
                </div>
              )}
              <div className="border-t border-[#E8E0E3] pt-2 flex justify-between font-bold text-[#E60023]">
                <p>Total</p>
                <p>{formatSoles(total)}</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleConfirmarReserva}
            className="w-full bg-[#E60023] text-white py-4 rounded-full font-bold hover:bg-[#C4001D] transition"
          >
            Continuar a pago
          </button>

          {/* Payment Modal */}
          {pagoOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 w-full md:w-96 md:rounded-2xl">
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Método de pago</h3>

                <div className="space-y-3 mb-6">
                  {["tarjeta", "yape", "plin"].map((method: string) => (
                    <button
                      key={method}
                      onClick={() => setMetodoPago(method as PaymentMethod)}
                      className={`w-full p-4 border-2 rounded-xl text-left font-bold transition ${
                        metodoPago === method
                          ? "border-[#E60023] bg-[#FFD6E2]/20"
                          : "border-[#E8E0E3]"
                      }`}
                    >
                      {method === "tarjeta"
                        ? "💳 Tarjeta de crédito/débito"
                        : method === "yape"
                          ? "📱 Yape"
                          : "📱 Plin"}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleConfirmarPago}
                    disabled={bookingLoading}
                    className="w-full bg-[#E60023] text-white py-3 rounded-full font-bold hover:bg-[#C4001D] transition disabled:opacity-60"
                  >
                    {bookingLoading ? "Procesando..." : "Confirmar pago"}
                  </button>
                  <button
                    onClick={() => setPagoOpen(false)}
                    className="w-full bg-[#F7F3F0] text-[#1A1A1A] py-3 rounded-full font-bold hover:bg-[#E8E0E3] transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          {confirmacionOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 w-full md:w-96 text-center">
                <p className="text-4xl mb-4">✓</p>
                <h3 className="text-2xl font-bold text-[#E60023] mb-2">
                  ¡Reserva confirmada!
                </h3>
                <p className="text-neutral-600 mb-6">
                  Tu reserva ha sido creada. Te contactaremos pronto con los detalles.
                </p>
                <button
                  onClick={handleIrDashboard}
                  className="w-full bg-[#E60023] text-white py-3 rounded-full font-bold hover:bg-[#C4001D] transition"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ServiciosSection({
  realServices,
  servicioLashes,
  servicioNails,
  serviceDetail,
  setServiceDetail,
  selectServiceForBooking,
  handleChooseServiceFromDetail,
  setActiveServiceCategory,
  setServiceCatalogFilter,
  serviceCatalogFilter,
  catalogSections,
  openServiceSections,
  toggleServiceSection,
  serviceSearch,
  setServiceSearch,
}: any) {
  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          value={serviceSearch}
          onChange={(e) => setServiceSearch(e.target.value)}
          placeholder="Buscar servicio..."
          className="flex-1 min-w-[200px] px-4 py-2 border border-[#E8E0E3] rounded-full focus:border-[#E60023] focus:outline-none"
        />
        <button
          onClick={() => setServiceCatalogFilter("all")}
          className={`px-4 py-2 rounded-full font-bold transition ${
            serviceCatalogFilter === "all"
              ? "bg-[#E60023] text-white"
              : "bg-[#F7F3F0] text-[#1A1A1A] hover:bg-[#E8E0E3]"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setServiceCatalogFilter("lashes")}
          className={`px-4 py-2 rounded-full font-bold transition ${
            serviceCatalogFilter === "lashes"
              ? "bg-[#E60023] text-white"
              : "bg-[#F7F3F0] text-[#1A1A1A] hover:bg-[#E8E0E3]"
          }`}
        >
          Lashes
        </button>
        <button
          onClick={() => setServiceCatalogFilter("nails")}
          className={`px-4 py-2 rounded-full font-bold transition ${
            serviceCatalogFilter === "nails"
              ? "bg-[#E60023] text-white"
              : "bg-[#F7F3F0] text-[#1A1A1A] hover:bg-[#E8E0E3]"
          }`}
        >
          Nails
        </button>
      </div>

      {/* Services Grid */}
      {catalogSections.map((section: any) => (
        <div key={section.id}>
          <button
            onClick={() => toggleServiceSection(section.id)}
            className="flex items-center gap-2 mb-4 font-bold text-[#1A1A1A]"
          >
            <span>{openServiceSections[section.id] ? "▼" : "▶"}</span>
            <span>{section.title}</span>
          </button>

          {openServiceSections[section.id] && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.services.map((service: Service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#E8E0E3] hover:border-[#E60023] transition cursor-pointer"
                  onClick={() => setServiceDetail(service)}
                >
                  <div className="aspect-video bg-[#F7F3F0] overflow-hidden">
                    <img
                      src={service.foto}
                      alt={service.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-[#1A1A1A]">{service.nombre}</p>
                    <p className="text-xs text-neutral-500 mt-1">{service.desc}</p>
                    <p className="font-bold text-[#E60023] mt-3">{formatSoles(service.precio)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Service Detail Modal */}
      {serviceDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full md:w-full md:max-w-2xl md:rounded-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 space-y-4">
              <button
                onClick={() => setServiceDetail(null)}
                className="ml-auto block text-2xl"
              >
                ✕
              </button>

              <img
                src={serviceDetail.foto}
                alt={serviceDetail.nombre}
                className="w-full aspect-video object-cover rounded-xl"
              />

              <div>
                <p className="text-sm text-neutral-500">{serviceDetail.categoria}</p>
                <h3 className="text-2xl font-bold text-[#1A1A1A]">
                  {serviceDetail.nombre}
                </h3>
                <p className="text-[#E60023] font-bold text-xl mt-2">
                  {formatSoles(serviceDetail.precio)}
                </p>
              </div>

              <p className="text-neutral-700">{serviceDetail.desc}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleChooseServiceFromDetail(serviceDetail)}
                  className="flex-1 bg-[#FFD6E2] text-[#1A1A1A] py-3 rounded-full font-bold hover:bg-[#FFD6E2]/80 transition"
                >
                  Seleccionar servicio
                </button>
                <button
                  onClick={() => selectServiceForBooking(serviceDetail)}
                  className="flex-1 bg-[#E60023] text-white py-3 rounded-full font-bold hover:bg-[#C4001D] transition"
                >
                  Reservar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HistorialSection({
  bookingHistory,
}: {
  bookingHistory: ClientBooking[];
}) {
  if (bookingHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl mb-2">📅</p>
        <p className="text-neutral-600">No tienes reservas aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookingHistory.map((booking) => (
        <div
          key={booking.id}
          className="bg-white rounded-2xl p-6 border border-[#E8E0E3]"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Servicio</p>
              <p className="font-bold text-[#1A1A1A]">
                {booking.services?.name || "Servicio"}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Fecha</p>
              <p className="font-bold text-[#1A1A1A]">
                {formatDisplayDate(booking.scheduled_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Total</p>
              <p className="font-bold text-[#E60023]">
                {formatSoles(getClientBookingTotal(booking).total)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Estado</p>
              <p className="font-bold text-[#1A1A1A]">
                {booking.payment_status === "paid" ? "✓ Pagado" : "Pendiente"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PagosSection({
  bookingHistory,
}: {
  bookingHistory: ClientBooking[];
}) {
  const paidBookings = bookingHistory.filter(
    (b) => b.payment_status === "paid"
  );

  return (
    <div className="space-y-6">
      {paidBookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-2xl mb-2">💳</p>
          <p className="text-neutral-600">No hay pagos registrados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paidBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl p-6 border border-[#E8E0E3]"
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Servicio</p>
                  <p className="font-bold text-sm text-[#1A1A1A]">
                    {booking.services?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Fecha</p>
                  <p className="font-bold text-sm text-[#1A1A1A]">
                    {formatDisplayDate(booking.scheduled_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Monto</p>
                  <p className="font-bold text-sm text-[#E60023]">
                    {formatSoles(booking.public_price)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Método</p>
                  <p className="font-bold text-sm text-[#1A1A1A]">
                    {booking.payment_status === "paid" ? "✓ Pagado" : "Pendiente"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Total</p>
                  <p className="font-bold text-sm text-[#1A1A1A]">
                    {formatSoles(getClientBookingTotal(booking).total)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PerfilSection({
  clientProfile,
  updateClientProfileAction,
}: {
  clientProfile: ClientProfile | null;
  updateClientProfileAction: any;
}) {
  const [fullName, setFullName] = useState(clientProfile?.full_name || "");
  const [email, setEmail] = useState(clientProfile?.email || "");
  const [phone, setPhone] = useState(clientProfile?.phone || "");
  const [beautyPreference, setBeautyPreference] = useState(
    clientProfile?.beauty_preference || ""
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const formData = new FormData();
    formData.append("profileId", clientProfile?.id || "");
    formData.append("full_name", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("beauty_preference", beautyPreference);

    await updateClientProfileAction(formData);
    setSaving(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#E8E0E3] space-y-4">
        <h3 className="text-lg font-bold text-[#1A1A1A]">Información personal</h3>

        <div>
          <label className="text-sm font-bold text-[#1A1A1A]">Nombre</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full mt-2 px-4 py-2 border border-[#E8E0E3] rounded-xl focus:border-[#E60023] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-[#1A1A1A]">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-2 px-4 py-2 border border-[#E8E0E3] rounded-xl focus:border-[#E60023] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-[#1A1A1A]">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full mt-2 px-4 py-2 border border-[#E8E0E3] rounded-xl focus:border-[#E60023] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-[#1A1A1A]">
            Preferencia de belleza
          </label>
          <select
            value={beautyPreference}
            onChange={(e) => setBeautyPreference(e.target.value)}
            className="w-full mt-2 px-4 py-2 border border-[#E8E0E3] rounded-xl focus:border-[#E60023] focus:outline-none"
          >
            <option value="">Sin preferencia</option>
            <option value="lashes">Lashes</option>
            <option value="nails">Nails</option>
            <option value="both">Ambas</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#E60023] text-white py-3 rounded-full font-bold hover:bg-[#C4001D] transition disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

function SoporteSection() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-gradient-to-r from-[#E60023] to-[#FFD6E2] rounded-3xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">¿Necesitas ayuda con tu reserva?</h2>
        <p className="text-base">Revisa el detalle de tu reserva para encontrar las opciones de asistencia disponibles.</p>
      </div>
    </div>
  );
}
