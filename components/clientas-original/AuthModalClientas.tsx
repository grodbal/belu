export default function AuthModalClientas() {
  return (
    <div className="auth-wrap" id="authWrap">
      <div className="auth-card">
        <div className="auth-visual">
          <div className="av-content">
            <div className="av-logo">
              belu<span> ✦</span>
            </div>
            <div className="av-title">
              El salón es ahora
              <br />
              tu sala de estar.
            </div>
          </div>
        </div>

        <div className="auth-form-side">
          <button className="auth-close" id="authClose">
            ✕
          </button>

          <div className="auth-tabs">
            <button className="auth-tab active" data-tab="login">
              Iniciar sesión
            </button>
            <button className="auth-tab" data-tab="register">
              Crear cuenta
            </button>
          </div>

          <div className="auth-panel show" id="panel-login">
            <div className="afg">
              <label>Correo electrónico</label>
              <input type="email" placeholder="tu@correo.com" />
            </div>

            <div className="afg">
              <label>Contraseña</label>
              <input type="password" placeholder="••••••••" />
            </div>

            <div style={{ textAlign: "right", marginTop: "-.5rem" }}>
              <a
                href="#"
                style={{
                  fontSize: ".7rem",
                  color: "var(--r)",
                  fontWeight: 600,
                  cursor: "none",
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button className="auth-btn">Entrar al panel</button>

            <p className="auth-meta">
              ¿No tienes cuenta?{" "}
              <a href="#" data-switch="register">
                Regístrate gratis →
              </a>
            </p>
          </div>

          <div className="auth-panel" id="panel-register">
            <div className="afg">
              <label>Nombre completo</label>
              <input type="text" placeholder="Tu nombre" />
            </div>

            <div className="afg">
              <label>Correo electrónico</label>
              <input type="email" placeholder="tu@correo.com" />
            </div>

            <div className="afg">
              <label>WhatsApp</label>
              <input type="tel" placeholder="+51 9XX XXX XXX" />
            </div>

            <div className="afg">
              <label>Contraseña</label>
              <input type="password" placeholder="Mínimo 8 caracteres" />
            </div>

            <button className="auth-btn" id="regBtn">
              Crear mi cuenta ✦
            </button>

            <p className="auth-meta">
              ¿Ya tienes cuenta?{" "}
              <a href="#" data-switch="login">
                Inicia sesión →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}