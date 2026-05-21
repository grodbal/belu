const testimonios = [
  {
    iniciales: "KM",
    nombre: "Karla M.",
    especialidad: "Lash Artist · Miraflores",
    resultado: "+S/. 2,860 extra al mes",
    color: "bg-[#E60023]",
    texto:
      "Antes hacía 2 o 3 servicios y llegaba agotada. Ahora opero solo en mi zona de dominio. Hago más citas, gasto poquísimo en moverme y el bono de cercanía me queda casi todo como ganancia neta. El tráfico ya no define mi día.",
  },
  {
    iniciales: "SL",
    nombre: "Sofía L.",
    especialidad: "Nail Artist · San Isidro",
    resultado: "Agenda llena cada semana",
    color: "bg-[#6BC5E2]",
    texto:
      "Saber que todas las clientas han pasado por una verificación y pago previo me da una paz mental que otras apps jamás me dieron al ir a un domicilio nuevo.",
  },
  {
    iniciales: "RP",
    nombre: "Renata P.",
    especialidad: "Lash & Nail · Surco",
    resultado: "Beluer desde el día 1",
    color: "bg-[#555]",
    texto:
      "Apliqué pensando que era otro marketplace más. La diferencia es que belu selecciona — y eso hace que las clientas lleguen con una expectativa diferente. Con más respeto.",
  },
];

export default function TestimoniosBeluers() {
  return (
    <section
      id="testimonios"
      className="relative overflow-hidden bg-[#111] px-6 py-24 md:px-12 lg:px-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(230,0,35,0.18),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#E60023]">
          ✦ Beluers reales
        </p>

        <h2 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white md:text-5xl lg:text-6xl">
          Lo que cambia cuando
          <br />
          tienes el sistema correcto.
        </h2>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonios.map((testimonio) => (
            <article
              key={testimonio.nombre}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#E60023]/40"
            >
              <div className="mb-2 text-6xl font-black italic leading-none text-[#E60023]/20">
                "
              </div>

              <p className="min-h-[190px] text-sm italic leading-7 text-white/60">
                {testimonio.texto}
              </p>

              <div className="mt-8 flex items-center gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${testimonio.color} text-xs font-black text-white`}
                >
                  {testimonio.iniciales}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">
                    {testimonio.nombre}
                  </h3>
                  <p className="text-xs text-white/40">
                    {testimonio.especialidad}
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-[#E60023]/15 px-3 py-1 text-xs font-bold text-[#E60023]">
                    {testimonio.resultado}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}