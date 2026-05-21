import { beluersPreview } from "@/data/beluers";

export default function BeluersPreviewClientas() {
  return (
    <section className="bg-[#111111] px-6 py-24 text-white md:px-16 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#FFD6E2]">
              Beluers verificadas ✦
            </p>

            <h2 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white md:text-7xl">
              El talento que va a ti.
            </h2>
          </div>

          <p className="max-w-md text-base leading-7 text-white/55">
            Cada Beluer pasa por un proceso de revisión antes de aparecer en la
            plataforma. Tú eliges según servicio, zona, estilo, rating y precio.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {beluersPreview.map((beluer) => (
            <article
              key={beluer.nombre}
              className="group overflow-hidden rounded-[2rem] bg-white text-[#111111] shadow-[0_20px_70px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={beluer.imagen}
                  alt={beluer.nombre}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                <div className="absolute left-5 top-5 rounded-full bg-[#E60023] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
                  {beluer.nivel}
                </div>

                <div className="absolute bottom-5 left-5 right-5">
                  <p className="mb-1 text-sm font-bold text-white/75">
                    {beluer.especialidad} · {beluer.distrito}
                  </p>

                  <h3 className="text-3xl font-black tracking-[-0.05em] text-white">
                    {beluer.nombre}
                  </h3>
                </div>
              </div>

              <div className="p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-black/35">
                      Rating
                    </p>
                    <p className="text-xl font-black text-[#E60023]">
                      ★ {beluer.rating}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-black/35">
                      Desde
                    </p>
                    <p className="text-xl font-black text-[#111111]">
                      {beluer.precioDesde}
                    </p>
                  </div>
                </div>

                <div className="mb-7 flex flex-wrap gap-2">
                  {beluer.servicios.map((servicio) => (
                    <span
                      key={servicio}
                      className="rounded-full bg-[#FFD6E2] px-3 py-1.5 text-xs font-bold text-[#E60023]"
                    >
                      {servicio}
                    </span>
                  ))}
                </div>

                <a
                  href="/app/clienta"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#111111] px-6 py-4 text-sm font-black text-white transition hover:bg-[#E60023]"
                >
                  Ver perfil y reservar
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-[2rem] border border-white/10 bg-white/5 p-8 md:flex-row md:p-10">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#FFD6E2]">
              Catálogo belu
            </p>

            <h3 className="text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
              Explora especialistas por zona, servicio y disponibilidad.
            </h3>
          </div>

          <a
            href="/app/clienta"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#E60023] px-8 py-4 text-sm font-black text-white transition hover:bg-[#C4001D]"
          >
            Ver catálogo completo
          </a>
        </div>
      </div>
    </section>
  );
}