export default function SeguridadClientasOriginal() {
  return (
    <section className="sec-security" id="seguridad">
      <div className="sec-sec-hero">
        <div className="sec-sec-bg"></div>

        <div className="sec-sec-content">
          <p className="s-ey" style={{ color: "var(--rosa)" }}>
            ✦ Nuestro estándar de calidad
          </p>

          <div className="sec-stat">
            15<span>%</span>
          </div>

          <div className="sec-stat-label">
            Solo el 15% más preparado
            <br />
            supera nuestro proceso de selección.
          </div>

          <p className="sec-stat-sub">
            Cada especialista belu pasa por una verificación rigurosa:
            identidad validada, habilidades comprobadas y un compromiso
            inquebrantable con tu seguridad. Nuestras beluers, listas para
            consentirte en casa.
          </p>
        </div>
      </div>

      <div className="sec-pillars">
        <div className="sp rev d1" data-n="01">
          <span className="sp-ico">◎ Identidad</span>
          <h3>Validación cruzada</h3>
          <p>
            Nadie entra a tu hogar siendo un extraño. Recibes el DNI y foto de
            la especialista 60 minutos antes de tu cita.
          </p>
        </div>

        <div className="sp rev d2" data-n="02">
          <span className="sp-ico">✦ Calidad</span>
          <h3>Sello de excelencia</h3>
          <p>
            Exigimos experiencia comprobada, limpieza clínica estricta y
            habilidades técnicas del más alto nivel.
          </p>
        </div>

        <div className="sp rev d3" data-n="03">
          <span className="sp-ico">⚆ Protección</span>
          <h3>Kit sellado y seguro</h3>
          <p>
            Tu Beluer abre herramientas esterilizadas frente a ti. La
            bioseguridad en el hogar ya no es opcional.
          </p>
        </div>
      </div>
    </section>
  );
}