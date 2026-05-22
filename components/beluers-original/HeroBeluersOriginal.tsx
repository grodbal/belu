export default function HeroBeluersOriginal() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-img"></div>

      <div className="hero-content">
        <span className="hero-eyebrow">
          ✦ Plataforma exclusiva para especialistas · Lima
        </span>

        <div className="hero-slider-wrap">
          <div className="hero-slides" id="heroSlides">
            <div className="hs" id="hs0">
              DUPLICA TUS
              <br />
              <span className="red">SERVICIOS.</span>
            </div>
          </div>
        </div>

        <p className="hero-sub">
          La plataforma de belleza a domicilio diseñada exclusivamente para lash
          y nail artists en Lima. Tú pones el talento. Nosotros el sistema. Tú
          te llevas el dinero.
        </p>

        <div className="hero-ctas">
          <button className="btn-primary open-modal">
            Quiero aplicar como Beluer
          </button>

          <a href="#como-funciona" className="btn-ghost">
            ¿Cómo funciona?
          </a>
        </div>
      </div>
    </section>
  );
}