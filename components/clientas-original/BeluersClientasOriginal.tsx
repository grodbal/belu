export default function BeluersClientasOriginal() {
  return (
    <section className="sec sec-beluers">
      <div className="rev">
        <p className="s-ey">✦ Catálogo de élite</p>
        <h2 className="s-t">Elige con quién brillar.</h2>
        <p className="s-b">
          Solo el 15% aprueba nuestro filtro técnico. Explora sus perfiles y
          elige tu favorita.
        </p>
        <p className="scroll-indicator">Desliza para ver más →</p>
      </div>

      <div className="beluer-grid rev">
        <div className="bc-card">
          <div className="bc-img">
            <div className="bc-tag-top">Disponible</div>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80"
              alt="Beluer"
            />
          </div>

          <div className="bc-info">
            <h4>Andrea Robles</h4>
            <span className="bc-spec">Master Lash Artist</span>

            <ul className="bc-tags">
              <li>
                <i>✦</i> Verificada con DNI
              </li>
              <li>
                <i>★</i> Calificación: 5.0
              </li>
              <li>
                <i>◎</i> En belu desde 2025
              </li>
            </ul>
          </div>
        </div>

        <div className="bc-card">
          <div className="bc-img">
            <div className="bc-tag-top">Disponible</div>
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80"
              alt="Beluer"
            />
          </div>

          <div className="bc-info">
            <h4>Camila V.</h4>
            <span className="bc-spec">Nail Art Specialist</span>

            <ul className="bc-tags">
              <li>
                <i>✦</i> Verificada con DNI
              </li>
              <li>
                <i>★</i> Calificación: 4.9
              </li>
              <li>
                <i>◎</i> 120+ citas completadas
              </li>
            </ul>
          </div>
        </div>

        <div className="bc-card">
          <div className="bc-img">
            <div className="bc-tag-top">Disponible</div>
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80"
              alt="Beluer"
            />
          </div>

          <div className="bc-info">
            <h4>Sofía T.</h4>
            <span className="bc-spec">Lashes & Brows</span>

            <ul className="bc-tags">
              <li>
                <i>✦</i> Verificada con DNI
              </li>
              <li>
                <i>★</i> Calificación: 5.0
              </li>
              <li>
                <i>◎</i> Especialista Premium
              </li>
            </ul>
          </div>
        </div>

        <div
          className="bc-card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            boxShadow: "none",
            border: "none",
          }}
        >
          <button
            className="btn-ghost open-auth"
            data-tab="register"
            style={{
              borderColor: "var(--negro)",
              color: "var(--negro)",
            }}
          >
            Ver 45+ Beluers ✦
          </button>
        </div>
      </div>
    </section>
  );
}