export default function SolucionBeluersOriginal() {
  return (
    <section className="sec sec-sol" id="solucion">
      <div className="sol-hdr rev">
        <p className="s-ey">✦ La solución</p>

        <h2 className="s-t">
          Con belu, te mueves menos.
          <br />Y ganas el doble.
        </h2>

        <p className="s-b">
          Belu concentra sus operaciones exclusivamente en las zonas premium y de
          mayor poder adquisitivo de Lima. Tu próxima clienta siempre está a una
          distancia razonable.
        </p>
      </div>

      <div className="comp-outer rev">
        <div className="comp-side bef">
          <span className="comp-tag">Sin belu</span>

          <div className="comp-row">
            <div className="comp-num count-num" data-val="2">
              0
            </div>
            <div className="comp-lbl">servicios por día</div>
          </div>

          <div className="comp-row">
            <div className="comp-num count-num" data-val="130" data-prefix="S/. ">
              S/. 0
            </div>
            <div className="comp-lbl">ingreso diario</div>
          </div>

          <div className="comp-row">
            <div className="comp-txt">Toda Lima</div>
            <div className="comp-lbl">viajes largos y desgastantes</div>
          </div>

          <div className="comp-bar-wrap">
            <div className="comp-bar-label">Eficiencia de jornada</div>
            <div className="comp-bar">
              <div className="comp-bar-fill" data-width="32%"></div>
            </div>
          </div>
        </div>

        <div className="comp-divider">
          <span className="vs-pill">VS</span>
        </div>

        <div className="comp-side aft">
          <span className="comp-tag">✦ Con belu</span>

          <div className="comp-row">
            <div className="comp-num count-num" data-val="4">
              0
            </div>
            <div className="comp-lbl">servicios por día</div>
          </div>

          <div className="comp-row">
            <div className="comp-num count-num" data-val="260" data-prefix="S/. ">
              S/. 0
            </div>
            <div className="comp-lbl">ingreso diario</div>
          </div>

          <div className="comp-row">
            <div className="comp-txt">Tu Zona</div>
            <div className="comp-lbl">rutas cortas en distritos top</div>
          </div>

          <div className="comp-bar-wrap">
            <div className="comp-bar-label">Eficiencia de jornada</div>
            <div className="comp-bar">
              <div className="comp-bar-fill" data-width="95%"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}