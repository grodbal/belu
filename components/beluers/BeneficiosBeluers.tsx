const beneficios = [
  {
    titulo: "Más clientas sin perseguir mensajes",
    descripcion:
      "belu te conecta con clientas que ya están buscando servicios de lashes y nails a domicilio.",
  },
  {
    titulo: "Pago completo antes del servicio",
    descripcion:
      "La clienta paga online al reservar. Así reduces cancelaciones, no-shows y momentos incómodos de cobro.",
  },
  {
    titulo: "Recordatorios automáticos",
    descripcion:
      "El sistema envía recordatorios antes de la cita y activa el retoque del día 21 para generar recompra.",
  },
  {
    titulo: "Tu perfil profesional publicado",
    descripcion:
      "Muestra tu portafolio, servicios, precios, zona de atención y nivel dentro de la plataforma.",
  },
  {
    titulo: "Autonomía sobre tus precios",
    descripcion:
      "Tú defines cuánto vale tu trabajo, siempre respetando el estándar premium de belu.",
  },
  {
    titulo: "Un sistema para crecer",
    descripcion:
      "Accede a un portal donde podrás ver servicios realizados, ingresos generados e historial de actividad.",
  },
];

export default function BeneficiosBeluers() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="mb-6 inline-flex rounded-full bg-[#FFD6E2] px-5 py-2 text-sm font-semibold text-[#E60023]">
            beneficios para Beluers ✦
          </span>

          <h2 className="text-4xl font-bold leading-tight tracking-tight text-[#1A1A1A] md:text-5xl lg:text-6xl">
            Trabaja con más orden.  
            Gana con más estrategia.
          </h2>

          <p className="mt-6 text-lg leading-8 text-[#555]">
            belu no solo te manda servicios. Te da un sistema para operar mejor,
            verte más profesional y construir una agenda más rentable.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {beneficios.map((beneficio, index) => (
            <div
              key={beneficio.titulo}
              className="group rounded-[2rem] border border-[#F1D7DE] bg-[#F7F3F0] p-7 transition duration-300 hover:-translate-y-1 hover:bg-[#E60023] hover:shadow-xl"
            >
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-[#E60023] group-hover:bg-[#FFD6E2]">
                {index + 1}
              </div>

              <h3 className="text-2xl font-bold leading-tight text-[#1A1A1A] group-hover:text-white">
                {beneficio.titulo}
              </h3>

              <p className="mt-4 leading-7 text-[#555] group-hover:text-white/90">
                {beneficio.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute -right-20 top-20 h-52 w-52 rounded-full bg-[#FFD6E2]/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-[#E60023]/10 blur-3xl" />
    </section>
  );
}