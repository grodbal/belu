import Link from "next/link";

export default function FooterClientas() {
  return (
    <footer className="relative overflow-hidden bg-[#F5EFE7] px-6 py-14 md:px-16 md:py-20">
      <div className="absolute bottom-0 right-0 text-[16rem] font-black leading-none tracking-[-0.08em] text-[#E60023]/5">
        ✦
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-black/10 pb-12 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <Link
              href="/"
              className="text-5xl font-black tracking-[-0.07em] text-[#E60023]"
            >
              belu<span>✦</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm italic leading-7 text-black/55">
              luce increíble, cuando quieras.
            </p>

            <p className="mt-5 max-w-sm text-sm leading-7 text-black/50">
              Belleza premium a domicilio especializada en lashes y nails para
              clientas en distritos seleccionados de Lima.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-[#E60023]">
              Clientas
            </h4>

            <ul className="space-y-3 text-sm font-semibold text-black/55">
              <li>
                <Link href="/app/clienta" className="hover:text-[#E60023]">
                  Reservar
                </Link>
              </li>
              <li>
                <Link href="/app/clienta" className="hover:text-[#E60023]">
                  Mi cuenta
                </Link>
              </li>
              <li>
                <a href="#servicios" className="hover:text-[#E60023]">
                  Servicios
                </a>
              </li>
              <li>
                <a href="#seguridad" className="hover:text-[#E60023]">
                  Seguridad
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-[#E60023]">
              Beluers
            </h4>

            <ul className="space-y-3 text-sm font-semibold text-black/55">
              <li>
                <Link href="/beluers" className="hover:text-[#E60023]">
                  Aplicar
                </Link>
              </li>
              <li>
                <Link href="/beluers" className="hover:text-[#E60023]">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="/beluers" className="hover:text-[#E60023]">
                  Beneficios
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-[#E60023]">
              Cobertura
            </h4>

            <ul className="space-y-3 text-sm font-semibold text-black/55">
              <li>Miraflores</li>
              <li>San Isidro</li>
              <li>Surco</li>
              <li>La Molina</li>
              <li>Barranco</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-8 text-sm text-black/40 md:flex-row md:items-center md:justify-between">
          <p>© 2026 belu. Todos los derechos reservados.</p>

          <div className="flex gap-5">
            <a href="#" className="hover:text-[#E60023]">
              Términos
            </a>
            <a href="#" className="hover:text-[#E60023]">
              Privacidad
            </a>
            <a href="#" className="hover:text-[#E60023]">
              Contacto
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}