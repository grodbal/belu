export type AdminSection =
  | "dashboard"
  | "beluers"
  | "registrar-beluer"
  | "servicios"
  | "reservas"
  | "pagos"
  | "fotos"
  | "metricas";

export type AdminBeluerEstado =
  | "pendiente"
  | "aprobada"
  | "rechazada"
  | "pausada";

export type AdminBeluerNivel = "Nueva" | "Verificada" | "Top ✦";

export type AdminBeluer = {
  id: string;
  nombre: string;
  instagram: string;
  telefono: string;
  distrito: string;
  servicios: string[];
  experiencia: number;
  estado: AdminBeluerEstado;
  nivel: AdminBeluerNivel;
  rating: number;
  reservas: number;
  foto: string;
  notaRevision: string;
};

export type AdminServicioCategoria = "lashes" | "nails" | "brows" | "addon";

export type AdminServicio = {
  id: string;
  nombre: string;
  categoria: AdminServicioCategoria;
  descripcion: string;
  precioMinimo: number;
  duracionMinutos: number;
  activo: boolean;
};

export type AdminReservaEstado =
  | "pendiente_asignacion"
  | "asignada"
  | "confirmada"
  | "completada"
  | "cancelada";

export type AdminReserva = {
  id: string;
  clienta: string;
  beluer: string | null;
  servicio: string;
  addons: string[];
  distrito: string;
  direccion: string;
  fecha: string;
  hora: string;
  total: number;
  metodoPago: "Yape" | "Plin" | "Tarjeta";
  estado: AdminReservaEstado;
  modoAsignacion: "gestionado" | "libre";
  instrucciones: string;
};

export type AdminFotoEstado = "pendiente" | "aprobada" | "rechazada";

export type AdminFotoCategoria = "lashes" | "nails" | "brows";

export type AdminFoto = {
  id: string;
  beluer: string;
  categoria: AdminFotoCategoria;
  titulo: string;
  imagen: string;
  estado: AdminFotoEstado;
  destacada: boolean;
  fechaSubida: string;
  notaRevision: string;
};

export type AdminPagoEstado =
  | "pagado"
  | "pendiente"
  | "fallido"
  | "reembolsado";

export type AdminPagoMetodo = "Yape" | "Plin" | "Tarjeta";

export type AdminPagoProveedor = "Culqi" | "Niubiz" | "Manual";

export type AdminPago = {
  id: string;
  reservaId: string;
  clienta: string;
  beluer: string;
  servicio: string;
  fecha: string;
  metodo: AdminPagoMetodo;
  proveedor: AdminPagoProveedor;
  estado: AdminPagoEstado;
  monto: number;
  comisionBelu: number;
  netoBeluer: number;
  operacion: string;
};

export type AdminMetricaServicio = {
  nombre: string;
  categoria: "lashes" | "nails" | "brows";
  reservas: number;
  ingresos: number;
};

export type AdminMetricaDistrito = {
  distrito: string;
  reservas: number;
  ingresos: number;
};

export type AdminMetricaSemana = {
  semana: string;
  reservas: number;
  ingresos: number;
};

export type AdminAlert = {
  title: string;
  text: string;
  action: string;
  section: AdminSection;
};