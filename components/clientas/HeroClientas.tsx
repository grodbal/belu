export default function HeroClientas() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#111111] text-white flex items-center">
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1920&q=85')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/45 to-[#E60023]/25" />
      </div>

      <div className="relative z-10 px-6 md:px-16 pt-28 max-w-6xl">
        <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md mb-8">
          Belleza premium sin moverte
        </p>

        <h1 className="max-w-5xl text-[4.2rem] sm:text-[5.8rem] md:text-[8.5rem] font-black tracking-[-0.075em] leading-[0.86]">
          <span className="block">EL SALÓN</span>
          <span className="block text-[#E60023]">LLEGÓ</span>
          <span className="block">A TI.</span>
        </h1>

        <p className="mt-8 max-w-xl text-base md:text-lg leading-8 text-white/75">
          Lash y nail artists verificadas en Lima. Reserva desde tu casa, sin
          tráfico, sin esperas y con una experiencia diseñada para tu rutina.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <a
            href="/app/clienta"
            className="inline-flex items-center justify-center rounded-full bg-[#E60023] px-8 py-4 text-sm md:text-base font-extrabold text-white shadow-[0_12px_30px_rgba(230,0,35,0.35)] transition hover:bg-[#C4001D] hover:-translate-y-0.5"
          >
            Reservar mi primera cita
          </a>

          <a
            href="#servicios"
            className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-8 py-4 text-sm md:text-base font-bold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            Ver catálogo
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2 rotate-[-3deg]">
        <div className="overflow-hidden bg-[#E60023] py-4 shadow-2xl">
          <div className="flex w-max animate-[marquee_28s_linear_infinite]">
            <div className="flex whitespace-nowrap">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex">
                  <span className="px-6 text-sm font-black uppercase tracking-[0.18em] text-[#FFD6E2]">
                    LUCE INCREÍBLE, CUANDO QUIERAS
                  </span>
                  <span className="px-6 text-sm font-black uppercase tracking-[0.18em] text-[#FFD6E2]">
                    ✦
                  </span>
                  <span className="px-6 text-sm font-black uppercase tracking-[0.18em] text-[#FFD6E2]">
                    LASHES & NAILS
                  </span>
                  <span className="px-6 text-sm font-black uppercase tracking-[0.18em] text-[#FFD6E2]">
                    ✦
                  </span>
                  <span className="px-6 text-sm font-black uppercase tracking-[0.18em] text-[#FFD6E2]">
                    EL TALENTO VA A TI
                  </span>
                  <span className="px-6 text-sm font-black uppercase tracking-[0.18em] text-[#FFD6E2]">
                    ✦
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-[#FFD6E2] py-4">
          <div className="flex w-max animate-[marqueeReverse_34s_linear_infinite]">
            <div className="flex whitespace-nowrap">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex">
                  <span className="px-6 text-sm font-black uppercase tracking-[0.18em] text-[#E60023]">
                    BELLEZA SIN ESPERAS
                  </span>
                  <span className="px-6 text-sm font-black uppercase tracking-[0.18em] text-[#E60023]">
                    ✦
                  </span>
                  <span className="px-6 text-sm font-black uppercase tracking-[0.18em] text-[#E60023]">
                    TU RITUAL, EN TU ESPACIO
                  </span>
                  <span className="px-6 text-sm font-black uppercase tracking-[0.18em] text-[#E60023]">
                    ✦
                  </span>
                  <span className="px-6 text-sm font-black uppercase tracking-[0.18em] text-[#E60023]">
                    BEAUTY ON DEMAND
                  </span>
                  <span className="px-6 text-sm font-black uppercase tracking-[0.18em] text-[#E60023]">
                    ✦
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}