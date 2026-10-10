export type BeluerSection =
  | "dashboard"
  | "reservas"
  | "servicios"
  | "portafolio"
  | "ingresos"
  | "perfil";

export type ReservaEstado = "pendiente" | "aceptada" | "rechazada";

export type BookingStatus =
  | "pending"
  | "assigned"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "redo_requested"
  | "redo_approved";

export type BookingMode = "managed" | "libre";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type ReservaBeluer = {
  id: string;
  clienta: string;
  servicio: string;
  distrito: string;
  direccion: string;
  fecha: string;
  hora: string;
  total: number | null;
  estado: ReservaEstado;
  status: BookingStatus;
  bookingMode: BookingMode;
  paymentStatus: PaymentStatus;
  instrucciones: string;
  metodoPago: string;
  publicPrice?: number;
  basePrice?: number;
  servicePrice?: number;
  clientTotal?: number;
  logisticFee?: number;
  expressFee?: number;
  pagoServicioBeluer?: number | null;
  pagoLogisticaBeluer?: number | null;
  pagoExpressBeluer?: number | null;
  totalBeluer?: number | null;
  nivelAplicado?: string | null;
  comisionAplicada?: number | null;
  comisionBelu?: number | null;
  commissionLockedAt?: string | null;
  commissionLockedEvent?: string | null;
};

export type ServicioBeluer = {
  id: string;
  nombre: string;
  categoria: "lashes" | "nails" | "brows";
  precio: number;
  precioMinimo: number;
  duracion: string;
  activo: boolean;
};

export type FotoPortafolio = {
  id: string;
  titulo: string;
  categoria: "lashes" | "nails" | "brows";
  imagen: string;
  estado: "aprobada" | "pendiente";
  portada: boolean;
};

export type IngresoBeluer = {
  id: string;
  fecha: string;
  clienta: string;
  servicio: string;
  totalServicio: number;
  comisionBelu: number | null;
  netoBeluer: number | null;
  pagoServicioBeluer?: number | null;
  pagoLogisticaBeluer?: number | null;
  pagoExpressBeluer?: number | null;
  totalBeluer?: number | null;
  nivelAplicado?: string | null;
  comisionAplicada?: number | null;
  commissionLockedAt?: string | null;
  commissionLockedEvent?: string | null;
  bookingStatus: BookingStatus;
  estadoPago: PaymentStatus;
};

export type BeluerPanelProfile = {
  publicName: string;
  firstName: string;
  levelLabel: "Beluer Nueva" | "Beluer Verificada" | "Beluer Top ✦";
  statusLabel: "Activo" | "En revisión" | "Pausado";
  photoUrl: string;
  initials: string;
  rating: number | null;
  instagram: string;
  phone: string;
  bio: string;
  experienceYears: number;
  districts: string[];
  districtsCount: number;
  isAvailable: boolean;
  monthlyIncomeGoal: number;
  weeklyRealizedIncome: number;
  weeklyUncalculatedCompletedCount: number;
  monthlyRealizedIncome: number;
  monthlyUncalculatedCompletedCount: number;
  assignedRequestsCount: number;
  nextConfirmedBooking: ReservaBeluer | null;
  completedBookingsCountThisMonth: number;
};

export type PortfolioReadState = "ready" | "unavailable";

export type BeluerPanelReadState = {
  bookings: "ready" | "unavailable";
  clients: "ready" | "unavailable";
  services: "ready" | "unavailable";
  portfolio: PortfolioReadState;
};

export type PerfilBeluer = {
  nombrePublico: string;
  bio: string;
  instagram: string;
  whatsapp: string;
  experiencia: number;
  nivel: "Beluer Nueva" | "Beluer Verificada" | "Beluer Top ✦";
  estado: "Activo" | "En revisión" | "Pausado";
  distritos: string[];
  disponibilidadGeneral: boolean;
};
