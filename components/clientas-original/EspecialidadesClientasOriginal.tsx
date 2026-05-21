export default function EspecialidadesClientasOriginal() {
  return (
    <section className="sec sec-services" id="servicios">
      <div className="rev" style={{ position: "relative", zIndex: 2 }}>
        <p className="s-ey">✦ Especialidades</p>
        <h2 className="s-t">
          Dos especialidades.
          <br />
          Una plataforma de élite.
        </h2>
        <p className="s-b">
          Precios fijos y resultados impecables. Selecciona tu servicio y
          nosotros nos encargamos del resto.
        </p>
      </div>

      <div className="svc-grid">
        <div className="svc-card rev-l">
          <img
            src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=85"
            alt="Lashes"
          />

          <div className="svc-overlay">
            <span className="svc-cat">Especialidad</span>
            <div className="svc-name">LASHES</div>
          </div>

          <div className="svc-hover-overlay">
            <div className="svc-hover-title">
              Extensiones
              <br />
              de Pestañas
            </div>

            <ul className="svc-hover-list">
              <li>Extensiones Classic</li>
              <li>Extensiones Volume</li>
              <li>Mega Volume</li>
              <li>Lifting de pestañas</li>
            </ul>

            <button className="svc-hover-cta open-auth" data-tab="register">
              Reservar ahora
            </button>
          </div>
        </div>

        <div className="svc-card rev-r">
          <img
            src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85"
            alt="Nails"
          />

          <div className="svc-overlay">
            <span className="svc-cat">Especialidad</span>
            <div className="svc-name">NAILS</div>
          </div>

          <div className="svc-hover-overlay">
            <div className="svc-hover-title">
              Nail Art
              <br />& Manicure
            </div>

            <ul className="svc-hover-list">
              <li>Semipermanente</li>
              <li>Acrílico Sculpted</li>
              <li>Nail Art Premium</li>
              <li>Retoque y Cuidado</li>
            </ul>

            <button className="svc-hover-cta open-auth" data-tab="register">
              Reservar ahora
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}