export default function TestimoniosClientasOriginal() {
  return (
    <section className="sec-testi" id="testimonios">
      <div className="blob-bg"></div>

      <div
        className="rev"
        style={{ textAlign: "center", position: "relative", zIndex: 2 }}
      >
        <p className="s-ey" style={{ textAlign: "center" }}>
          ✦ Casos de éxito
        </p>

        <h2 className="s-t" style={{ marginBottom: ".5rem" }}>
          El estándar belu.
        </h2>

        <p className="s-b" style={{ margin: "0 auto 1.5rem" }}>
          No escuches lo que decimos. Mira los resultados.
        </p>
      </div>

      <div className="testi-grid">
        <div className="testi-card rev d1">
          <img
            className="testi-result-photo"
            src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&h=200&q=85"
            alt="Resultado"
          />

          <div className="testi-body">
            <div className="testi-stars">★★★★★</div>

            <p className="testi-text">
              &quot;Reservé a las 8pm y mi Beluer llegó al día siguiente. Las
              uñas quedaron increíbles y no salí de mi casa. Literalmente no
              puedo volver al salón tradicional.&quot;
            </p>

            <div className="testi-author">
              <div className="testi-av" style={{ background: "var(--r)" }}>
                MC
              </div>

              <div>
                <div className="testi-name">María Claudia R.</div>
                <div className="testi-district">Miraflores</div>
              </div>
            </div>
          </div>
        </div>

        <div className="testi-card rev d2">
          <img
            className="testi-result-photo"
            src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=600&h=200&q=85"
            alt="Resultado"
          />

          <div className="testi-body">
            <div className="testi-stars">★★★★★</div>

            <p className="testi-text">
              &quot;Lo que más me sorprendió fue recibir el DNI de la Beluer 60
              min antes. Esa confianza es brutal. Ya agendé mi tercer retoque
              con la misma especialista.&quot;
            </p>

            <div className="testi-author">
              <div className="testi-av" style={{ background: "var(--azul)" }}>
                AV
              </div>

              <div>
                <div className="testi-name">Alejandra V.</div>
                <div className="testi-district">San Isidro</div>
              </div>
            </div>
          </div>
        </div>

        <div className="testi-card rev d3">
          <img
            className="testi-result-photo"
            src="https://images.unsplash.com/photo-1604655906351-d8ca39e7ee43?auto=format&fit=crop&w=600&h=200&q=85"
            alt="Resultado"
          />

          <div className="testi-body">
            <div className="testi-stars">★★★★★</div>

            <p className="testi-text">
              &quot;Antes perdía toda la mañana entre ir, esperar y volver. Con
              belu trabajo desde casa mientras me hacen las pestañas. Es
              exactamente lo que necesitaba.&quot;
            </p>

            <div className="testi-author">
              <div className="testi-av" style={{ background: "var(--negro)" }}>
                LS
              </div>

              <div>
                <div className="testi-name">Luciana S.</div>
                <div className="testi-district">Surco</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}