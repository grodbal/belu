export default function HeroBeluers() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#111111] text-white">
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1920&q=85')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/65 to-[#E60023]/45" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center px-6 pt-28 md:px-16">
        <div className="max-w-6xl">
          <p className="mb-8 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/85 backdrop-blur-md">
            Plataforma exclusiva para lash y nail artists · Lima
          </p>

          <h1 className="max-w-6xl text-[4rem] font-black leading-[0.86] tracking-[-0.075em] sm:text-[5.8rem] md:text-[8.5rem]">
            <span className="block">DUPLICA</span>
            <span className="block">TUS</span>
            <span className="block text-[#E60023]">SERVICIOS.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
            La plataforma de belleza a domicilio diseñada para especialistas en
            lashes y nails. Tú pones el talento. belu pone el sistema, las
            reservas y la recompra.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#aplicar"
              className="inline-flex items-center justify-center rounded-full bg-[#E60023] px-8 py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(230,0,35,0.35)] transition hover:-translate-y-0.5 hover:bg-[#C4001D]"
            >
              Quiero aplicar como Beluer
            </a>

            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-8 py-4 text-sm font-black text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Ver cómo funciona
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-6 z-10 hidden rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl md:block">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFD6E2]">
          Modelo belu
        </p>
        <p className="mt-2 max-w-xs text-sm leading-6 text-white/70">
          Cero costo de entrada. Comisión solo sobre servicios generados por la
          plataforma.
        </p>
      </div>
    </section>
  );
}