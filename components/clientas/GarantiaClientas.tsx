export default function GarantiaClientas() {
  return (
    <section className="relative overflow-hidden bg-[#E60023] px-6 py-24 text-white md:px-16 md:py-32">
      <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-[#FFD6E2]/20 blur-3xl" />
      <div className="absolute -right-28 bottom-0 text-[22rem] font-black leading-none tracking-[-0.08em] text-white/5">
        ✦
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#FFD6E2]">
            Garantía belu redo ✦
          </p>

          <h2 className="max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.065em] md:text-7xl">
            Si no queda como esperabas, belu responde.
          </h2>

          <p className="mt-7 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
            Probar un servicio de belleza a domicilio no debería sentirse como
            un riesgo. Por eso belu trabaja con especialistas verificadas,
            reservas registradas y una política pensada para proteger la
            experiencia de la clienta.
          </p>
        </div>

        <div className="rounded-[2.5rem] bg-white p-8 text-[#111111] shadow-[0_30px_90px_rgba(0,0,0,0.22)] md:p-10">
          <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD6E2] text-3xl text-[#E60023]">
            ✦
          </div>

          <h3 className="mb-5 text-4xl font-black leading-none tracking-[-0.05em]">
            Revisión en 24h.
          </h3>

          <p className="mb-8 text-sm leading-7 text-black/60">
            Si el resultado técnico no cumple el estándar belu, revisamos el
            caso y coordinamos una solución según la política de garantía de la
            plataforma.
          </p>

          <div className="space-y-4">
            <div className="rounded-2xl bg-[#F5EFE7] p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#E60023]">
                01 · Evidencia
              </p>
              <p className="mt-2 text-sm leading-6 text-black/60">
                La clienta reporta el caso con fotos y detalle del servicio.
              </p>
            </div>

            <div className="rounded-2xl bg-[#F5EFE7] p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#E60023]">
                02 · Revisión
              </p>
              <p className="mt-2 text-sm leading-6 text-black/60">
                belu evalúa la situación según el estándar de calidad.
              </p>
            </div>

            <div className="rounded-2xl bg-[#F5EFE7] p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#E60023]">
                03 · Solución
              </p>
              <p className="mt-2 text-sm leading-6 text-black/60">
                Coordinamos corrección, retoque o alternativa según corresponda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}