import MainNav from "@/components/layout/MainNav";

export default function BeluersPage() {
  return (
    <>
      <MainNav variant="beluers" />

      <main className="min-h-screen bg-[#111111] text-white flex items-center justify-center px-6 pt-24">
        <section className="max-w-5xl text-center">
          <p className="text-[#FFD6E2] font-bold tracking-[0.2em] uppercase text-sm mb-6">
            belu ✦ plataforma para especialistas
          </p>

          <h1 className="text-6xl md:text-8xl font-black tracking-[-0.06em] leading-[0.9] mb-8">
            Duplica tus <span className="text-[#E60023]">servicios.</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/65 mb-10">
            La plataforma de belleza a domicilio diseñada para lash y nail
            artists en Lima. Tú pones el talento. Nosotros el sistema.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="bg-[#E60023] text-white px-8 py-4 rounded-full font-bold hover:bg-[#C4001D] transition"
            >
              Quiero aplicar como Beluer
            </a>

            <a
              href="/"
              className="bg-white/10 text-white px-8 py-4 rounded-full font-bold border border-white/20 hover:bg-white/20 transition"
            >
              Volver a clientas
            </a>
          </div>
        </section>
      </main>
    </>
  );
}