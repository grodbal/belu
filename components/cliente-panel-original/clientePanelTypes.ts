export type PanelSection =
  | "dashboard"
  | "reserva"
  | "servicios"
  | "beluers"
  | "historial"
  | "pagos"
  | "perfil";

export type ServiceCategory = "lashes" | "nails" | "brows";

export type AssignmentMode = "gestionado" | "libre";

export type Service = {
  id?: string;
  nombre: string;
  precio: number;
  logisticFee?: number;
  desc: string;
  foto: string;
  categoria: ServiceCategory;
  serviceType?: "primary" | "addon";
  durationMinutes?: number | null;
  offers?: ServiceOffer[];
  image_url?: string | null;
  is_featured?: boolean | null;
  gallery_images?: {
    id: string;
    image_url: string;
    sort_order: number;
    created_at?: string;
  }[];
};

export type ServiceOffer = {
  beluerProfileId: string;
  nombre: string;
  foto: string;
  nivel: string;
  rating: string;
  citas: number;
  distritos: string[];
  beluerPrice: number;
};

export type Addon = {
  nombre: string;
  precio: number;
  categoria: ServiceCategory;
};

export type Beluer = {
  id: string;
  nombre: string;
  espec: string;
  categoria: ServiceCategory | "mixta";
  rating: string;
  citas: number;
  foto: string;
  serviciosActivos: string[];
  distritos: string[];
  nivel?: string;
};

export type HistorialItem = {
  id: number;
  servicio: string;
  beluer: string;
  fecha: string;
  hora: string;
  total: number;
  metodo: string;
  rating: number;
  comentario: string;
  foto: string;
  estado: string;
};

export type PagoItem = {
  id: string;
  fecha: string;
  concepto: string;
  metodo: string;
  monto: number;
  estado: string;
  operacion: string;
  beluer: string;
};
