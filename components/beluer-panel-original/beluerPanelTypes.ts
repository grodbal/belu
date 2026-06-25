export type BeluerSection =
  | "dashboard"
  | "reservas"
  | "servicios"
  | "portafolio"
  | "ingresos"
  | "perfil";

export type ReservaEstado = "pendiente" | "aceptada" | "rechazada";

export type ReservaBeluer = {
  id: string;
  clienta: string;
  servicio: string;
  distrito: string;
  direccion: string;
  fecha: string;
  hora: string;
  total: number;
  estado: ReservaEstado;
  instrucciones: string;
  metodoPago: string;
  publicPrice?: number;
  basePrice?: number;
  logisticFee?: number;
  expressFee?: number;
  pagoServicioBeluer?: number;
  pagoLogisticaBeluer?: number;
  pagoExpressBeluer?: number;
  totalBeluer?: number;
  nivelAplicado?: string | null;
  comisionAplicada?: number | null;
  comisionBelu?: number;
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
  comisionBelu: number;
  netoBeluer: number;
  pagoServicioBeluer?: number;
  pagoLogisticaBeluer?: number;
  pagoExpressBeluer?: number;
  totalBeluer?: number;
  nivelAplicado?: string | null;
  comisionAplicada?: number | null;
  commissionLockedAt?: string | null;
  commissionLockedEvent?: string | null;
  estadoPago: "pendiente" | "pagado" | "retenido";
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
