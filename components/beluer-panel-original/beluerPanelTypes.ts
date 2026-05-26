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