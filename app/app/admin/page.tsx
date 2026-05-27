import LogoutButton from "@/components/auth/LogoutButton";
import AdminPanelOriginalPage from "@/components/admin-panel-original/AdminPanelOriginalPage";
import CreateBeluerForm from "@/components/admin-panel-original/CreateBeluerForm";
import AdminBeluersRealList from "@/components/admin-panel-original/AdminBeluersRealList";

export default function AdminPage() {
  return (
    <>
      <AdminPanelOriginalPage
        beluersManagementSlot={<BeluersManagementSection />}
      />

      <LogoutButton className="fixed right-6 bottom-6 z-50 rounded-full bg-[#e60023] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#c4001d]" />
    </>
  );
}

function BeluersManagementSection() {
  return (
    <section className="admin-panel-section active">
      <div className="admin-panel-top-bar">
        <div className="admin-panel-greeting">
          <h1>Gestión de Beluers ✦</h1>
          <p>
            Crea, valida y administra a las especialistas aprobadas por belu.
          </p>
        </div>

        <div className="admin-panel-pill">Base real</div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
          <div className="mb-6">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#e60023]">
              Admin
            </p>

            <h2 className="text-2xl font-black text-[#1a1a1a]">
              Crear nueva Beluer
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              Este formulario crea el usuario en Supabase Auth, asigna el rol
              beluer en app_metadata y registra su información operativa.
            </p>
          </div>

          <CreateBeluerForm />
        </div>

        <aside className="rounded-[2rem] bg-[#e60023] p-6 text-white shadow-sm md:p-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#ffd6e2]">
            Módulo Beluers
          </p>

          <h3 className="text-2xl font-black">
            Control de especialistas
          </h3>

          <p className="mt-4 text-sm leading-relaxed text-white/85">
            Aquí se centraliza la administración de Beluers aprobadas:
            creación, estado, nivel, disponibilidad, actividad y futuras
            métricas operativas.
          </p>

          <div className="mt-8 space-y-3 text-sm">
            <div className="rounded-2xl bg-white/10 p-4">
              Estado: activa, pendiente o suspendida
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              Nivel: Nueva, Verificada o Top ✦
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              Reservas, rating e historial de servicios
            </div>
          </div>
        </aside>
      </div>

      <AdminBeluersRealList />
    </section>
  );
}