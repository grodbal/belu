const pasos = [
  {
    numero: "01",
    titulo: "Aplicas como Beluer",
    descripcion:
      "Completas tu postulación con tus datos, zona de atención, servicios, experiencia e Instagram profesional.",
  },
  {
    numero: "02",
    titulo: "Validamos tu perfil",
    descripcion:
      "Revisamos tu portafolio, calidad del trabajo y compatibilidad con el estándar belu antes de aprobarte.",
  },
  {
    numero: "03",
    titulo: "Recibes reservas",
    descripcion:
      "Cuando una clienta paga un servicio, la reserva se publica en el canal privado de Beluers con fecha, hora, zona y detalle.",
  },
  {
    numero: "04",
    titulo: "Tomas el servicio",
    descripcion:
      "La Beluer disponible que acepta primero se asigna al servicio. Tú decides qué reservas tomar según tu agenda.",
  },
];

export default function ComoFuncionaBeluers() {
  return (
    <section
      id="como-funciona"
      className="relative overflow-hidden bg-[#111111] px-6 py-24 text-white md:px-16 md:py-32"
    >
      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#E60023]/20 blur-3xl" />
      <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-[#FFD6E2]/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 max-w-4xl">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#FFD6E2]">
            Cómo funciona ✦
          </p>

          <h2 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white md:text-7xl">
            Tú pones el talento. belu pone el sistema.
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 md:text-lg">
            belu no busca quitarte independencia. Busca darte una estructura
            para recibir más oportunidades, organizar mejor tus servicios y
            crecer con menos fricción operativa.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pasos.map((paso) => (
            <article
              key={paso.numero}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/10"
            >
              <div className="absolute -right-6 -top-8 text-[7rem] font-black leading-none tracking-[-0.08em] text-white/5 transition group-hover:text-[#E60023]/15">
                {paso.numero}
              </div>

              <div className="relative z-10">
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#E60023] text-sm font-black text-white shadow-[0_12px_30px_rgba(230,0,35,0.25)]">
                  {paso.numero}
                </div>

                <h3 className="mb-4 text-2xl font-black tracking-[-0.04em] text-white">
                  {paso.titulo}
                </h3>

                <p className="text-sm leading-7 text-white/55">
                  {paso.descripcion}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 grid gap-6 rounded-[2rem] bg-[#E60023] p-8 text-white md:grid-cols-[1fr_0.9fr] md:p-10">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#FFD6E2]">
              Cero costo de entrada
            </p>

            <h3 className="text-3xl font-black leading-tight tracking-[-0.04em] md:text-5xl">
              Solo ganamos cuando generamos servicios para ti.
            </h3>
          </div>

          <div className="flex items-center">
            <p className="text-sm leading-7 text-white/75">
              En la primera etapa, belu cobra comisión únicamente sobre los
              servicios que la plataforma te asigna. Tus clientas actuales siguen
              siendo tuyas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}