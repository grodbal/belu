import type { Addon, Service } from "./clientePanelTypes";

export function crearPlaceholder(nombre: string, color: string) {
  const encoded = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#${color}"/>
          <stop offset="100%" stop-color="#E60023"/>
        </linearGradient>
      </defs>
      <rect width="400" height="280" rx="28" fill="url(#g)"/>
      <circle cx="65" cy="55" r="28" fill="white" opacity="0.22"/>
      <circle cx="335" cy="225" r="48" fill="white" opacity="0.16"/>
      <text x="200" y="138" font-family="Poppins, Arial, sans-serif" font-size="34" font-weight="800" fill="white" text-anchor="middle">${nombre}</text>
      <text x="200" y="172" font-family="Poppins, Arial, sans-serif" font-size="16" fill="rgba(255,255,255,.9)" text-anchor="middle">belu ✦</text>
    </svg>
  `);

  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}

export const catalogoLashes: Service[] = [
  {
    nombre: "Clásicas",
    precio: 110,
    desc: "Extensiones una a una para un acabado natural.",
    foto: crearPlaceholder("Clásicas", "C2185B"),
    categoria: "lashes",
  },
  {
    nombre: "Efecto Rímel",
    precio: 120,
    desc: "Mayor densidad y oscuridad para una mirada intensa.",
    foto: crearPlaceholder("Efecto Rímel", "AD1457"),
    categoria: "lashes",
  },
  {
    nombre: "Volumen 3D",
    precio: 150,
    desc: "Tres extensiones por pestaña para volumen dramático.",
    foto: crearPlaceholder("Volumen 3D", "880E4F"),
    categoria: "lashes",
  },
  {
    nombre: "Volumen 4D",
    precio: 170,
    desc: "Cuatro extensiones ultrafinas para máximo volumen.",
    foto: crearPlaceholder("Volumen 4D", "6A1B9A"),
    categoria: "lashes",
  },
  {
    nombre: "Mega Volumen 5D",
    precio: 210,
    desc: "Efecto impactante con cinco extensiones por pestaña.",
    foto: crearPlaceholder("Mega 5D", "4A148C"),
    categoria: "lashes",
  },
  {
    nombre: "Efecto Whispy",
    precio: 190,
    desc: "Acabado despuntado y salvaje, muy demandado.",
    foto: crearPlaceholder("Whispy", "7B1FA2"),
    categoria: "lashes",
  },
  {
    nombre: "Efecto Aura",
    precio: 140,
    desc: "Volumen suave con longitud gradual en el centro.",
    foto: crearPlaceholder("Efecto Aura", "E91E63"),
    categoria: "lashes",
  },
  {
    nombre: "Lifting de pestañas",
    precio: 110,
    desc: "Curva y realza tus pestañas naturales sin extensiones.",
    foto: crearPlaceholder("Lifting", "D81B60"),
    categoria: "lashes",
  },
  {
    nombre: "Planchado de cejas",
    precio: 80,
    desc: "Domina las cejas rebeldes con un planchado permanente.",
    foto: crearPlaceholder("Planchado", "C2185B"),
    categoria: "lashes",
  },
];

export const catalogoNails: Service[] = [
  {
    nombre: "Esmaltado Gel",
    precio: 75,
    desc: "Esmalte semipermanente con brillo de gel.",
    foto: crearPlaceholder("Esmalte Gel", "F06292"),
    categoria: "nails",
  },
  {
    nombre: "Rubber",
    precio: 90,
    desc: "Base de caucho flexible y duradera.",
    foto: crearPlaceholder("Rubber", "D81B60"),
    categoria: "nails",
  },
  {
    nombre: "Gel de Construcción",
    precio: 105,
    desc: "Moldeado y extensión con gel estructural.",
    foto: crearPlaceholder("Builder Gel", "C2185B"),
    categoria: "nails",
  },
  {
    nombre: "Acrílicas",
    precio: 135,
    desc: "Uñas esculpidas con polvo acrílico, súper resistentes.",
    foto: crearPlaceholder("Acrílicas", "AD1457"),
    categoria: "nails",
  },
  {
    nombre: "Polygel",
    precio: 135,
    desc: "Híbrido de acrílico y gel, ligero y resistente.",
    foto: crearPlaceholder("Polygel", "880E4F"),
    categoria: "nails",
  },
  {
    nombre: "Softgel",
    precio: 120,
    desc: "Gel suave y flexible, ideal para uñas naturales.",
    foto: crearPlaceholder("Softgel", "E91E63"),
    categoria: "nails",
  },
  {
    nombre: "Manicura Tradicional",
    precio: 60,
    desc: "Cuidado de uñas clásico con esmalte normal.",
    foto: crearPlaceholder("Manicura", "F48FB1"),
    categoria: "nails",
  },
  {
    nombre: "Pedicura Tradicional",
    precio: 60,
    desc: "Cuidado completo de pies con esmalte normal.",
    foto: crearPlaceholder("Pedicura", "F06292"),
    categoria: "nails",
  },
  {
    nombre: "Pedicura Gel",
    precio: 75,
    desc: "Pedicura semipermanente con acabado de gel.",
    foto: crearPlaceholder("Pedi Gel", "D81B60"),
    categoria: "nails",
  },
  {
    nombre: "Acripie",
    precio: 135,
    desc: "Uñas acrílicas solo en los pies, muy duraderas.",
    foto: crearPlaceholder("Acripie", "C2185B"),
    categoria: "nails",
  },
];

export const addonsLashes: Addon[] = [
  { nombre: "Depilación con cera", precio: 35, categoria: "lashes" },
  { nombre: "Depilación con hilo", precio: 35, categoria: "lashes" },
  { nombre: "Depilación con navaja", precio: 25, categoria: "lashes" },
  { nombre: "Retiro de extensiones", precio: 35, categoria: "lashes" },
  { nombre: "Diseño de cejas con henna", precio: 25, categoria: "lashes" },
];

export const addonsNails: Addon[] = [
  { nombre: "Retiro de gel", precio: 25, categoria: "nails" },
  { nombre: "Retiro Rubber/Builder Gel", precio: 30, categoria: "nails" },
  { nombre: "Retiro Acrílico/Polygel", precio: 35, categoria: "nails" },
];
