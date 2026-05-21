const ventajas = [
  "Comisión justa: solo ganamos si tú ganas",
  "0% de comisión por tus clientas actuales",
  "Bono de Cercanía: gana un extra por cada viaje corto",
  "Control total de tu disponibilidad",
  "Respaldo total de cobros garantizados",
];

export default function ModeloBeluers() {
  return (
    <section
      id="modelo"
      className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1604655906351-d8ca39e7ee43?auto=format&fit=crop&w=1920&q=85')",
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(5,5,5,0.97)_0%,rgba(15,5,5,0.92)_60%,rgba(40,0,8,0.9)_100%)]" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#E60023]">
            ✦ Socio de marketing
          </p>

          <h2 className="text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white md:text-5xl lg:text-6xl">
            Agenda llena,
            <br />
            cero estrés.
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-white/50 md:text-lg">
            Invertimos en marketing digital, alianzas premium y programas de
            referidos para generar un flujo constante de reservas. Nosotros
            conseguimos a las clientas; tú te dedicas a dejarlas increíbles.
          </p>

          <div className="mt-10 rounded-[1.5rem] border border-[#E60023]/30 bg-[#E60023]/10 p-8">
            <span className="mb-4 inline-flex rounded-full bg-[#E60023] px-4 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white">
              Transparencia total
            </span>

            <h3 className="text-2xl font-black tracking-[-0.03em] text-white">
              Cuentas claras
            </h3>

            <p className="mt-4 text-sm leading-7 text-white/55">
              belu retiene un porcentaje justo solo por las clientas nuevas que
              te generamos. Además, tu tiempo en movimiento vale: la clienta
              asume un cargo fijo de logística, del cual tú recibes un Bono de
              Cercanía.
            </p>

            <div className="mt-7 text-3xl font-black leading-tight tracking-[-0.04em] text-white">
              <span className="text-[#E60023]">% Justo</span> por clientas
              nuevas.
              <br />
              <span className="text-[#E60023]">+ Plus extra</span> por cada
              traslado.
            </div>
          </div>
        </div>

        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-white/30">
            Tus ventajas garantizadas
          </p>

          <div className="flex flex-col gap-3">
            {ventajas.map((ventaja) => (
              <div
                key={ventaja}
                className="flex items-center gap-4 rounded-2xl border border-[#E60023]/25 bg-[#E60023]/10 px-5 py-4"
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#E60023]" />

                <span className="text-sm font-semibold leading-6 text-white">
                  {ventaja}
                </span>

                <span className="ml-auto text-sm font-bold text-[#E60023]">
                  ✦
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm leading-7 text-white/40">
            No somos tu jefe. Somos tu herramienta tecnológica para escalar tus
            ingresos. El talento es tuyo; nosotros ponemos el sistema para que
            te enfoques en crear resultados impecables.
          </div>
        </div>
      </div>
    </section>
  );
}