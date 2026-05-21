const problemas = [
  {
    titulo: "Mucho talento, poco sistema",
    descripcion:
      "Puedes ser muy buena en lashes o nails, pero si todo depende de tus historias, mensajes y disponibilidad manual, tu crecimiento tiene techo.",
  },
  {
    titulo: "Demasiado tiempo perdido",
    descripcion:
      "Moverte por Lima sin una zona ordenada puede quitarte horas al día. Ese tiempo podría convertirse en más servicios y más ingresos.",
  },
  {
    titulo: "Agenda irregular",
    descripcion:
      "Hay semanas llenas y semanas vacías. Sin recordatorios, recompra ni flujo constante de clientas, tus ingresos se vuelven impredecibles.",
  },
];

export default function ProblemaBeluers() {
  return (
    <section className="bg-[#F5EFE7] px-6 py-24 md:px-16 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#E60023]">
            El problema ✦
          </p>

          <h2 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[#111111] md:text-7xl">
            Tienes el talento. Te falta el sistema.
          </h2>

          <p className="mt-6 max-w-xl text-base leading-7 text-black/60 md:text-lg">
            belu está pensado para especialistas que ya trabajan bien, pero
            necesitan una estructura que les ayude a conseguir más servicios,
            ordenar su agenda y aprovechar mejor su tiempo.
          </p>
        </div>

        <div className="grid gap-5">
          {problemas.map((problema, index) => (
            <article
              key={problema.titulo}
              className="rounded-[2rem] bg-white p-7 shadow-[0_18px_50px_rgba(0,0,0,0.05)] ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(230,0,35,0.10)]"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#E60023] text-sm font-black text-white">
                {String(index + 1).padStart(2, "0")}
              </div>

              <h3 className="mb-3 text-2xl font-black tracking-[-0.04em] text-[#111111]">
                {problema.titulo}
              </h3>

              <p className="text-sm leading-7 text-black/55">
                {problema.descripcion}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}