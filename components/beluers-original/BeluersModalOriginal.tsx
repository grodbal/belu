export default function BeluersModalOriginal() {
  return (
    <div className="modal-wrap" id="modalWrap">
      <div className="modal-card">
        <div className="modal-visual">
          <div className="mv-content">
            <div className="mv-tag">Filtro de Élite</div>

            <div className="mv-title">
              ¿ERES DEL
              <br />
              15%?
            </div>

            <p className="mv-desc">
              Solo aceptamos a 15 de cada 100 especialistas que aplican. No
              buscamos cantidad, buscamos obsesión por el detalle.
              <br />
              <br />
              Si tu trabajo habla por sí solo, este es tu lugar.
            </p>
          </div>
        </div>

        <div className="modal-form-side">
          <button className="modal-close" id="modalClose">
            ✕
          </button>

          <div className="modal-form-title">
            Inicia tu postulación <em>✦</em>
          </div>

          <div className="modal-form-sub">
            Revisaremos tu portafolio en 48 hrs. Solo perfiles Premium.
          </div>

          <form className="mform" id="modalForm">
            <div className="mfg full">
              <label>Tu Nombre Artístico (o Real)</label>
              <input
                type="text"
                placeholder="¿Cómo te conocen tus clientas?"
                required
              />
            </div>

            <div className="mfg">
              <label>WhatsApp Directo</label>
              <input type="tel" placeholder="+51 9XX XXX XXX" required />
            </div>

            <div className="mfg">
              <label>Magia principal</label>
              <select required defaultValue="">
                <option value="" disabled>
                  Elige tu arte
                </option>
                <option>Solo Lashes</option>
                <option>Solo Nails</option>
                <option>Dominio en Ambas</option>
              </select>
            </div>

            <div className="mfg">
              <label>Experiencia real</label>
              <select required defaultValue="">
                <option value="" disabled>
                  Sé honesta
                </option>
                <option>Menos de 1 año</option>
                <option>1 a 3 años</option>
                <option>3 a 5 años</option>
                <option>Nivel Master (+5 años)</option>
              </select>
            </div>

            <div className="mfg">
              <label>Zonas de dominio</label>
              <input
                type="text"
                placeholder="Ej: Miraflores, San Isidro..."
                required
              />
            </div>

            <div className="mfg full">
              <label>Instagram (Tu carta de presentación)</label>
              <input
                type="text"
                placeholder="@tu_usuario_profesional"
                required
              />
            </div>

            <button type="submit" className="mbtn">
              Acepto el Reto ✦
            </button>

            <p className="mdis">
              Al aplicar, aceptas que evaluaremos tu perfil bajo nuestros
              estándares de calidad editorial.
            </p>
          </form>

          <div className="modal-success" id="modalSuccess">
            <span className="ms-ico">✦</span>
            <h3>Aplicación en Revisión</h3>
            <p>
              Nuestro equipo de curaduría analizará tu arte. Si tienes el nivel
              belu, recibirás un WhatsApp en las próximas 48 horas con tu código
              de acceso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}