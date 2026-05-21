export default function CoberturaClientasOriginal() {
  return (
    <section className="sec-districts">
      <div className="sd-bg-text">LIMA TOP</div>

      <div className="sd-content rev">
        <p className="s-ey">✦ Cobertura exclusiva</p>

        <h2 className="s-t">
          Conocemos cada ruta,
          <br />
          cada distrito, cada calle.
        </h2>

        <p className="sub">
          Operamos en los principales distritos premium de Lima para garantizar
          puntualidad y respuesta rápida. Explora el mapa y descubre nuestra
          cobertura.
        </p>
      </div>

      <div className="map-container rev">
        <div className="map-header-bar">
          <div className="map-title-text">
            LIMA METROPOLITANA · <strong>DISTRITOS PREMIUM</strong>
          </div>

          <div className="map-status-pill">EN OPERACIÓN</div>
        </div>

        <div id="lima-map"></div>

        <div className="map-legend-box">
          <span className="legend-dot"></span>
          <span>Distrito cubierto</span>
          <span className="legend-divider"></span>
          <span>7 zonas activas</span>
        </div>
      </div>

      <div className="districts-cards">
        <div className="dist-card rev d1">
          <div className="dist-card-pin"></div>
          <div>
            <h4>Miraflores</h4>
            <p>Cobertura prioritaria</p>
          </div>
        </div>

        <div className="dist-card rev d2">
          <div className="dist-card-pin"></div>
          <div>
            <h4>San Isidro</h4>
            <p>Cobertura prioritaria</p>
          </div>
        </div>

        <div className="dist-card rev d3">
          <div className="dist-card-pin"></div>
          <div>
            <h4>Santiago de Surco</h4>
            <p>Zona activa</p>
          </div>
        </div>

        <div className="dist-card rev d2">
          <div className="dist-card-pin"></div>
          <div>
            <h4>Monterrico</h4>
            <p>Zona residencial activa</p>
          </div>
        </div>

        <div className="dist-card rev d4">
          <div className="dist-card-pin"></div>
          <div>
            <h4>La Molina</h4>
            <p>Zona activa</p>
          </div>
        </div>

        <div className="dist-card rev d1">
          <div className="dist-card-pin"></div>
          <div>
            <h4>Barranco</h4>
            <p>Zona activa</p>
          </div>
        </div>

        <div className="dist-card rev d2">
          <div className="dist-card-pin"></div>
          <div>
            <h4>San Borja</h4>
            <p>Zona activa</p>
          </div>
        </div>

        <div className="dist-card rev d3">
          <div className="dist-card-pin"></div>
          <div>
            <h4>San Miguel</h4>
            <p>Zona activa</p>
          </div>
        </div>

        <div className="dist-card rev d4">
          <div className="dist-card-pin"></div>
          <div>
            <h4>Pueblo Libre</h4>
            <p>Zona activa</p>
          </div>
        </div>

        <div className="dist-card rev d3">
          <div className="dist-card-pin"></div>
          <div>
            <h4>Magdalena</h4>
            <p>Zona activa</p>
          </div>
        </div>
      </div>
    </section>
  );
}