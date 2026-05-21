export default function CtaFinalClientas() {
  return (
    <section className="relative overflow-hidden bg-[#111111] px-6 py-24 text-white md:px-16 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(230,0,35,0.32),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(255,214,226,0.22),transparent_30%)]" />
      <div className="absolute -right-20 top-10 text-[20rem] font-black leading-none tracking-[-0.08em] text-white/5">
        belu
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <p className="mb-5 text-xs font-black uppercase tracking-[0.22em] text-[#FFD6E2]">
          Luce increíble, cuando quieras ✦
        </p>

        <h2 className="text-5xl font-black leading-[0.9] tracking-[-0.065em] md:text-8xl">
          Tu próxima cita no debería costarte tiempo.
        </h2>

        <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-white/65 md:text-lg">
          Reserva lashes o nails con una Beluer verificada y recibe la atención
          en tu casa u oficina. Sin tráfico, sin espera y con pago confirmado
          desde el inicio.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/app/clienta"
            className="inline-flex items-center justify-center rounded-full bg-[#E60023] px-9 py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(230,0,35,0.35)] transition hover:-translate-y-0.5 hover:bg-[#C4001D]"
          >
            Reservar ahora
          </a>

          <a
            href="/beluers"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-9 py-4 text-sm font-black text-white backdrop-blur-md transition hover:bg-white/20"
          >
            Soy Beluer
          </a>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-16 grid max-w-5xl gap-4 md:grid-cols-3">
        <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-6 text-left">
          <p className="text-3xl font-black text-[#FFD6E2]">01</p>
          <p className="mt-3 text-sm font-bold text-white">
            Elige tu servicio.
          </p>
          <p className="mt-2 text-sm leading-6 text-white/45">
            Lashes, cejas o nails desde una experiencia mobile-first.
          </p>
        </div>

        <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-6 text-left">
          <p className="text-3xl font-black text-[#FFD6E2]">02</p>
          <p className="mt-3 text-sm font-bold text-white">
            Confirma y paga.
          </p>
          <p className="mt-2 text-sm leading-6 text-white/45">
            La reserva se activa con pago completo y datos registrados.
          </p>
        </div>

        <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-6 text-left">
          <p className="text-3xl font-black text-[#FFD6E2]">03</p>
          <p className="mt-3 text-sm font-bold text-white">
            La Beluer va a ti.
          </p>
          <p className="mt-2 text-sm leading-6 text-white/45">
            Atención en casa u oficina dentro de zonas seleccionadas.
          </p>
        </div>
      </div>
    </section>
  );
}