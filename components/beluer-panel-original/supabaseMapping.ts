import type {
  FotoPortafolio,
  IngresoBeluer,
  PerfilBeluer,
  ReservaBeluer,
  ServicioBeluer,
} from "./beluerPanelTypes";

/**
 * Este archivo NO conecta Supabase todavía.
 * Solo documenta cómo los datos mock actuales del panel Beluer
 * se relacionarán con las futuras tablas reales de Supabase.
 */

export const beluerSupabaseTableMap = {
  profile: {
    currentMock: ["perfilInicial"],
    futureTables: ["profiles", "beluer_profiles"],
    purpose:
      "Mostrar y actualizar el perfil público de la Beluer, su bio, experiencia, zonas, estado y disponibilidad.",
  },

  reservations: {
    currentMock: ["reservasIniciales"],
    futureTables: [
      "bookings",
      "booking_services",
      "booking_addons",
      "client_profiles",
      "profiles",
      "payments",
    ],
    purpose:
      "Mostrar reservas asignadas a la Beluer, permitir aceptar/rechazar solicitudes y revisar detalles del servicio.",
  },

  services: {
    currentMock: ["serviciosIniciales"],
    futureTables: ["services", "beluer_services"],
    purpose:
      "Permitir que la Beluer seleccione qué servicios realiza, active/desactive servicios y defina precios propios.",
  },

  portfolio: {
    currentMock: ["fotosPortafolioIniciales"],
    futureTables: ["beluer_photos"],
    futureStorage: ["beluer-portfolio", "beluer-profile-photos"],
    purpose:
      "Gestionar fotos del portafolio, foto de portada y estado de aprobación por admin.",
  },

  earnings: {
    currentMock: ["ingresosIniciales"],
    futureTables: ["beluer_earnings", "bookings", "payments"],
    purpose:
      "Mostrar ingresos brutos, comisión de belu, neto de la Beluer, pagos pendientes y pagos realizados.",
  },

  reviews: {
    currentMock: ["rating simulado en dashboard/perfil"],
    futureTables: ["reviews"],
    purpose:
      "Mostrar reseñas recibidas, rating promedio y comentarios de clientas.",
  },

  availability: {
    currentMock: ["disponibilidadGeneral dentro de perfilInicial"],
    futureTables: ["beluer_availability"],
    purpose:
      "Permitir que la Beluer configure horarios reales de atención por día.",
  },
} as const;

export function mapMockPerfilToSupabaseBeluerProfile(perfil: PerfilBeluer) {
  return {
    public_name: perfil.nombrePublico,
    bio: perfil.bio,
    instagram: perfil.instagram,
    phone: perfil.whatsapp,
    experience_years: perfil.experiencia,
    level: mapBeluerLevelToDatabase(perfil.nivel),
    status: mapBeluerStatusToDatabase(perfil.estado),
    districts: perfil.distritos,
    is_available: perfil.disponibilidadGeneral,
  };
}

export function mapMockReservaToSupabaseBooking(reserva: ReservaBeluer) {
  return {
    id: reserva.id,
    status: mapReservaEstadoToDatabase(reserva.estado),
    scheduled_date: reserva.fecha,
    scheduled_time: reserva.hora,
    district: reserva.distrito,
    address: reserva.direccion,
    instructions: reserva.instrucciones,
    total: reserva.total,
    payment_status: "paid",
    payment_method_snapshot: reserva.metodoPago,
  };
}

export function mapMockServicioToSupabaseBeluerService(
  servicio: ServicioBeluer
) {
  return {
    service_name_snapshot: servicio.nombre,
    category: servicio.categoria,
    price: servicio.precio,
    minimum_price_snapshot: servicio.precioMinimo,
    duration_snapshot: servicio.duracion,
    is_active: servicio.activo,
  };
}

export function mapMockFotoToSupabaseBeluerPhoto(foto: FotoPortafolio) {
  return {
    image_url: foto.imagen,
    category: foto.categoria,
    caption: foto.titulo,
    is_cover: foto.portada,
    is_approved: foto.estado === "aprobada",
  };
}

export function mapMockIngresoToSupabaseBeluerEarning(
  ingreso: IngresoBeluer
) {
  return {
    gross_amount: ingreso.totalServicio,
    platform_commission_amount: ingreso.comisionBelu,
    net_amount: ingreso.netoBeluer,
    payout_status: mapIngresoEstadoToDatabase(ingreso.estadoPago),
    service_name_snapshot: ingreso.servicio,
    client_name_snapshot: ingreso.clienta,
    completed_at: ingreso.fecha,
  };
}

function mapBeluerLevelToDatabase(level: PerfilBeluer["nivel"]) {
  const levels: Record<PerfilBeluer["nivel"], string> = {
    "Beluer Nueva": "nueva",
    "Beluer Verificada": "verificada",
    "Beluer Top ✦": "top",
  };

  return levels[level];
}

function mapBeluerStatusToDatabase(status: PerfilBeluer["estado"]) {
  const statuses: Record<PerfilBeluer["estado"], string> = {
    Activo: "approved",
    "En revisión": "pending_review",
    Pausado: "paused",
  };

  return statuses[status];
}

function mapReservaEstadoToDatabase(estado: ReservaBeluer["estado"]) {
  const estados: Record<ReservaBeluer["estado"], string> = {
    pendiente: "pending_beluer_assignment",
    aceptada: "assigned",
    rechazada: "cancelled",
  };

  return estados[estado];
}

function mapIngresoEstadoToDatabase(estado: IngresoBeluer["estadoPago"]) {
  const estados: Record<IngresoBeluer["estadoPago"], string> = {
    pendiente: "pending",
    pagado: "paid",
    retenido: "held",
  };

  return estados[estado];
}