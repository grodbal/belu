export type PanelSection =
  | "dashboard"
  | "reserva"
  | "servicios"
  | "beluers"
  | "historial"
  | "pagos"
  | "perfil";

export type ServiceCategory = "lashes" | "nails";

export type AssignmentMode = "gestionado" | "libre";

export type PaymentMethod = "tarjeta" | "yape" | "plin";

export type Service = {
  id?: string;
  nombre: string;
  precio: number;
  desc: string;
  foto: string;
  categoria: ServiceCategory;
  image_url?: string | null;
  is_featured?: boolean | null;
  gallery_images?: {
    id: string;
    image_url: string;
    sort_order: number;
    created_at?: string;
  }[];
};

export type Addon = {
  nombre: string;
  precio: number;
  categoria: ServiceCategory;
};

export type Beluer = {
  nombre: string;
  espec: string;
  categoria: ServiceCategory | "mixta";
  rating: string;
  citas: number;
  foto: string;
  serviciosActivos: string[];
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
