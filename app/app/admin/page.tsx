import LogoutButton from "@/components/auth/LogoutButton";
import AdminPanelOriginalPage from "@/components/admin-panel-original/AdminPanelOriginalPage";
import CreateBeluerForm from "@/components/admin-panel-original/CreateBeluerForm";

export default function AdminPage() {
  return (
    <>
      <AdminPanelOriginalPage />

      <section className="min-h-screen bg-[#f7f3f0] px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#e60023]">
              Panel Admin
            </p>

            <h1 className="text-3xl font-black tracking-tight text-[#1a1a1a] md:text-5xl">
              Gestión de Beluers ✦
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600">
              Crea, valida y administra a las especialistas que formarán parte
              de belu. Las Beluers no se registran libremente: pasan por filtro
              de calidad y son habilitadas desde administración.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-[#1a1a1a]">
                  Crear nueva Beluer
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  Este formulario crea el usuario en Supabase Auth, asigna el
                  rol <strong>beluer</strong> en app_metadata y registra su
                  información base en profiles y beluer_profiles.
                </p>
              </div>

              <CreateBeluerForm />
            </div>

            <aside className="rounded-[2rem] bg-[#e60023] p-6 text-white shadow-sm md:p-8">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#ffd6e2]">
                Próximo módulo
              </p>

              <h3 className="text-2xl font-black">
                Listado y control de Beluers
              </h3>

              <p className="mt-4 text-sm leading-relaxed text-white/85">
                Más adelante esta sección permitirá ver todas las Beluers,
                cambiar su estado, editar su nivel, revisar disponibilidad,
                consultar reservas y controlar su actividad dentro de la
                plataforma.
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
        </div>
      </section>

      <LogoutButton className="fixed right-6 bottom-6 z-50 rounded-full bg-[#e60023] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#c4001d]" />
    </>
  );
}