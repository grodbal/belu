export default function GarantiaClientasOriginal() {
  return (
    <section className="sec sec-garantia" id="promesa">
      <div className="grt-split">
        <div className="grt-img rev-l">
          <img
            src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=85"
            alt="Garantía"
          />

          <span className="grt-img-label">✦ Belu Redo</span>
        </div>

        <div className="rev-r">
          <p className="s-ey">✦ Nuestra promesa</p>

          <h2 className="grt-quote">
            &quot;Si el resultado no es óptimo,
            <br />
            <em>lo repetimos en 24 horas.*</em>&quot;
          </h2>

          <div className="grt-items">
            <div className="gi">
              <div className="gi-ico">✦</div>
              <div>
                <h4>Garantía Técnica</h4>
                <p>
                  Respaldamos la calidad de cada servicio. Si algo no está a la
                  altura de nuestros estándares, lo solucionamos.
                </p>
              </div>
            </div>

            <div className="gi">
              <div className="gi-ico">◎</div>
              <div>
                <h4>Spa portátil de élite</h4>
                <p>
                  Llega con su kit completo, esteriliza frente a ti, activa el
                  soundscape belu y deja todo impecable.
                </p>
              </div>
            </div>

            <div className="gi">
              <div className="gi-ico">⚆</div>
              <div>
                <h4>Tu privacidad intacta</h4>
                <p>
                  Sin salas de espera. Sin ruidos molestos. Solo tú, en tu
                  espacio, exactamente como quieres.
                </p>
              </div>
            </div>
          </div>

          <button className="btn-r open-auth" data-tab="register">
            Reservar con garantía ✦
          </button>

          <p className="legal-disclaimer">
            * La garantía Belu Redo aplica exclusivamente para fallas técnicas
            objetivas (ej. desprendimiento prematuro inusual) reportadas dentro
            de las primeras 24 horas posteriores al servicio. No aplica por
            cambio de opinión sobre el diseño una vez validado. Aplican términos
            y condiciones.
          </p>
        </div>
      </div>
    </section>
  );
}