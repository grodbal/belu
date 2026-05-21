    export default function PlataformaClientasOriginal() {
  return (
    <section className="sec sec-platform" id="plataforma">
      <div className="plat-split">
        <div className="rev-l">
          <p className="s-ey">✦ Tu espacio belu</p>

          <h2 className="plat-hook">
            Reserva hoy.
            <br />
            <em>Luce increíble siempre.</em>
          </h2>

          <p className="s-b">
            Tu cuenta belu no es solo para reservar, es el centro de control de
            tu belleza. Todo tu historial y seguimientos en un solo lugar.
          </p>

          <div className="plat-features">
            <div className="pf">
              <div className="pf-dot"></div>
              <p>
                <strong>Historial visual</strong> de todas tus citas y los
                resultados fotográficos.
              </p>
            </div>

            <div className="pf">
              <div className="pf-dot"></div>
              <p>
                <strong>Recordatorio Día 21</strong> automatizado. Nunca más
                perderás el timing perfecto de tu retoque.
              </p>
            </div>

            <div className="pf">
              <div className="pf-dot"></div>
              <p>
                <strong>Gestión de favoritas</strong> para agendar directamente
                con la especialista que amas.
              </p>
            </div>
          </div>

          <button
            className="btn-dark open-auth"
            data-tab="register"
            style={{ marginTop: "1rem" }}
          >
            Crear mi cuenta gratis
          </button>
        </div>

        <div className="rev-r">
          <div className="app-mockup-wrapper">
            <div className="app-mockup">
              <div className="mock-top-bar">
                <div className="mock-logo-sm">
                  belu<span className="dot"> ✦</span>
                </div>

                <div className="mock-avatar">
                  <img
                    src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=100&q=85"
                    alt="Perfil"
                  />
                </div>
              </div>

              <div className="mock-greeting">Bienvenida, María</div>
              <div className="mock-name-text">Tu próxima reserva</div>

              <div className="mock-appt">
                <div className="mock-appt-ico">✦</div>
                <div>
                  <div className="mock-appt-label">CONFIRMADA · 14:00</div>
                  <div className="mock-appt-title">Acrílico Sculpted</div>
                  <div className="mock-appt-detail">
                    Especialista: Andrea R.
                  </div>
                </div>
              </div>

              <div className="mock-services">
                <div className="mock-svc-card">
                  <div className="mock-svc-img">
                    <img
                      src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=300&q=85"
                      alt="Lashes"
                    />
                  </div>
                  <div className="mock-svc-name">Lashes</div>
                  <div className="mock-svc-price">S/. 90 Fijo</div>
                </div>

                <div className="mock-svc-card">
                  <div className="mock-svc-img">
                    <img
                      src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=300&q=85"
                      alt="Nails"
                    />
                  </div>
                  <div className="mock-svc-name">Nails</div>
                  <div className="mock-svc-price">S/. 65 Fijo</div>
                </div>
              </div>

              <button className="mock-cta">Reservar nueva cita ✦</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}