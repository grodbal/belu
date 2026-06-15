import { createAdminClient } from "@/lib/supabase/admin";

type Booking = {
  id: string;
  service_id: string | null;
  district: string | null;
  status: string | null;
  public_price: number | null;
  belu_commission_amount: number | null;
  payment_status: string | null;
  scheduled_date: string | null;
};

type Service = {
  id: string;
  name: string;
  category: string;
};

type RankingRow = {
  key: string;
  label: string;
  meta: string;
  bookings: number;
  revenue: number;
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

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Pendiente",
    assigned: "Asignada",
    confirmed: "Confirmada",
    in_progress: "En curso",
    completed: "Completada",
    cancelled: "Cancelada",
    redo_requested: "Redo solicitado",
    redo_approved: "Redo aprobado",
    pending_payment: "Pendiente de pago",
    paid: "Pagada",
    pending_beluer_assignment: "Pendiente de asignación",
    refunded: "Reembolsada",
  };

  return labels[status] ?? status;
}

function getCategoryLabel(category: string) {
  if (category === "lashes") return "Lashes";
  if (category === "nails") return "Nails";
  if (category === "brows") return "Brows";
  return category;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function sortRanking(rows: RankingRow[]) {
  return rows
    .sort((a, b) => b.bookings - a.bookings || b.revenue - a.revenue)
    .slice(0, 5);
}

export default async function AdminMetricsRealSection() {
  const supabase = createAdminClient();

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(
      "id, service_id, district, status, public_price, belu_commission_amount, payment_status, scheduled_date"
    );

  if (bookingsError) {
    return (
      <section className="admin-panel-section active">
        <div className="rounded-[2rem] bg-[#FFD6E2] p-6 text-[#E60023]">
          <h3 className="text-lg font-black">Error al cargar métricas</h3>
          <p className="mt-2 text-sm font-bold">{bookingsError.message}</p>
        </div>
      </section>
    );
  }

  const typedBookings = (bookings ?? []) as Booking[];

  if (typedBookings.length === 0) {
    return (
      <section className="admin-panel-section active">
        <div className="admin-panel-top-bar">
          <div className="admin-panel-greeting">
            <h1>Métricas</h1>
            <p>Lectura ejecutiva basada en datos reales de Supabase.</p>
          </div>

          <AdminPill />
        </div>

        <div className="admin-panel-card">
          <h2>Aún no hay suficiente información para mostrar métricas.</h2>
          <p>
            Cuando existan reservas reales, este panel mostrará rankings,
            estados e ingresos sin inventar datos.
          </p>
        </div>
      </section>
    );
  }

  const serviceIds = typedBookings
    .map((booking) => booking.service_id)
    .filter(Boolean) as string[];

  const { data: services, error: servicesError } =
    serviceIds.length > 0
      ? await supabase
          .from("services")
          .select("id, name, category")
          .in("id", serviceIds)
      : { data: [], error: null };

  if (servicesError) {
    return (
      <section className="admin-panel-section active">
        <div className="rounded-[2rem] bg-[#FFD6E2] p-6 text-[#E60023]">
          <h3 className="text-lg font-black">Error al cargar servicios</h3>
          <p className="mt-2 text-sm font-bold">{servicesError.message}</p>
        </div>
      </section>
    );
  }

  const servicesById = new Map(
    (services as Service[]).map((service) => [service.id, service])
  );
  const monthKey = getLimaMonthKey();
  const paidBookings = typedBookings.filter(
    (booking) => booking.payment_status === "paid"
  );
  const monthlyPaidBookings = paidBookings.filter((booking) =>
    Boolean(booking.scheduled_date?.startsWith(monthKey))
  );
  const monthlyRevenue = sum(
    monthlyPaidBookings.map((booking) => Number(booking.public_price ?? 0))
  );
  const monthlyCommission = sum(
    monthlyPaidBookings.map((booking) =>
      Number(booking.belu_commission_amount ?? 0)
    )
  );
  const completedBookings = typedBookings.filter(
    (booking) => booking.status === "completed"
  );
  const cancelledBookings = typedBookings.filter(
    (booking) => booking.status === "cancelled"
  );
  const statusEntries = Array.from(
    typedBookings.reduce((counts, booking) => {
      const status = booking.status || "sin_estado";
      counts.set(status, (counts.get(status) ?? 0) + 1);
      return counts;
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]);

  const serviceStats = new Map<string, RankingRow>();
  const districtStats = new Map<string, RankingRow>();

  typedBookings.forEach((booking) => {
    if (booking.service_id) {
      const service = servicesById.get(booking.service_id);
      const current = serviceStats.get(booking.service_id) ?? {
        key: booking.service_id,
        label: service?.name || "Servicio no encontrado",
        meta: service ? getCategoryLabel(service.category) : "Sin categoría",
        bookings: 0,
        revenue: 0,
      };

      current.bookings += 1;
      current.revenue +=
        booking.payment_status === "paid"
          ? Number(booking.public_price ?? 0)
          : 0;
      serviceStats.set(booking.service_id, current);
    }

    if (booking.district) {
      const current = districtStats.get(booking.district) ?? {
        key: booking.district,
        label: booking.district,
        meta: "Distrito",
        bookings: 0,
        revenue: 0,
      };

      current.bookings += 1;
      current.revenue +=
        booking.payment_status === "paid"
          ? Number(booking.public_price ?? 0)
          : 0;
      districtStats.set(booking.district, current);
    }
  });

  const topServices = sortRanking(Array.from(serviceStats.values()));
  const topDistricts = sortRanking(Array.from(districtStats.values()));
  const completionRate =
    typedBookings.length > 0
      ? Math.round((completedBookings.length / typedBookings.length) * 100)
      : 0;

  return (
    <section className="admin-panel-section active">
      <div className="admin-panel-top-bar">
        <div className="admin-panel-greeting">
          <h1>Métricas</h1>
          <p>
            Vista ejecutiva del rendimiento de belu basada en reservas reales.
          </p>
        </div>

        <AdminPill />
      </div>

      <div className="admin-panel-metricas-hero">
        <div>
          <span>Comisión estimada belu del mes</span>
          <strong>{formatCurrency(monthlyCommission)}</strong>
          <p>
            Calculada desde reservas del mes con payment_status = paid y
            belu_commission_amount.
          </p>
        </div>

        <div className="admin-panel-metricas-hero-grid">
          <div>
            <span>Ingresos pagados del mes</span>
            <strong>{formatCurrency(monthlyRevenue)}</strong>
          </div>

          <div>
            <span>Reservas pagadas del mes</span>
            <strong>{monthlyPaidBookings.length}</strong>
          </div>
        </div>
      </div>

      <div className="admin-panel-metricas-summary">
        <div>
          <span>Reservas totales</span>
          <strong>{typedBookings.length}</strong>
        </div>

        <div>
          <span>Reservas completadas</span>
          <strong>{completedBookings.length}</strong>
        </div>

        <div>
          <span>Tasa finalización</span>
          <strong>{completionRate}%</strong>
        </div>

        <div>
          <span>Reservas canceladas</span>
          <strong>{cancelledBookings.length}</strong>
        </div>

        <div>
          <span>Estados distintos</span>
          <strong>{statusEntries.length}</strong>
        </div>
      </div>

      <div className="admin-panel-metricas-grid">
        <div className="admin-panel-metricas-card large">
          <div className="admin-panel-metricas-card-header">
            <div>
              <h2>Estados de reservas</h2>
              <p>Conteo real por estado operativo.</p>
            </div>
          </div>

          <div className="admin-panel-ranking-list">
            {statusEntries.map(([status, count], index) => (
              <div className="admin-panel-ranking-row" key={status}>
                <span>{index + 1}</span>

                <div>
                  <strong>{getStatusLabel(status)}</strong>
                  <small>{count} reserva{count === 1 ? "" : "s"}</small>
                </div>

                <em>{count}</em>
              </div>
            ))}
          </div>
        </div>

        <RankingCard
          title="Servicios más reservados"
          description="Ranking real por reservas generadas."
          rows={topServices}
        />

        <RankingCard
          title="Distritos con mayor demanda"
          description="Ranking real por reservas e ingresos pagados."
          rows={topDistricts}
        />

        <div className="admin-panel-metricas-card">
          <h2>Lectura operativa</h2>
          <p>Señales básicas calculadas desde reservas.</p>

          <div className="admin-panel-metricas-alert-list">
            <div>
              <strong>Asignación gestionada</strong>
              <span>
                Revisa reservas en estado pendiente para evitar fricción
                operativa.
              </span>
            </div>

            <div>
              <strong>Servicios con demanda</strong>
              <span>
                Usa el ranking real para priorizar disponibilidad y cobertura.
              </span>
            </div>

            <div>
              <strong>Cancelaciones</strong>
              <span>
                {cancelledBookings.length} reserva
                {cancelledBookings.length === 1 ? "" : "s"} cancelada
                {cancelledBookings.length === 1 ? "" : "s"} registrada
                {cancelledBookings.length === 1 ? "" : "s"}.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RankingCard({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: RankingRow[];
}) {
  return (
    <div className="admin-panel-metricas-card">
      <h2>{title}</h2>
      <p>{description}</p>

      {rows.length > 0 ? (
        <div className="admin-panel-ranking-list">
          {rows.map((row, index) => (
            <div className="admin-panel-ranking-row" key={row.key}>
              <span>{index + 1}</span>

              <div>
                <strong>{row.label}</strong>
                <small>
                  {row.meta} · {row.bookings} reserva
                  {row.bookings === 1 ? "" : "s"}
                </small>
              </div>

              <em>{formatCurrency(row.revenue)}</em>
            </div>
          ))}
        </div>
      ) : (
        <p>Aún no hay suficiente información para mostrar métricas.</p>
      )}
    </div>
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
