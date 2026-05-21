const comparacion = [
  {
    tipo: "Sin belu",
    estilo: "claro",
    datos: [
      {
        valor: "2",
        label: "servicios por día",
      },
      {
        valor: "S/. 130",
        label: "ingreso diario",
      },
      {
        valor: "Toda Lima",
        label: "viajes largos y desgastantes",
      },
    ],
    eficiencia: "32%",
  },
  {
    tipo: "✦ Con belu",
    estilo: "oscuro",
    datos: [
      {
        valor: "4",
        label: "servicios por día",
      },
      {
        valor: "S/. 260",
        label: "ingreso diario",
      },
      {
        valor: "Tu zona",
        label: "rutas cortas en distritos top",
      },
    ],
    eficiencia: "95%",
  },
];

export default function SolucionBeluers() {
  return (
    <section
      id="solucion"
      className="relative overflow-hidden bg-white px-6 py-24 md:px-12 lg:px-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#E60023]">
            ✦ La solución
          </p>

          <h2 className="text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[#111] md:text-5xl lg:text-6xl">
            Con belu, te mueves menos.
            <br />
            Y ganas el doble.
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-[#666] md:text-lg">
            belu concentra sus operaciones exclusivamente en las zonas premium
            y de mayor poder adquisitivo de Lima. Tu próxima clienta siempre
            está a una distancia razonable.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-[2rem] shadow-2xl lg:grid-cols-[1fr_4px_1fr]">
          <div className="bg-[#F5EFE7] p-8 md:p-12">
            <span className="mb-10 inline-flex rounded-full bg-[#ddd] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#999]">
              Sin belu
            </span>

            <div className="space-y-8">
              <div>
                <div className="text-6xl font-black leading-none tracking-[-0.05em] text-black/15">
                  2
                </div>
                <p className="mt-2 text-sm text-[#aaa]">servicios por día</p>
              </div>

              <div>
                <div className="text-6xl font-black leading-none tracking-[-0.05em] text-black/15">
                  S/. 130
                </div>
                <p className="mt-2 text-sm text-[#aaa]">ingreso diario</p>
              </div>

              <div>
                <div className="text-4xl font-black uppercase leading-none tracking-[-0.04em] text-black/15 md:text-5xl">
                  Toda Lima
                </div>
                <p className="mt-2 text-sm text-[#aaa]">
                  viajes largos y desgastantes
                </p>
              </div>
            </div>

            <div className="mt-12">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#aaa]">
                Eficiencia de jornada
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-black/10">
                <div className="h-full w-[32%] rounded-full bg-[#ccc]" />
              </div>
            </div>
          </div>

          <div className="hidden bg-gradient-to-b from-[#FFD6E2] via-[#E60023] to-[#FFD6E2] lg:block">
            <div className="flex h-full items-center justify-center">
              <span className="rounded-md bg-[#E60023] px-2 py-3 text-xs font-black uppercase tracking-wider text-white [writing-mode:vertical-rl]">
                VS
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden bg-[#111] p-8 md:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(230,0,35,0.25),transparent_45%)]" />

            <div className="relative">
              <span className="mb-10 inline-flex rounded-full bg-[#E60023]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#E60023]">
                ✦ Con belu
              </span>

              <div className="space-y-8">
                <div>
                  <div className="text-6xl font-black leading-none tracking-[-0.05em] text-[#E60023]">
                    4
                  </div>
                  <p className="mt-2 text-sm text-white/40">
                    servicios por día
                  </p>
                </div>

                <div>
                  <div className="text-6xl font-black leading-none tracking-[-0.05em] text-white">
                    S/. 260
                  </div>
                  <p className="mt-2 text-sm text-white/40">ingreso diario</p>
                </div>

                <div>
                  <div className="text-4xl font-black uppercase leading-none tracking-[-0.04em] text-white md:text-5xl">
                    Tu zona
                  </div>
                  <p className="mt-2 text-sm text-white/40">
                    rutas cortas en distritos top
                  </p>
                </div>
              </div>

              <div className="mt-12">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-white/40">
                  Eficiencia de jornada
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[95%] rounded-full bg-[#E60023]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-[#777]">
          La proyección es referencial y se basa en optimizar rutas dentro de
          distritos premium, reduciendo tiempo muerto entre servicios.
        </p>
      </div>
    </section>
  );
}