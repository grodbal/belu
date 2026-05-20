import { serviciosClientas } from "@/data/servicios";

export default function ServiciosClientas() {
  return (
    <section id="servicios" className="bg-[#F5EFE7] px-6 py-24 md:px-16 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#E60023]">
              Servicios belu ✦
            </p>

            <h2 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[#111111] md:text-7xl">
              Lashes y nails, sin moverte.
            </h2>
          </div>

          <p className="max-w-md text-base leading-7 text-black/55">
            Elige el servicio, revisa el precio desde el inicio y agenda con una
            Beluer verificada en los distritos premium de Lima.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {serviciosClientas.map((servicio) => (
            <article
              key={servicio.nombre}
              className="group overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.06)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(230,0,35,0.12)]"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={servicio.imagen}
                  alt={servicio.nombre}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

                <span className="absolute left-5 top-5 rounded-full bg-[#FFD6E2] px-4 py-2 text-[0.7rem] font-black uppercase tracking-[0.14em] text-[#E60023]">
                  {servicio.categoria}
                </span>
              </div>

              <div className="p-7">
                <h3 className="mb-3 text-2xl font-black tracking-[-0.04em] text-[#111111]">
                  {servicio.nombre}
                </h3>

                <p className="mb-6 min-h-20 text-sm leading-7 text-black/55">
                  {servicio.descripcion}
                </p>

                <div className="mb-6 h-px bg-black/10" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/35">
                      Desde
                    </p>
                    <p className="text-3xl font-black tracking-[-0.05em] text-[#E60023]">
                      {servicio.precio}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/35">
                      Duración
                    </p>
                    <p className="text-sm font-bold text-black/50">
                      {servicio.duracion}
                    </p>
                  </div>
                </div>

                <a
                  href="/app/clienta"
                  className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[#111111] px-6 py-4 text-sm font-black text-white transition hover:bg-[#E60023]"
                >
                  Reservar este servicio
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] bg-[#111111] p-8 text-white md:flex md:items-center md:justify-between md:p-10">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#FFD6E2]">
              Reserva completa desde el inicio
            </p>
            <h3 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">
              Sin pagos incómodos al finalizar.
            </h3>
          </div>

          <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 md:mt-0">
            La clienta paga online antes del servicio. La reserva queda
            confirmada, la Beluer queda protegida y todo el flujo se activa
            automáticamente.
          </p>
        </div>
      </div>
    </section>
  );
}