const stats = [
  {
    valor: "Top",
    titulo: "Zonificación inteligente",
    descripcion: "operamos en distritos premium seleccionados",
  },
  {
    valor: "0%",
    titulo: "Tus clientas, siempre tuyas",
    descripcion: "cero comisión por atender a tu cartera actual",
  },
  {
    valor: "100%",
    titulo: "Seguridad y respaldo",
    descripcion: "identidad y cobro validado por pasarela de pagos",
  },
];

export default function StatsBeluers() {
  return (
    <section className="relative overflow-hidden bg-[#E60023] px-6 py-14 md:px-12 lg:px-20">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-white blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#FFD6E2] blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-8 md:grid-cols-3 md:gap-0">
        {stats.map((stat, index) => (
          <div
            key={stat.titulo}
            className={`relative ${
              index !== stats.length - 1
                ? "md:border-r md:border-white/20"
                : ""
            } md:pr-10 ${index !== 0 ? "md:pl-10" : ""}`}
          >
            <div className="text-6xl font-black leading-none tracking-[-0.06em] text-white md:text-7xl lg:text-8xl">
              {stat.valor}
            </div>

            <div className="mt-4 max-w-[220px] text-sm leading-6 text-white/75">
              <strong className="block text-base font-bold text-white">
                {stat.titulo}
              </strong>
              {stat.descripcion}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}