export default function ClientaPanelPage() {
  return (
    <main className="min-h-screen bg-[#F5EFE7] text-[#111111]">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-72 bg-white/80 border-r border-black/5 p-8 flex-col">
          <div className="text-3xl font-black tracking-[-0.05em] mb-12">
            belu<span className="text-[#E60023]"> ✦</span>
          </div>

          <nav className="flex flex-col gap-3 text-sm font-semibold text-black/60">
            <a className="bg-[#E60023]/10 text-[#E60023] px-4 py-3 rounded-2xl" href="#">
              Inicio
            </a>
            <a className="hover:text-[#E60023] px-4 py-3 rounded-2xl" href="#">
              Nueva reserva
            </a>
            <a className="hover:text-[#E60023] px-4 py-3 rounded-2xl" href="#">
              Especialistas
            </a>
            <a className="hover:text-[#E60023] px-4 py-3 rounded-2xl" href="#">
              Favoritas
            </a>
            <a className="hover:text-[#E60023] px-4 py-3 rounded-2xl" href="#">
              Historial
            </a>
            <a className="hover:text-[#E60023] px-4 py-3 rounded-2xl" href="#">
              Pagos
            </a>
            <a className="hover:text-[#E60023] px-4 py-3 rounded-2xl" href="#">
              Mi perfil
            </a>
          </nav>

          <a href="/" className="mt-auto text-sm text-black/40 hover:text-[#E60023]">
            ← Volver a somosbelu.pe
          </a>
        </aside>

        <section className="flex-1 p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-[-0.04em]">
                Bienvenida, María ✦
              </h1>
              <p className="text-black/50 mt-2">
                Aún no tienes reservas activas.
              </p>
            </div>

            <div className="bg-white px-5 py-3 rounded-full font-semibold shadow-sm">
              MC · María Claudia
            </div>
          </div>

          <div className="bg-white/80 rounded-[2rem] p-8 md:p-12 text-center shadow-sm border border-white">
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.05em] mb-5">
              No tienes ninguna reserva activa.
            </h2>

            <p className="max-w-xl mx-auto text-black/60 mb-8">
              Tu brillo no espera. Agenda tu próximo servicio de lashes o nails
              con una Beluer verificada.
            </p>

            <button className="bg-[#E60023] text-white px-8 py-4 rounded-full font-bold hover:bg-[#C4001D] transition">
              Agendar mi primera cita ✦
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-5 mt-8">
            <div className="bg-white/80 rounded-3xl p-6 border border-white shadow-sm">
              <h3 className="font-black text-lg mb-2">Especialistas</h3>
              <p className="text-sm text-black/50 mb-5">
                Conoce a nuestras Beluers verificadas.
              </p>
              <button className="text-sm font-bold text-[#E60023]">
                Ver especialistas →
              </button>
            </div>

            <div className="bg-white/80 rounded-3xl p-6 border border-white shadow-sm">
              <h3 className="font-black text-lg mb-2">Favoritas</h3>
              <p className="text-sm text-black/50 mb-5">
                Accede rápido a las especialistas que más te gustan.
              </p>
              <button className="text-sm font-bold text-[#E60023]">
                Ver favoritas →
              </button>
            </div>

            <div className="bg-white/80 rounded-3xl p-6 border border-white shadow-sm">
              <h3 className="font-black text-lg mb-2">Historial</h3>
              <p className="text-sm text-black/50 mb-5">
                Revisa tus citas y resultados anteriores.
              </p>
              <button className="text-sm font-bold text-[#E60023]">
                Ver historial →
              </button>
            </div>

            <div className="bg-white/80 rounded-3xl p-6 border border-white shadow-sm">
              <h3 className="font-black text-lg mb-2">Pagos</h3>
              <p className="text-sm text-black/50 mb-5">
                Consulta tus pagos y reservas confirmadas.
              </p>
              <button className="text-sm font-bold text-[#E60023]">
                Ver pagos →
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}