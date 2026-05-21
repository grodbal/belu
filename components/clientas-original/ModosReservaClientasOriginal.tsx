export default function ModosReservaClientasOriginal() {
  return (
    <section className="sec sec-how" id="como">
      <div className="rev" style={{ textAlign: "center" }}>
        <p className="s-ey" style={{ textAlign: "center" }}>
          ✦ Cero fatiga de decisión
        </p>

        <h2
          className="s-t"
          style={{
            textAlign: "center",
            maxWidth: "700px",
            margin: "0 auto 1rem",
          }}
        >
          Reserva a tu manera.
          <br />
          Tú tienes el control.
        </h2>

        <p className="s-b" style={{ margin: "0 auto", textAlign: "center" }}>
          Elige la vía rápida y deja que nuestra tecnología asigne, o tómate tu
          tiempo y selecciona a tu especialista favorita.
        </p>
      </div>

      <div className="modes-container">
        <div className="mode-card m1 rev-l">
          <div className="mode-card-bg"></div>

          <div className="mode-content">
            <div className="mode-ico">01.</div>

            <h3>Modo Gestionado</h3>

            <p>La vía más rápida. Ideal si valoras tu tiempo por encima de todo.</p>

            <ul className="mode-steps">
              <li>Eliges tu servicio, fecha y hora ideal.</li>
              <li>Publicamos tu solicitud en nuestro canal interno de Beluers.</li>
              <li>La primera especialista disponible en tu zona acepta.</li>
              <li>Confirmación inmediata con los datos de tu Beluer.</li>
            </ul>
          </div>
        </div>

        <div className="mode-card m2 rev-r">
          <div className="mode-card-bg"></div>

          <div className="mode-content">
            <div className="mode-ico">02.</div>

            <h3>Modo Libre</h3>

            <p>Para quienes prefieren explorar portafolios y elegir a la indicada.</p>

            <ul className="mode-steps">
              <li>Revisas el catálogo de Beluers verificadas.</li>
              <li>Ves sus especialidades, calificaciones y fotos de trabajos.</li>
              <li>Eliges a tu especialista favorita.</li>
              <li>Reservas directamente según su disponibilidad.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}