const faqs = [
  {
    pregunta: "¿belu atiende en todo Lima?",
    respuesta:
      "En esta primera etapa, belu opera en distritos seleccionados: Miraflores, San Isidro, Surco, La Molina y Barranco. Esto permite cuidar tiempos, calidad y disponibilidad.",
  },
  {
    pregunta: "¿Puedo elegir a mi Beluer?",
    respuesta:
      "Sí. La clienta puede elegir una Beluer según servicio, zona, disponibilidad, rating y precio. También puede usar un modo gestionado si prefiere que belu le asigne una especialista disponible.",
  },
  {
    pregunta: "¿Cuándo se paga el servicio?",
    respuesta:
      "El pago se realiza completo al momento de reservar. Así la cita queda confirmada, se evita el cobro presencial y se protege tanto a la clienta como a la Beluer.",
  },
  {
    pregunta: "¿Qué pasa después de reservar?",
    respuesta:
      "Una vez confirmado el pago, el sistema registra la reserva, coordina la asignación de la Beluer y activa las notificaciones por WhatsApp.",
  },
  {
    pregunta: "¿Qué servicios ofrece belu?",
    respuesta:
      "belu está especializada exclusivamente en lashes, cejas y nails. No es una app genérica de belleza; el foco está en servicios de alta recurrencia y detalle técnico.",
  },
  {
    pregunta: "¿Cómo funciona el retoque del día 21?",
    respuesta:
      "Después del servicio, belu puede enviarte un recordatorio automático cerca del día 21 para ayudarte a reservar tu próximo retoque sin volver a buscar desde cero.",
  },
];

export default function FaqClientas() {
  return (
    <section className="bg-white px-6 py-24 md:px-16 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#E60023]">
            Preguntas frecuentes ✦
          </p>

          <h2 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[#111111] md:text-7xl">
            Lo que debes saber antes de reservar.
          </h2>

          <p className="mt-6 max-w-lg text-base leading-7 text-black/60 md:text-lg">
            La experiencia belu está pensada para ser simple, segura y sin
            fricción. Estas son las dudas principales antes de tu primera cita.
          </p>

          <a
            href="/app/clienta"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-[#E60023] px-8 py-4 text-sm font-black text-white transition hover:bg-[#C4001D]"
          >
            Reservar ahora
          </a>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <article
              key={faq.pregunta}
              className="rounded-[1.8rem] border border-black/5 bg-[#F5EFE7] p-6 shadow-[0_14px_40px_rgba(0,0,0,0.04)]"
            >
              <div className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E60023] text-xs font-black text-white">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div>
                  <h3 className="text-xl font-black tracking-[-0.04em] text-[#111111]">
                    {faq.pregunta}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-black/55">
                    {faq.respuesta}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}