import { createAdminClient } from "@/lib/supabase/admin";

type BeluerProfile = {
  id: string;
  status: string | null;
  is_available: boolean | null;
};

type Service = {
  id: string;
  status: string | null;
};

type Booking = {
  id: string;
  beluer_profile_id: string | null;
  status: string | null;
  public_price: number | null;
  belu_commission_amount: number | null;
  payment_status: string | null;
  scheduled_date: string | null;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);
}

function getLimaMonthKey() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  return `${year}-${month}`;
}

function isPendingAssignment(booking: Booking) {
  return (
    booking.status === "pending" ||
    booking.status === "pending_beluer_assignment" ||
    (booking.status === "paid" && !booking.beluer_profile_id)
  );
}

function countByStatus(bookings: Booking[], status: string) {
  return bookings.filter((booking) => booking.status === status).length;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export default async function AdminDashboardRealOverview() {
  const supabase = createAdminClient();

  const [beluersResult, servicesResult, bookingsResult] = await Promise.all([
    supabase
      .from("beluer_profiles")
      .select("id, status, is_available")
      .order("created_at", { ascending: false }),
    supabase.from("services").select("id, status"),
    supabase
      .from("bookings")
      .select(
        "id, beluer_profile_id, status, public_price, belu_commission_amount, payment_status, scheduled_date"
      ),
  ]);

  const firstError =
    beluersResult.error || servicesResult.error || bookingsResult.error;

  if (firstError) {
    return (
      <section className="admin-panel-section active">
        <div className="rounded-[2rem] bg-[#FFD6E2] p-6 text-[#E60023]">
          <h3 className="text-lg font-black">
            Error al cargar el dashboard
          </h3>
          <p className="mt-2 text-sm font-bold">{firstError.message}</p>
        </div>
      </section>
    );
  }

  const beluers = (beluersResult.data ?? []) as BeluerProfile[];
  const services = (servicesResult.data ?? []) as Service[];
  const bookings = (bookingsResult.data ?? []) as Booking[];
  const monthKey = getLimaMonthKey();

  const approvedBeluers = beluers.filter(
    (beluer) => beluer.status === "approved"
  );
  const activeApprovedBeluers = approvedBeluers.filter(
    (beluer) => beluer.is_available
  );
  const activeServices = services.filter(
    (service) => service.status === "active"
  );
  const pendingAssignment = bookings.filter(isPendingAssignment);
  const monthlyPaidBookings = bookings.filter(
    (booking) =>
      booking.payment_status === "paid" &&
      Boolean(booking.scheduled_date?.startsWith(monthKey))
  );
  const monthlyGross = sum(
    monthlyPaidBookings.map((booking) => Number(booking.public_price ?? 0))
  );
  const monthlyCommission = sum(
    monthlyPaidBookings.map((booking) =>
      Number(booking.belu_commission_amount ?? 0)
    )
  );

  const statusCounts = {
    pending: countByStatus(bookings, "pending"),
    assigned: countByStatus(bookings, "assigned"),
    confirmed: countByStatus(bookings, "confirmed"),
    completed: countByStatus(bookings, "completed"),
    cancelled: countByStatus(bookings, "cancelled"),
  };

  const priorities = [
    {
      title: "Reservas pendientes de asignación",
      value: pendingAssignment.length,
      text:
        pendingAssignment.length > 0
          ? "Revisa reservas gestionadas sin Beluer asignada."
          : "No hay reservas pendientes de asignación.",
    },
    {
      title: "Beluers pendientes de aprobación",
      value: beluers.filter((beluer) => beluer.status === "pending_review")
        .length,
      text: "Control operativo de especialistas antes de activarlas.",
    },
    {
      title: "Reservas canceladas",
      value: statusCounts.cancelled,
      text: "Útil para revisar fricción operativa y motivos de cancelación.",
    },
  ];

  return (
    <section className="admin-panel-section active">
      <div className="admin-panel-top-bar">
        <div className="admin-panel-greeting">
          <h1>Panel Admin ✦</h1>
          <p>
            Control operativo de belu con datos reales de reservas, pagos,
            servicios y Beluers.
          </p>
        </div>

        <AdminPill />
      </div>

      <div className="admin-panel-kpi-grid">
        <KpiCard label="Total Beluers" value={String(beluers.length)} />
        <KpiCard
          label="Beluers aprobadas"
          value={String(approvedBeluers.length)}
        />
        <KpiCard
          label="Beluers activas"
          value={String(activeApprovedBeluers.length)}
        />
        <KpiCard
          label="Servicios activos"
          value={String(activeServices.length)}
        />
        <KpiCard label="Reservas totales" value={String(bookings.length)} />
        <KpiCard label="Pendientes" value={String(statusCounts.pending)} />
        <KpiCard label="Asignadas" value={String(statusCounts.assigned)} />
        <KpiCard label="Confirmadas" value={String(statusCounts.confirmed)} />
        <KpiCard label="Completadas" value={String(statusCounts.completed)} />
        <KpiCard
          label="Pendientes asignación"
          value={String(pendingAssignment.length)}
        />
        <KpiCard label="Ingresos mes" value={formatCurrency(monthlyGross)} />
        <KpiCard
          label="Comisión mes"
          value={formatCurrency(monthlyCommission)}
        />
      </div>

      <div className="admin-panel-dashboard-grid">
        <div className="admin-panel-card large">
          <div className="admin-panel-card-header">
            <div>
              <h2>Prioridades operativas</h2>
              <p>Alertas calculadas desde datos reales de Supabase.</p>
            </div>
          </div>

          <div className="admin-panel-alert-list">
            {priorities.map((priority) => (
              <article className="admin-panel-alert-card" key={priority.title}>
                <div>
                  <span>{priority.value} pendiente(s)</span>
                  <h3>{priority.title}</h3>
                  <p>{priority.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="admin-panel-card">
          <h2>Salud del sistema</h2>
          <p>Indicadores rápidos del marketplace gestionado.</p>

          <div className="admin-panel-health-list">
            <div>
              <span>Reservas canceladas</span>
              <strong>{statusCounts.cancelled}</strong>
            </div>

            <div>
              <span>Reservas completadas</span>
              <strong>{statusCounts.completed}</strong>
            </div>

            <div>
              <span>Reservas pagadas este mes</span>
              <strong>{monthlyPaidBookings.length}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminPill() {
  return (
    <div className="admin-panel-user-pill">
      <div className="admin-panel-avatar">AD</div>
      <span>Admin belu</span>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-panel-kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
