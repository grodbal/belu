export default function CalculadoraBeluersOriginal() {
  return (
    <section className="sec-calc" id="calculadora">
      <div className="calc-bg"></div>

      <div className="calc-inner">
        <p className="s-ey">✦ Calculadora</p>

        <h2 className="s-t">
          ¿Cuánto ingreso EXTRA
          <br />
          te genera belu?
        </h2>

        <p className="s-b">
          Mueve los sliders y proyecta tu crecimiento con las clientas nuevas
          que te llevamos.
        </p>

        <div className="calc-grid">
          <div className="rev-l">
            <div className="cf">
              <div className="cl">
                <span>Nuevos servicios generados por semana</span>
                <strong id="svcVal">20</strong>
              </div>

              <input
                type="range"
                id="svcSlider"
                min="4"
                max="40"
                defaultValue="20"
                step="1"
              />
            </div>

            <div className="cf">
              <div className="cl">
                <span>Tu tarifa promedio final</span>
                <strong id="ticketVal">S/. 80</strong>
              </div>

              <input
                type="range"
                id="ticketSlider"
                min="50"
                max="200"
                defaultValue="80"
                step="5"
              />
            </div>

            <p className="calc-note-txt">
              Comisión justa y transparente: Sin cobros ocultos ni
              mensualidades. Los detalles exactos de nuestro porcentaje, que es
              el más competitivo del mercado, los revisamos contigo en la
              entrevista.
            </p>
          </div>

          <div className="calc-card rev-r">
            <p className="cc-label">Proyección de ingresos EXTRA · 4 semanas</p>

            <div className="cc-row">
              <span className="cc-rl">Ingresos brutos proyectados</span>
              <span className="cc-rv" id="rBruto">
                S/. 6,400
              </span>
            </div>

            <div className="cc-row big">
              <span className="cc-rl">Tu ingreso neto estimado</span>
              <span className="cc-rv" id="rNeto">
                S/. 5,744
              </span>
            </div>

            <div className="cc-note">
              <strong>Sin exclusividad:</strong> Tú tienes el control de tu
              agenda y decides cuándo y cuánto trabajar.
              <br />
              <br />
              <em>
                * Nota: El ingreso neto mostrado incluye nuestra comisión base,
                a la cual ya le hemos sumado a tu favor el{" "}
                <strong>Bono de Cercanía</strong>. ¡En tu entrevista verás cómo
                este bono hace que tu comisión efectiva sea mucho más baja que
                el promedio del mercado!
              </em>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}