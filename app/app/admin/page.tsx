import LogoutButton from "@/components/auth/LogoutButton";
import AdminPanelOriginalPage from "@/components/admin-panel-original/AdminPanelOriginalPage";
import CreateBeluerForm from "@/components/admin-panel-original/CreateBeluerForm";
import AdminBeluersRealList from "@/components/admin-panel-original/AdminBeluersRealList";
import AdminServicesRealList from "@/components/admin-panel-original/AdminServicesRealList";
import AdminBookingsRealList from "@/components/admin-panel-original/AdminBookingsRealList";
import AdminPhotosRealList from "@/components/admin-panel-original/AdminPhotosRealList";
import AdminPaymentsRealList from "@/components/admin-panel-original/AdminPaymentsRealList";
import AdminDashboardRealOverview from "@/components/admin-panel-original/AdminDashboardRealOverview";
import AdminMetricsRealSection from "@/components/admin-panel-original/AdminMetricsRealSection";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <>
      <AdminPanelOriginalPage
  dashboardSlot={<DashboardSection />}
  beluersListSlot={<BeluersListSection />}
  registerBeluerSlot={<RegisterBeluerSection />}
  servicesSlot={<ServicesSection />}
  bookingsSlot={<BookingsSection />}
  photosSlot={<PhotosSection />}
  paymentsSlot={<PaymentsSection />}
  metricsSlot={<MetricsSection />}
/>
      

      <LogoutButton className="fixed right-6 bottom-6 z-50 rounded-full bg-[#e60023] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#c4001d]" />
    </>
  );
}

function ServicesSection() {
  return (
    <section className="admin-panel-section active">
      <div className="admin-panel-top-bar">
        <div className="admin-panel-greeting">
          <h1>Servicios</h1>
          <p>
            Administra el catálogo oficial de servicios con precios fijos para
            clientas.
          </p>
        </div>

        <div className="admin-panel-pill">Catálogo real</div>
      </div>

      <AdminServicesRealList />
    </section>
  );
}

function BookingsSection() {
  return (
    <section className="admin-panel-section active">
      <div className="admin-panel-top-bar">
        <div className="admin-panel-greeting">
          <h1>Reservas</h1>
          <p>
            Revisa las reservas registradas, su estado, pago, servicio y Beluer
            asignada.
          </p>
        </div>

        <div className="admin-panel-pill">Base real</div>
      </div>

      <AdminBookingsRealList />
    </section>
  );
}

function DashboardSection() {
  return <AdminDashboardRealOverview />;
}

function PhotosSection() {
  return (
    <section className="admin-panel-section active">
      <div className="admin-panel-top-bar">
        <div className="admin-panel-greeting">
          <h1>Fotos</h1>
          <p>
            Revisa fotos reales de portafolio cuando exista contenido cargado en
            Supabase.
          </p>
        </div>

        <div className="admin-panel-pill">Base real</div>
      </div>

      <AdminPhotosRealList />
    </section>
  );
}

function PaymentsSection() {
  return (
    <section className="admin-panel-section active">
      <div className="admin-panel-top-bar">
        <div className="admin-panel-greeting">
          <h1>Pagos</h1>
          <p>
            Vista básica de pagos basada en reservas reales y su estado de pago.
          </p>
        </div>

        <div className="admin-panel-pill">Base real</div>
      </div>

      <AdminPaymentsRealList />
    </section>
  );
}

function MetricsSection() {
  return <AdminMetricsRealSection />;
}

function BeluersListSection() {
  return (
    <section className="admin-panel-section active">
      <div className="admin-panel-top-bar">
        <div className="admin-panel-greeting">
          <h1>Beluers</h1>
          <p>
            Revisa y gestiona las especialistas registradas en la plataforma.
          </p>
        </div>

        <div className="admin-panel-pill">Base real</div>
      </div>

      <AdminBeluersRealList />
    </section>
  );
}

function RegisterBeluerSection() {
  return (
    <section className="admin-panel-section active">
      <div className="admin-panel-top-bar">
        <div className="admin-panel-greeting">
          <h1>Registrar Beluer ✦</h1>
          <p>
            Crea una cuenta operativa solo para especialistas aprobadas por belu.
          </p>
        </div>

        <div className="admin-panel-pill">Acceso admin</div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
          <div className="mb-6">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#e60023]">
              Nueva especialista
            </p>

            <h2 className="text-2xl font-black text-[#1a1a1a]">
              Crear nueva Beluer
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              Este formulario crea el usuario en Supabase Auth, asigna el rol
              beluer en app_metadata y registra su información base en profiles
              y beluer_profiles.
            </p>
          </div>

          <CreateBeluerForm />
        </div>

        <aside className="rounded-[2rem] bg-[#e60023] p-6 text-white shadow-sm md:p-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#ffd6e2]">
            Filtro de calidad
          </p>

          <h3 className="text-2xl font-black">
            Solo especialistas aprobadas
          </h3>

          <p className="mt-4 text-sm leading-relaxed text-white/85">
            Las Beluers no se registran libremente. Primero se valida su
            experiencia, zona de atención y calidad de trabajo. Luego se crea su
            cuenta desde administración.
          </p>

          <div className="mt-8 space-y-3 text-sm">
            <div className="rounded-2xl bg-white/10 p-4">
              Validación de portfolio e Instagram
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              Registro operativo en Supabase
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              Acceso al panel Beluer
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
