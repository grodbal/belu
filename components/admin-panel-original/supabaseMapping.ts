import type {
  AdminBeluer,
  AdminFoto,
  AdminPago,
  AdminReserva,
  AdminServicio,
} from "./adminPanelTypes";

/**
 * Este archivo NO conecta Supabase todavía.
 * Solo documenta cómo los datos mock actuales del panel Admin
 * se relacionarán con las futuras tablas reales de Supabase.
 */

export const adminSupabaseTableMap = {
  beluers: {
    currentMock: ["beluersIniciales"],
    futureTables: [
      "profiles",
      "beluer_profiles",
      "beluer_services",
      "beluer_photos",
      "beluer_availability",
      "reviews",
      "bookings",
    ],
    purpose:
      "Gestionar especialistas: aprobar, rechazar, pausar, cambiar nivel y revisar perfil operativo.",
  },

  services: {
    currentMock: ["serviciosIniciales"],
    futureTables: ["services", "service_addons", "beluer_services"],
    purpose:
      "Gestionar catálogo maestro, precios mínimos, duración, categorías y estado activo/inactivo.",
  },

  reservations: {
    currentMock: ["reservasIniciales"],
    futureTables: [
      "bookings",
      "booking_services",
      "booking_addons",
      "client_profiles",
      "beluer_profiles",
      "payments",
      "automations_log",
    ],
    purpose:
      "Supervisar reservas, asignar Beluers, cambiar estados operativos y detectar reservas sin asignación.",
  },

  photos: {
    currentMock: ["fotosIniciales"],
    futureTables: ["beluer_photos"],
    futureStorage: [
      "beluer-portfolio",
      "beluer-profile-photos",
      "service-images",
    ],
    purpose:
      "Validar fotos subidas por Beluers, aprobar/rechazar imágenes y controlar calidad visual del catálogo.",
  },

  payments: {
    currentMock: ["pagosIniciales"],
    futureTables: ["payments", "bookings", "beluer_earnings"],
    purpose:
      "Supervisar pagos, métodos, proveedores, comisiones, netos de Beluers y reembolsos.",
  },

  metrics: {
    currentMock: [
      "serviciosTopIniciales",
      "distritosTopIniciales",
      "semanasIniciales",
    ],
    futureTables: [
      "bookings",
      "payments",
      "beluer_earnings",
      "reviews",
      "automations_log",
      "beluer_profiles",
      "services",
    ],
    purpose:
      "Construir indicadores de rendimiento: ventas, reservas, ticket promedio, demanda por servicio/distrito y recompra.",
  },

  alerts: {
    currentMock: ["adminAlerts"],
    futureTables: [
      "bookings",
      "beluer_profiles",
      "beluer_photos",
      "payments",
      "automations_log",
    ],
    purpose:
      "Generar alertas operativas: reservas sin asignación, fotos pendientes, pagos fallidos y automatizaciones con error.",
  },
} as const;

export function mapMockBeluerToSupabaseBeluerProfile(beluer: AdminBeluer) {
  return {
    public_name: beluer.nombre,
    instagram: beluer.instagram,
    phone: beluer.telefono,
    districts: [beluer.distrito],
    experience_years: beluer.experiencia,
    status: mapBeluerEstadoToDatabase(beluer.estado),
    level: mapBeluerNivelToDatabase(beluer.nivel),
    rating_average: beluer.rating,
    total_bookings: beluer.reservas,
    profile_photo_url: beluer.foto,
    review_notes: beluer.notaRevision,
  };
}

export function mapMockServicioToSupabaseService(servicio: AdminServicio) {
  return {
    name: servicio.nombre,
    category: servicio.categoria,
    description: servicio.descripcion,
    minimum_price: servicio.precioMinimo,
    estimated_duration_minutes: servicio.duracionMinutos,
    is_active: servicio.activo,
  };
}

export function mapMockReservaToSupabaseBooking(reserva: AdminReserva) {
  return {
    id: reserva.id,
    client_name_snapshot: reserva.clienta,
    beluer_name_snapshot: reserva.beluer,
    service_name_snapshot: reserva.servicio,
    addon_names_snapshot: reserva.addons,
    district: reserva.distrito,
    address: reserva.direccion,
    scheduled_date: reserva.fecha,
    scheduled_time: reserva.hora,
    total: reserva.total,
    payment_method_snapshot: reserva.metodoPago,
    status: mapReservaEstadoToDatabase(reserva.estado),
    assignment_mode: reserva.modoAsignacion,
    instructions: reserva.instrucciones,
  };
}

export function mapMockFotoToSupabaseBeluerPhoto(foto: AdminFoto) {
  return {
    beluer_name_snapshot: foto.beluer,
    category: foto.categoria,
    caption: foto.titulo,
    image_url: foto.imagen,
    is_approved: foto.estado === "aprobada",
    moderation_status: mapFotoEstadoToDatabase(foto.estado),
    is_featured: foto.destacada,
    uploaded_at: foto.fechaSubida,
    review_notes: foto.notaRevision,
  };
}

export function mapMockPagoToSupabasePayment(pago: AdminPago) {
  return {
    id: pago.id,
    booking_id: pago.reservaId,
    client_name_snapshot: pago.clienta,
    beluer_name_snapshot: pago.beluer,
    service_name_snapshot: pago.servicio,
    paid_at: pago.fecha,
    method: mapPagoMetodoToDatabase(pago.metodo),
    provider: mapPagoProveedorToDatabase(pago.proveedor),
    status: mapPagoEstadoToDatabase(pago.estado),
    amount: pago.monto,
    currency: "PEN",
    transaction_id: pago.operacion,
  };
}

export function mapMockPagoToSupabaseBeluerEarning(pago: AdminPago) {
  return {
    booking_id: pago.reservaId,
    beluer_name_snapshot: pago.beluer,
    gross_amount: pago.monto,
    platform_commission_amount: pago.comisionBelu,
    net_amount: pago.netoBeluer,
    payout_status:
      pago.estado === "pagado"
        ? "pending"
        : pago.estado === "reembolsado"
          ? "cancelled"
          : "held",
  };
}

function mapBeluerEstadoToDatabase(estado: AdminBeluer["estado"]) {
  const estados: Record<AdminBeluer["estado"], string> = {
    pendiente: "pending_review",
    aprobada: "approved",
    rechazada: "rejected",
    pausada: "paused",
  };

  return estados[estado];
}

function mapBeluerNivelToDatabase(nivel: AdminBeluer["nivel"]) {
  const niveles: Record<AdminBeluer["nivel"], string> = {
    Nueva: "nueva",
    Verificada: "verificada",
    "Top ✦": "top",
  };

  return niveles[nivel];
}

function mapReservaEstadoToDatabase(estado: AdminReserva["estado"]) {
  const estados: Record<AdminReserva["estado"], string> = {
    pendiente_asignacion: "pending_beluer_assignment",
    asignada: "assigned",
    confirmada: "confirmed",
    completada: "completed",
    cancelada: "cancelled",
  };

  return estados[estado];
}

function mapFotoEstadoToDatabase(estado: AdminFoto["estado"]) {
  const estados: Record<AdminFoto["estado"], string> = {
    pendiente: "pending_review",
    aprobada: "approved",
    rechazada: "rejected",
  };

  return estados[estado];
}

function mapPagoEstadoToDatabase(estado: AdminPago["estado"]) {
  const estados: Record<AdminPago["estado"], string> = {
    pagado: "paid",
    pendiente: "pending",
    fallido: "failed",
    reembolsado: "refunded",
  };

  return estados[estado];
}

function mapPagoMetodoToDatabase(metodo: AdminPago["metodo"]) {
  const metodos: Record<AdminPago["metodo"], string> = {
    Yape: "yape",
    Plin: "plin",
    Tarjeta: "card",
  };

  return metodos[metodo];
}

function mapPagoProveedorToDatabase(proveedor: AdminPago["proveedor"]) {
  const proveedores: Record<AdminPago["proveedor"], string> = {
    Culqi: "culqi",
    Niubiz: "niubiz",
    Manual: "manual",
  };

  return proveedores[proveedor];
}