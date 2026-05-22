export default function ProblemaBeluersOriginal() {
  return (
    <section className="sec sec-prob" id="problema">
      <div className="split">
        <div className="rev-l">
          <p className="s-ey">✦ El problema</p>

          <h2 className="s-t">
            Tienes el talento.
            <br />
            Te falta el sistema.
          </h2>

          <p className="s-b">
            El 80% de las especialistas en Lima trabaja el doble de lo que
            debería para ganar la mitad de lo que podría. No es falta de
            habilidad — es falta de estructura.
          </p>

          <div className="pain-list">
            <div className="pain-i">
              <div className="pain-ic">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>

              <div>
                <h4>Horas perdidas en tráfico de Lima</h4>
                <p>
                  Vas de Surco a Barranco, luego a San Borja. 40–60 minutos por
                  servicio que te restan 2 citas diarias y te desgastan
                  físicamente.
                </p>
              </div>
            </div>

            <div className="pain-i">
              <div className="pain-ic">
                <svg viewBox="0 0 24 24">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>

              <div>
                <h4>Ingresos irregulares, semanas vacías</h4>
                <p>
                  Sin sistema de reservas activo, sin recordatorios automáticos,
                  tu cartera de clientas crece o se cae dependiendo de cuánto
                  tiempo tengas para hacer marketing.
                </p>
              </div>
            </div>

            <div className="pain-i">
              <div className="pain-ic">
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>

              <div>
                <h4>Gestionas todo por WhatsApp</h4>
                <p>
                  Confirmaciones manuales, cobros en efectivo, sin historial de
                  clientas. No eres dueña de tu negocio — eres esclava de tu
                  teléfono.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rev-r">
          <div className="img-frame img-frame-h">
            <img
              src="https://images.unsplash.com/photo-1541199249251-f713e6145474?auto=format&fit=crop&w=800&q=85"
              alt="Especialista con problemas de gestión"
            />

            <div className="img-badge">
              <div className="ib-n">S/. 2,860</div>
              <div className="ib-l">
                ingreso mensual promedio sin estructura ni sistema
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}