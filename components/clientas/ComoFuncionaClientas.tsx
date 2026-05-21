const pasos = [
  {
    numero: "01",
    titulo: "Elige tu servicio",
    descripcion:
      "Selecciona lashes, cejas o nails según lo que necesitas. Verás el precio desde el inicio, sin sorpresas.",
  },
  {
    numero: "02",
    titulo: "Agenda fecha y hora",
    descripcion:
      "Escoge cuándo quieres atenderte y registra tu dirección dentro de nuestra zona de cobertura.",
  },
  {
    numero: "03",
    titulo: "Paga online",
    descripcion:
      "La reserva se confirma con el pago completo. Así evitamos cobros presenciales y protegemos a ambas partes.",
  },
  {
    numero: "04",
    titulo: "La Beluer va a ti",
    descripcion:
      "Una especialista verificada llega a tu casa u oficina para realizar el servicio en el horario acordado.",
  },
];

export default function ComoFuncionaClientas() {
  return (
    <section
      id="como-funciona"
      className="relative overflow-hidden bg-[#FFD6E2] px-6 py-24 md:px-16 md:py-32"
    >
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full border border-[#E60023]/25" />
      <div className="absolute -right-28 bottom-10 h-96 w-96 rounded-full bg-[#E60023]/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 max-w-4xl">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#E60023]">
            Cómo funciona ✦
          </p>

          <h2 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[#111111] md:text-7xl">
            Reservar belleza nunca debería sentirse complicado.
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-7 text-black/60 md:text-lg">
            belu simplifica todo el proceso: eliges, agendas, pagas y una Beluer
            verificada llega a ti. Sin llamadas eternas, sin tráfico y sin pagos
            incómodos al terminar.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pasos.map((paso) => (
            <article
              key={paso.numero}
              className="group relative overflow-hidden rounded-[2rem] bg-white/80 p-7 shadow-[0_18px_50px_rgba(0,0,0,0.05)] ring-1 ring-white transition duration-300 hover:-translate-y-1 hover:bg-white"
            >
              <div className="absolute -right-6 -top-8 text-[7rem] font-black leading-none tracking-[-0.08em] text-[#E60023]/10 transition group-hover:text-[#E60023]/15">
                {paso.numero}
              </div>

              <div className="relative z-10">
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#E60023] text-sm font-black text-white shadow-[0_12px_30px_rgba(230,0,35,0.25)]">
                  {paso.numero}
                </div>

                <h3 className="mb-4 text-2xl font-black tracking-[-0.04em] text-[#111111]">
                  {paso.titulo}
                </h3>

                <p className="text-sm leading-7 text-black/55">
                  {paso.descripcion}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 grid gap-6 rounded-[2rem] bg-[#111111] p-8 text-white md:grid-cols-[1.2fr_0.8fr] md:p-10">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#FFD6E2]">
              Recompra automática
            </p>

            <h3 className="text-3xl font-black leading-tight tracking-[-0.04em] md:text-5xl">
              El día 21, belu te recuerda tu retoque.
            </h3>
          </div>

          <div className="flex items-center">
            <p className="text-sm leading-7 text-white/60">
              Después del servicio, el sistema puede enviarte un recordatorio
              automático para reservar nuevamente. La idea no es que busques
              belu cada vez, sino que belu te lleve directo a tu próxima cita.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}