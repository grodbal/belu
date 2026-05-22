export default function ComoFuncionaBeluersOriginal() {
  return (
    <section className="sec sec-como" id="como-funciona">
      <p className="s-ey">✦ Cómo funciona</p>

      <h2 className="s-t">El sistema que trabaja por ti.</h2>

      <div className="steps">
        <div className="step-card rev d1">
          <div className="step-img">
            <img
              src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=85"
              alt="Notificación de reserva en WhatsApp"
              loading="lazy"
            />
          </div>

          <div className="step-body">
            <div className="step-n">01</div>
            <h3>La reserva llega a tu canal</h3>
            <p>
              Cuando una clienta agenda, la reserva aparece en el canal privado
              de Beluers en WhatsApp: servicio, dirección, hora y monto.
            </p>
            <span className="step-tag">⚡ Tiempo real</span>
          </div>
        </div>

        <div className="step-card rev d2">
          <div className="step-img">
            <img
              src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=600&q=85"
              alt="Beluer confirmando servicio"
              loading="lazy"
            />
          </div>

          <div className="step-body">
            <div className="step-n">02</div>
            <h3>Tú decides si la tomas</h3>
            <p>
              Dentro de nuestra cobertura premium, cuando llega una reserva, la
              primera en aceptar se la lleva. Así priorizas los servicios que
              mejor se ajusten a tu disponibilidad.
            </p>
            <span className="step-tag">✓ Autonomía total</span>
          </div>
        </div>

        <div className="step-card rev d3">
          <div className="step-img">
            <img
              src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=600&q=85"
              alt="Beluer entregando servicio de élite"
              loading="lazy"
            />
          </div>

          <div className="step-body">
            <div className="step-n">03</div>
            <h3>Entrega la experiencia belu</h3>
            <p>
              Llegas, esterilizas frente a la clienta, activas el soundscape
              belu. El resultado impecable construye tu reputación.
            </p>
            <span className="step-tag">✦ Sello belu</span>
          </div>
        </div>

        <div className="step-card rev d4">
          <div className="step-img">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=85"
              alt="Recordatorio automático día 21"
              loading="lazy"
            />
          </div>

          <div className="step-body">
            <div className="step-n">04</div>
            <h3>El día 21 trabaja por ti</h3>
            <p>
              A los 21 días, la clienta recibe su recordatorio de retoque
              automático. Sin que hagas nada, la recurrencia está asegurada.
            </p>
            <span className="step-tag">↺ Automatizado</span>
          </div>
        </div>
      </div>
    </section>
  );
}