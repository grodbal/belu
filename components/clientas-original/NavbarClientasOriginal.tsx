export default function NavbarClientasOriginal() {
  return (
    <nav id="mainNav">
      <a href="#inicio" className="nav-logo" aria-label="Ir al inicio">
  <img
    src="/logo-belu-white.png"
    alt="belu"
    className="belu-logo-img logo-white"
  />

  <img
    src="/logo-belu-red.png"
    alt="belu"
    className="belu-logo-img logo-red"
  />
</a>

      <div className="nav-right">
        <button className="nav-login open-auth" data-tab="login">
          Mi cuenta
        </button>

        <button className="nav-reservar open-auth" data-tab="register">
          Reservar
        </button>
      </div>
    </nav>
  );
}