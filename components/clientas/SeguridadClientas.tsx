const puntosSeguridad = [
  {
    titulo: "Beluers verificadas",
    descripcion:
      "Revisamos el perfil, experiencia, portafolio y zona de atención antes de aprobar a una especialista dentro de belu.",
  },
  {
    titulo: "Pago completo online",
    descripcion:
      "La reserva se confirma con pago previo. Así evitamos cobros presenciales, cancelaciones improvisadas y momentos incómodos.",
  },
  {
    titulo: "Datos claros antes del servicio",
    descripcion:
      "La clienta recibe información de la Beluer asignada y el detalle completo de su reserva antes de la cita.",
  },
  {
    titulo: "Reseñas después de cada atención",
    descripcion:
      "Luego del servicio, belu solicita una reseña para cuidar la calidad, medir satisfacción y mejorar la experiencia.",
  },
];

export default function SeguridadClientas() {
  return (
    <section
      id="seguridad"
      className="relative overflow-hidden bg-white px-6 py-24 md:px-16 md:py-32"
    >
      <div className="absolute left-0 top-0 h-full w-1/3 bg-[#FFD6E2]/40" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#E60023]">
            Seguridad belu ✦
          </p>

          <h2 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[#111111] md:text-7xl">
            Belleza a domicilio, pero con respaldo.
          </h2>

          <p className="mt-6 max-w-xl text-base leading-7 text-black/60 md:text-lg">
            belu no funciona como un directorio abierto. Cada especialista pasa
            por una revisión previa y cada reserva queda registrada con pago,
            fecha, hora, servicio y datos relevantes.
          </p>

          <div className="mt-10 rounded-[2rem] bg-[#111111] p-8 text-white">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#FFD6E2]">
              Estándar belu
            </p>

            <h3 className="text-3xl font-black tracking-[-0.04em]">
              La experiencia no termina cuando pagas. Empieza cuando reservas.
            </h3>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {puntosSeguridad.map((punto, index) => (
            <article
              key={punto.titulo}
              className="rounded-[2rem] border border-black/5 bg-[#F5EFE7] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(230,0,35,0.10)]"
            >
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#E60023] text-sm font-black text-white">
                {String(index + 1).padStart(2, "0")}
              </div>

              <h3 className="mb-4 text-2xl font-black tracking-[-0.04em] text-[#111111]">
                {punto.titulo}
              </h3>

              <p className="text-sm leading-7 text-black/55">
                {punto.descripcion}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}