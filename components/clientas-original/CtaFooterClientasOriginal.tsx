export default function CtaFooterClientasOriginal() {
  return (
    <div className="cta-footer-wrap">
      <section className="sec-cta-final">
        <div className="rev">
          <h2 className="cta-huge">
            EL SALÓN
            <br />
            ES AHORA <span>TU SALA.</span>
          </h2>

          <p className="cta-sub">
            Deja de perder horas en el tráfico y en salas de espera. Únete a la
            nueva era de la belleza on-demand con la élite de especialistas de
            Lima.
          </p>

          <button
            className="btn-r open-auth"
            data-tab="register"
            style={{ fontSize: "1.1rem", padding: "1.2rem 3rem" }}
          >
            Crear mi cuenta y reservar
          </button>
        </div>
      </section>

      <footer className="footer" id="contacto">
        <div className="footer-grid">
          <div className="rev-l">
            <div className="footer-brand-logo">
  <img src="/logo-belu-white.png" alt="belu" className="footer-logo-img" />
</div>

            <p className="footer-tagline">
              luce increíble,
              <br />
              cuando quieras.
            </p>

            <p className="footer-desc">
              El agregador de belleza a domicilio más exclusivo de Lima. Lash y
              nail artists verificadas, en tu casa, en tu hora.
            </p>
          </div>

          <div className="footer-col rev d1">
            <h4>Catálogo</h4>
            <ul>
              <li><a href="#">Lashes Classic & Volume</a></li>
              <li><a href="#">Mega Volume</a></li>
              <li><a href="#">Lifting de Pestañas</a></li>
              <li><a href="#">Nails Semipermanente</a></li>
              <li><a href="#">Acrílico & Nail Art</a></li>
            </ul>
          </div>

          <div className="footer-col rev d2">
            <h4>Cobertura</h4>
            <ul>
              <li><a href="#">Miraflores</a></li>
              <li><a href="#">San Isidro</a></li>
              <li><a href="#">Surco</a></li>
              <li><a href="#">La Molina</a></li>
              <li><a href="#">Barranco</a></li>
            </ul>
          </div>

          <div className="footer-col rev d3">
            <h4>belu</h4>
            <ul>
              <li><a href="#seguridad">Seguridad</a></li>
              <li><a href="#promesa">Garantía Belu Redo</a></li>
              <li><a href="#faq">Preguntas frecuentes</a></li>
              <li><a href="/beluers">Soy Beluer</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="fbb-logo">
  <img src="/ICONO-FOOTER.png" alt="belu" className="footer-mini-logo-img" />
</div>

          <p className="fbb-copy">© 2026 belu. Todos los derechos reservados.</p>

          <div className="fbb-links">
            <a href="#">Términos</a>
            <a href="#">Privacidad</a>
            <a href="#">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}