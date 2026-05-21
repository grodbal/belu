const metricas = [
  {
    label: "Servicios nuevos por semana",
    valor: "12",
    detalle: "Reservas generadas por belu",
  },
  {
    label: "Ticket promedio",
    valor: "S/ 120",
    detalle: "Según servicio y especialidad",
  },
  {
    label: "Ingreso bruto mensual",
    valor: "S/ 5,760",
    detalle: "Proyección referencial",
  },
  {
    label: "Comisión inicial",
    valor: "20%",
    detalle: "Solo por servicios asignados por belu",
  },
];

export default function CalculadoraBeluers() {
  return (
    <section
      id="calculadora"
      className="relative overflow-hidden bg-[#FFD6E2] px-6 py-24 md:px-16 md:py-32"
    >
      <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-[#E60023]/15 blur-3xl" />
      <div className="absolute right-0 top-0 text-[20rem] font-black leading-none tracking-[-0.08em] text-[#E60023]/5">
        S/
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#E60023]">
            Calculadora ✦
          </p>

          <h2 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[#111111] md:text-7xl">
            ¿Cuánto podrías generar con belu?
          </h2>

          <p className="mt-6 max-w-xl text-base leading-7 text-black/60 md:text-lg">
            La idea no es que trabajes más horas. La idea es que recibas más
            servicios bien asignados, en zonas ordenadas y con clientas que ya
            pagaron antes de la cita.
          </p>

          <div className="mt-10 rounded-[2rem] bg-white p-7 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E60023]">
              Ejemplo referencial
            </p>

            <p className="mt-3 text-sm leading-7 text-black/55">
              Si belu te genera 12 servicios nuevos por semana con un ticket
              promedio de S/ 120, tu ingreso bruto mensual podría proyectarse
              alrededor de S/ 5,760 antes de comisión y costos operativos.
            </p>
          </div>
        </div>

        <div className="rounded-[2.5rem] bg-[#111111] p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.20)] md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FFD6E2]">
                Proyección mensual
              </p>
              <h3 className="mt-2 text-4xl font-black tracking-[-0.05em]">
                S/ 4,608
              </h3>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E60023] text-2xl">
              ✦
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {metricas.map((metrica) => (
              <div
                key={metrica.label}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
              >
                <p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">
                  {metrica.label}
                </p>

                <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">
                  {metrica.valor}
                </p>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  {metrica.detalle}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-[#E60023] p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFD6E2]">
              Neto estimado
            </p>

            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <p className="text-5xl font-black tracking-[-0.06em]">
                S/ 4,608
              </p>

              <p className="max-w-xs text-sm leading-6 text-white/75">
                Estimación luego de una comisión inicial del 20%.
              </p>
            </div>
          </div>

          <p className="mt-5 text-xs leading-6 text-white/35">
            *Esta calculadora es referencial. Los ingresos reales dependen de tu
            disponibilidad, zona, servicios, ticket promedio y demanda activa.
          </p>
        </div>
      </div>
    </section>
  );
}