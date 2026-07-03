// ─── MOCK DATA — Prototipo visual Panel Clienta belu ─────────────────────────
// Solo para demo visual. No conectado al backend real.

export type BookingStatus = "confirmed" | "in_progress" | "completed" | "cancelled" | "pending"
export type PaymentStatus = "paid" | "pending" | "refunded" | "failed"

export interface MockService {
  id: string
  name: string
  category: "Lashes" | "Nails"
  shortDescription: string
  description: string
  priceFrom: number
  duration: string
  tag: string
  popular?: boolean
  isNew?: boolean
}

export interface MockBeluer {
  id: string
  name: string
  initials: string
  rating: number
  reviewCount: number
  specialties: string[]
  zones: string[]
  available: boolean
  attended?: boolean
  servicesCount: number
  bio: string
}

export interface MockBooking {
  id: string
  service: string
  serviceCategory: "Lashes" | "Nails"
  beluer: string
  beluerInitials: string
  date: string
  time: string
  address: string
  price: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  isExpress?: boolean
  notes?: string
  createdAt: string
}

export interface MockPayment {
  id: string
  date: string
  service: string
  amount: number
  status: PaymentStatus
  bookingId: string
  receipt?: string
}

// ─── SERVICIOS ────────────────────────────────────────────────────────────────

export const mockServices: MockService[] = [
  {
    id: "svc-1",
    name: "Lifting de Pestanas",
    category: "Lashes",
    shortDescription: "Curvatura natural duradera hasta 8 semanas.",
    description:
      "El lifting de pestanas realza la curvatura natural de tus pestanas sin necesidad de rizador. Dura entre 6 y 8 semanas y es ideal para un look natural y definiido todos los dias.",
    priceFrom: 80,
    duration: "60 min",
    tag: "LASHES",
    popular: true,
  },
  {
    id: "svc-2",
    name: "Extensiones Clasicas",
    category: "Lashes",
    shortDescription: "Extension pelo a pelo para look elegante y natural.",
    description:
      "Las extensiones clasicas se aplican pelo a pelo sobre cada pestana natural. Resultado: look definido, largo y natural. Requieren retoque cada 21 dias para mantener el efecto.",
    priceFrom: 120,
    duration: "90 min",
    tag: "LASHES",
    popular: true,
  },
  {
    id: "svc-3",
    name: "Extensiones Volumen",
    category: "Lashes",
    shortDescription: "Efecto voluminoso y dramatico para maxima presencia.",
    description:
      "Las extensiones en volumen aplican varios pelos ultrafinos sobre cada pestana natural. Resultado: maximo volumen y dramatismo. Perfectas para ocasiones especiales o clientas que buscan presencia.",
    priceFrom: 150,
    duration: "120 min",
    tag: "LASHES",
  },
  {
    id: "svc-4",
    name: "Retoque de Extensiones",
    category: "Lashes",
    shortDescription: "Recarga y relleno para mantener tus extensiones perfectas.",
    description:
      "El retoque de extensiones rellena las pestanas que se cayeron naturalmente. Recomendado cada 21 dias. Mantiene el efecto de las extensiones clasicas o en volumen en su mejor estado.",
    priceFrom: 70,
    duration: "60 min",
    tag: "LASHES",
    isNew: false,
  },
  {
    id: "svc-5",
    name: "Manicure Semipermanente",
    category: "Nails",
    shortDescription: "Color de larga duracion hasta 3 semanas sin astillamientos.",
    description:
      "El manicure semipermanente aplica esmalte de gel curado con lampara UV/LED. Dura hasta 3 semanas sin astillamientos ni descascaramientos. Incluye preparacion de cuticular y forma de una.",
    priceFrom: 55,
    duration: "60 min",
    tag: "NAILS",
    popular: true,
  },
  {
    id: "svc-6",
    name: "Esmaltado Express",
    category: "Nails",
    shortDescription: "Color clasico de rapida aplicacion para resultado inmediato.",
    description:
      "El esmaltado express aplica esmalte convencional en manos o pies. Ideal cuando necesitas un look impecable rapido. Incluye base y top coat para mayor duracion.",
    priceFrom: 35,
    duration: "30 min",
    tag: "NAILS",
    isNew: true,
  },
  {
    id: "svc-7",
    name: "Nail Art Personalizado",
    category: "Nails",
    shortDescription: "Disenos exclusivos creados segun tu estilo.",
    description:
      "Nail art personalizado diseado por tu Beluer segun tu vision. Desde disenos minimalistas hasta detallados. El precio varía segun la complejidad del diseno.",
    priceFrom: 90,
    duration: "90 min",
    tag: "NAILS",
  },
]

// ─── BELUERS ──────────────────────────────────────────────────────────────────

export const mockBeluers: MockBeluer[] = [
  {
    id: "bel-1",
    name: "Valeria Rios",
    initials: "VR",
    rating: 4.9,
    reviewCount: 87,
    specialties: ["Lashes", "Lifting"],
    zones: ["Miraflores", "San Isidro", "Surco"],
    available: true,
    attended: true,
    servicesCount: 142,
    bio: "Especialista en extensiones y lifting de pestanas con 4 anos de experiencia. Me apasiona realzar la belleza natural de cada clienta.",
  },
  {
    id: "bel-2",
    name: "Camila Torres",
    initials: "CT",
    rating: 4.8,
    reviewCount: 65,
    specialties: ["Nails", "Nail Art"],
    zones: ["La Molina", "Surco", "San Borja"],
    available: true,
    attended: false,
    servicesCount: 98,
    bio: "Nailista con enfoque en nail art de precision. Cada diseno es unico y pensado para ti.",
  },
  {
    id: "bel-3",
    name: "Lucia Paredes",
    initials: "LP",
    rating: 4.7,
    reviewCount: 52,
    specialties: ["Lashes", "Volumen"],
    zones: ["Miraflores", "Barranco", "Chorrillos"],
    available: false,
    attended: false,
    servicesCount: 76,
    bio: "Extensionista certificada especializada en volumen ruso y mega volumen. Precision y cuidado en cada sesion.",
  },
  {
    id: "bel-4",
    name: "Sofia Mendez",
    initials: "SM",
    rating: 5.0,
    reviewCount: 34,
    specialties: ["Nails", "Semipermanente"],
    zones: ["San Isidro", "Miraflores", "Lince"],
    available: true,
    attended: false,
    servicesCount: 58,
    bio: "Especialista en manicure semipermanente y cuidado de unas. Resultados que duran semanas.",
  },
  {
    id: "bel-5",
    name: "Andrea Flores",
    initials: "AF",
    rating: 4.6,
    reviewCount: 41,
    specialties: ["Lashes", "Nails"],
    zones: ["Surco", "La Molina", "Ate"],
    available: true,
    attended: false,
    servicesCount: 63,
    bio: "Beluer multidisciplinaria con formacion en lashes y unas. Tu aliada para el look completo.",
  },
]

// ─── RESERVAS ─────────────────────────────────────────────────────────────────

export const mockBookings: MockBooking[] = [
  {
    id: "bk-001",
    service: "Extensiones Clasicas",
    serviceCategory: "Lashes",
    beluer: "Valeria Rios",
    beluerInitials: "VR",
    date: "Vie 11 Jul 2025",
    time: "10:00 AM",
    address: "Jr. Las Flores 234, Miraflores",
    price: 120,
    status: "confirmed",
    paymentStatus: "paid",
    isExpress: false,
    notes: "Prefiero pestanas en estilo Cat Eye.",
    createdAt: "2025-07-05",
  },
  {
    id: "bk-002",
    service: "Manicure Semipermanente",
    serviceCategory: "Nails",
    beluer: "Camila Torres",
    beluerInitials: "CT",
    date: "Lun 23 Jun 2025",
    time: "3:00 PM",
    address: "Jr. Las Flores 234, Miraflores",
    price: 55,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2025-06-18",
  },
  {
    id: "bk-003",
    service: "Retoque de Extensiones",
    serviceCategory: "Lashes",
    beluer: "Valeria Rios",
    beluerInitials: "VR",
    date: "Mar 3 Jun 2025",
    time: "11:00 AM",
    address: "Jr. Las Flores 234, Miraflores",
    price: 70,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2025-05-29",
  },
  {
    id: "bk-004",
    service: "Esmaltado Express",
    serviceCategory: "Nails",
    beluer: "Sofia Mendez",
    beluerInitials: "SM",
    date: "Jue 15 May 2025",
    time: "2:00 PM",
    address: "Jr. Las Flores 234, Miraflores",
    price: 35,
    status: "cancelled",
    paymentStatus: "refunded",
    createdAt: "2025-05-12",
  },
]

// ─── PAGOS ────────────────────────────────────────────────────────────────────

export const mockPayments: MockPayment[] = [
  {
    id: "pay-001",
    date: "Vie 11 Jul 2025",
    service: "Extensiones Clasicas",
    amount: 120,
    status: "paid",
    bookingId: "bk-001",
    receipt: "#REC-20250711-001",
  },
  {
    id: "pay-002",
    date: "Lun 23 Jun 2025",
    service: "Manicure Semipermanente",
    amount: 55,
    status: "paid",
    bookingId: "bk-002",
    receipt: "#REC-20250623-002",
  },
  {
    id: "pay-003",
    date: "Mar 3 Jun 2025",
    service: "Retoque de Extensiones",
    amount: 70,
    status: "paid",
    bookingId: "bk-003",
    receipt: "#REC-20250603-003",
  },
  {
    id: "pay-004",
    date: "Jue 15 May 2025",
    service: "Esmaltado Express",
    amount: 35,
    status: "refunded",
    bookingId: "bk-004",
    receipt: "#REC-20250515-004",
  },
]

// ─── CLIENTA (mock usuario) ───────────────────────────────────────────────────

export const mockClient = {
  name: "Valentina Ramos",
  firstName: "Valentina",
  email: "valentina.ramos@gmail.com",
  phone: "+51 987 654 321",
  address: "Jr. Las Flores 234, Miraflores, Lima",
  initials: "VR",
  bookingCount: mockBookings.filter((b) => b.status === "completed").length,
  favoritesCount: 2,
  nextAppointment: mockBookings[0],
  lastCompletedBooking: mockBookings[1],
  // Calcula si hay retoque pendiente: ultimo servicio Lashes completado fue hace 20 dias (demo)
  showReminderRetoque: true,
  reminderDays: 20,
  reminderService: "Extensiones Clasicas",
}

// ─── FAVORITAS ────────────────────────────────────────────────────────────────

export const mockFavorites: MockBeluer[] = [
  mockBeluers[0], // Valeria Rios
  mockBeluers[1], // Camila Torres
]

// ─── FAQ AYUDA ────────────────────────────────────────────────────────────────

export const mockFaq = [
  {
    q: "Como cancelo una reserva?",
    a: "Puedes cancelar tu reserva hasta 2 horas antes de la cita desde la seccion Mis Citas. Si cancelas con menos de 2 horas, el cobro ya habra sido procesado.",
  },
  {
    q: "Que pasa si la Beluer no llega?",
    a: "Si tu Beluer no llega en los primeros 15 minutos, puedes reportarlo desde la app. Belu te ofrece reagendar sin costo o reembolso completo.",
  },
  {
    q: "Como funcionan los reembolsos?",
    a: "Los reembolsos se procesan en 3-5 dias habiles al metodo de pago original. Recibes confirmacion por email.",
  },
  {
    q: "Cada cuanto debo hacer el retoque de extensiones?",
    a: "El retoque se recomienda cada 21 dias para mantener el efecto de tus extensiones en optimas condiciones.",
  },
  {
    q: "Puedo elegir a mi Beluer?",
    a: "Si, desde la seccion Mis Beluers puedes ver y reservar con Beluers que ya te han atendido o explorar nuevas disponibles en tu zona.",
  },
]
