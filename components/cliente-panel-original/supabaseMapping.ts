import type {
  Addon,
  Beluer,
  HistorialItem,
  PagoItem,
  Service,
} from "./clientePanelTypes";

/**
 * Este archivo NO conecta Supabase todavía.
 * Solo documenta cómo los datos mock actuales del panel se relacionarán
 * con las futuras tablas reales de Supabase.
 */

export const supabaseTableMap = {
  services: {
    currentMock: ["catalogoLashes", "catalogoNails"],
    futureTables: ["services", "beluer_services"],
    purpose:
      "Mostrar el catálogo de servicios y los precios individuales por Beluer.",
  },

  addons: {
    currentMock: ["addonsLashes", "addonsNails"],
    futureTables: ["service_addons", "booking_addons"],
    purpose:
      "Mostrar adicionales disponibles y registrar los adicionales seleccionados en cada reserva.",
  },

  beluers: {
    currentMock: ["beluersData"],
    futureTables: [
      "profiles",
      "beluer_profiles",
      "beluer_services",
      "beluer_photos",
      "beluer_availability",
    ],
    purpose:
      "Mostrar especialistas aprobadas, sus servicios, precios, fotos, zonas y disponibilidad.",
  },

  bookings: {
    currentMock: ["estado local en ClientePanelOriginalPage"],
    futureTables: ["bookings", "booking_services", "booking_addons"],
    purpose:
      "Crear reservas reales, guardar servicios seleccionados, add-ons, fecha, hora, dirección, total y estado.",
  },

  payments: {
    currentMock: ["pagosData"],
    futureTables: ["payments"],
    purpose:
      "Registrar pagos reales desde Culqi/Niubiz/Yape/Plin, estado de pago y comprobantes.",
  },

  favorites: {
    currentMock: ["beluersFavoritas"],
    futureTables: ["favorites"],
    purpose:
      "Guardar las Beluers favoritas de cada clienta autenticada.",
  },

  history: {
    currentMock: ["historialData"],
    futureTables: ["bookings", "booking_services", "reviews", "payments"],
    purpose:
      "Mostrar servicios completados, reseñas, Beluer asignada, fecha, total y método de pago.",
  },

  profile: {
    currentMock: ["estado local en PerfilSection"],
    futureTables: ["profiles", "client_profiles"],
    purpose:
      "Leer y actualizar datos personales de la clienta.",
  },

  automations: {
    currentMock: ["sin implementación actual"],
    futureTables: ["automations_log"],
    purpose:
      "Registrar eventos enviados por n8n: reserva creada, recordatorio 24h, reseña 30min y retoque día 21.",
  },
} as const;

export function mapMockServiceToSupabaseService(service: Service) {
  return {
    name: service.nombre,
    category: service.categoria,
    description: service.desc,
    minimum_price: service.precio,
    image_url: service.foto,
    is_active: true,
  };
}

export function mapMockAddonToSupabaseAddon(addon: Addon) {
  return {
    name: addon.nombre,
    category: addon.categoria,
    price: addon.precio,
    is_active: true,
  };
}

export function mapMockBeluerToSupabaseBeluer(beluer: Beluer) {
  return {
    public_name: beluer.nombre,
    bio: beluer.espec,
    profile_photo_url: beluer.foto,
    rating_average: Number(beluer.rating),
    total_bookings: beluer.citas,
    status: "approved",
    level: beluer.rating === "5.0" ? "top" : "verificada",
  };
}

export function mapMockPaymentToSupabasePayment(payment: PagoItem) {
  return {
    provider: "manual",
    method: payment.metodo.toLowerCase(),
    status: payment.estado === "Pagado" ? "paid" : "pending",
    amount: payment.monto,
    currency: "PEN",
    transaction_id: payment.operacion,
  };
}

export function mapMockHistoryToSupabaseBooking(history: HistorialItem) {
  return {
    status: "completed",
    scheduled_date: history.fecha,
    scheduled_time: history.hora,
    total: history.total,
    payment_status: "paid",
  };
}