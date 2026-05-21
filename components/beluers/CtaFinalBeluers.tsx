export default function CtaFinalBeluers() {
  return (
    <section className="relative overflow-hidden px-6 py-32 text-center md:px-12 lg:px-20">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1920&q=85')",
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.84)_0%,rgba(150,0,20,0.68)_50%,rgba(0,0,0,0.9)_100%)]" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/45">
          ✦ El siguiente paso
        </p>

        <h2 className="text-5xl font-black leading-[0.97] tracking-[-0.06em] text-white md:text-7xl lg:text-8xl">
          ¿Lista para
          <br />
          <span className="text-[#E60023]">duplicar tus servicios?</span>
        </h2>

        <p className="mx-auto mt-8 max-w-xl text-base leading-8 text-white/60 md:text-lg">
          No todas las especialistas califican. Si crees que tu trabajo habla
          por sí solo, aplica ahora y lo comprobamos juntas.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#postula"
            className="inline-flex rounded-full bg-[#E60023] px-9 py-4 text-base font-black text-white transition hover:-translate-y-1 hover:bg-[#C4001D]"
          >
            Aplicar como Beluer ✦
          </a>

          <a
            href="#como-funciona"
            className="inline-flex rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            Ver cómo funciona
          </a>
        </div>
      </div>
    </section>
  );
}