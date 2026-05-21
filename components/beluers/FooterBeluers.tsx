const distritos = [
  "Miraflores",
  "San Isidro",
  "Surco",
  "La Molina",
  "Barranco",
  "San Borja",
];

export default function FooterBeluers() {
  return (
    <footer
      id="contacto"
      className="relative overflow-hidden bg-[#111] px-6 pb-10 pt-24 md:px-12 lg:px-20"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 -rotate-6 whitespace-nowrap text-[8rem] font-black leading-none tracking-[-0.06em] text-white/[0.025] md:text-[14rem] lg:text-[20rem]">
        belu ✦
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <span className="block text-4xl font-black tracking-[-0.05em] text-white">
              belu<span className="text-[#E60023]"> ✦</span>
            </span>

            <p className="mt-4 text-lg italic leading-7 text-white/35">
              luce increíble,
              <br />
              cuando quieras.
            </p>

            <p className="mt-6 max-w-xs text-sm leading-7 text-white/30">
              La plataforma de belleza a domicilio más exclusiva de Lima. Lash
              y nail artists verificadas de élite.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-white/35">
              Para Beluers
            </h4>

            <ul className="space-y-3">
              <li>
                <a
                  href="#postula"
                  className="text-sm text-white/45 transition hover:text-white"
                >
                  Aplicar como Beluer
                </a>
              </li>
              <li>
                <a
                  href="#como-funciona"
                  className="text-sm text-white/45 transition hover:text-white"
                >
                  Cómo funciona
                </a>
              </li>
              <li>
                <a
                  href="#calculadora"
                  className="text-sm text-white/45 transition hover:text-white"
                >
                  Calculadora de ingresos
                </a>
              </li>
              <li>
                <a
                  href="#modelo"
                  className="text-sm text-white/45 transition hover:text-white"
                >
                  El modelo de negocio
                </a>
              </li>
              <li>
                <a
                  href="#preguntas"
                  className="text-sm text-white/45 transition hover:text-white"
                >
                  Preguntas frecuentes
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-white/35">
              Distritos de acción
            </h4>

            <div className="flex flex-col gap-3">
              {distritos.map((distrito) => (
                <div
                  key={distrito}
                  className="flex items-center gap-2 text-sm text-white/40"
                >
                  <span className="text-xs text-[#E60023]/70">✦</span>
                  {distrito}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-white/35">
              Belu
            </h4>

            <ul className="space-y-3">
              <li>
                <a
                  href="/"
                  className="text-sm text-white/45 transition hover:text-white"
                >
                  Para clientas
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-white/45 transition hover:text-white"
                >
                  Quiénes somos
                </a>
              </li>
              <li>
                <a
                  href="#contacto"
                  className="text-sm text-white/45 transition hover:text-white"
                >
                  Contacto
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-white/45 transition hover:text-white"
                >
                  Privacidad
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-5 pt-8 text-center md:flex-row md:text-left">
          <div className="text-sm font-black tracking-[-0.03em] text-white/45">
            belu<span className="text-[#E60023]"> ✦</span>
          </div>

          <p className="text-xs text-white/25">
            © 2026 belu · Lima, Perú · Todos los derechos reservados
          </p>

          <div className="flex gap-6">
            <a
              href="#"
              className="text-xs text-white/35 transition hover:text-white/70"
            >
              Privacidad
            </a>
            <a
              href="#"
              className="text-xs text-white/35 transition hover:text-white/70"
            >
              Términos
            </a>
            <a
              href="#"
              className="text-xs text-white/35 transition hover:text-white/70"
            >
              Ayuda
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}