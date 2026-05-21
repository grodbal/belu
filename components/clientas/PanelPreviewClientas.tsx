export default function PanelPreviewClientas() {
  return (
    <section className="relative overflow-hidden bg-[#F5EFE7] px-6 py-24 md:px-16 md:py-32">
      <div className="absolute left-1/2 top-0 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-[#FFD6E2]/70 blur-3xl" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#E60023]">
            Tu espacio belu ✦
          </p>

          <h2 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[#111111] md:text-7xl">
            Reserva, revisa y repite desde un solo lugar.
          </h2>

          <p className="mt-6 max-w-xl text-base leading-7 text-black/60 md:text-lg">
            Cada clienta puede acceder a su panel para ver reservas activas,
            especialistas favoritas, pagos realizados e historial de servicios.
            La idea es que la recompra sea cada vez más simple.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="/app/clienta"
              className="inline-flex items-center justify-center rounded-full bg-[#E60023] px-8 py-4 text-sm font-black text-white transition hover:bg-[#C4001D]"
            >
              Ir a mi cuenta
            </a>

            <a
              href="/app/clienta"
              className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-8 py-4 text-sm font-black text-[#111111] transition hover:border-[#E60023] hover:text-[#E60023]"
            >
              Hacer una reserva
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 hidden h-24 w-24 rounded-full bg-[#E60023] md:block" />
          <div className="absolute -bottom-8 -right-8 hidden h-32 w-32 rounded-full bg-[#FFD6E2] md:block" />

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white bg-white/80 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.14)] backdrop-blur-xl">
            <div className="rounded-[2rem] bg-[#F5EFE7] p-5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#E60023]">
                    Panel clienta
                  </p>
                  <h3 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                    Bienvenida, María ✦
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E60023] text-sm font-black text-white">
                  MC
                </div>
              </div>

              <div className="mb-5 rounded-[1.5rem] bg-[#FFD6E2] p-5">
                <div className="mb-3 inline-flex rounded-full bg-white/70 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#E60023]">
                  Reserva activa
                </div>

                <h4 className="text-2xl font-black tracking-[-0.04em]">
                  Volumen 3D + diseño de cejas
                </h4>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/80 p-4">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-black/35">
                      Fecha
                    </p>
                    <p className="mt-1 font-black text-[#111111]">
                      Viernes 24
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/80 p-4">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-black/35">
                      Hora
                    </p>
                    <p className="mt-1 font-black text-[#111111]">
                      4:30 PM
                    </p>
                  </div>

                  <div className="col-span-2 rounded-2xl bg-white/80 p-4">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-black/35">
                      Beluer asignada
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="font-black text-[#111111]">Andrea R.</p>
                      <span className="rounded-full bg-[#E60023] px-3 py-1 text-xs font-black text-white">
                        Verificada
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[1.4rem] bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#E60023]">
                    Favoritas
                  </p>
                  <p className="mt-2 text-2xl font-black">3 Beluers</p>
                  <p className="mt-1 text-sm text-black/45">
                    Acceso rápido a tus especialistas.
                  </p>
                </div>

                <div className="rounded-[1.4rem] bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#E60023]">
                    Pagos
                  </p>
                  <p className="mt-2 text-2xl font-black">S/ 160</p>
                  <p className="mt-1 text-sm text-black/45">
                    Última reserva confirmada.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -right-3 top-10 rounded-2xl bg-[#111111] px-5 py-4 text-white shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#FFD6E2]">
              Día 21
            </p>
            <p className="mt-1 text-sm font-bold">
              Recordatorio de retoque
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}