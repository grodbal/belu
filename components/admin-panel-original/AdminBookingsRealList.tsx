import { createAdminClient } from "@/lib/supabase/admin";
import UpdateBookingStatusForm from "@/components/admin-panel-original/UpdateBookingStatusForm";
import UpdateBookingPaymentStatusForm from "@/components/admin-panel-original/UpdateBookingPaymentStatusForm";
import AssignBookingBeluerForm from "@/components/admin-panel-original/AssignBookingBeluerForm";

type Booking = {
  id: string;
  client_profile_id: string | null;
  beluer_profile_id: string | null;
  service_id: string;
  booking_mode: "managed" | "libre";
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  district: string;
  notes: string | null;
  is_express: boolean;
  express_fee: number;
  status:
    | "pending"
    | "assigned"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "redo_requested"
    | "redo_approved";
  public_price: number;
  logistic_fee: number;
  base_price: number;
  belu_commission_rate: number;
  belu_commission_amount: number;
  beluer_payment_amount: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

type BeluerProfile = {
  id: string;
  public_name: string | null;
  profile_id: string;
};

type AssignableBeluer = {
  id: string;
  public_name: string | null;
};

type Service = {
  id: string;
  name: string;
  category: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatRate(value: number) {
  const normalizedRate = value > 1 ? value : value * 100;

  return new Intl.NumberFormat("es-PE", {
    maximumFractionDigits: 2,
  }).format(normalizedRate);
}

function getStatusLabel(status: Booking["status"]) {
  const labels: Record<Booking["status"], string> = {
    pending: "Pendiente",
    assigned: "Asignada",
    confirmed: "Confirmada",
    in_progress: "En curso",
    completed: "Completada",
    cancelled: "Cancelada",
    redo_requested: "Redo solicitado",
    redo_approved: "Redo aprobado",
  };

  return labels[status];
}

function getPaymentStatusLabel(status: Booking["payment_status"]) {
  const labels: Record<Booking["payment_status"], string> = {
    pending: "Pendiente",
    paid: "Pagado",
    failed: "Fallido",
    refunded: "Reembolsado",
  };

  return labels[status];
}

function getStatusBadgeClass(status: Booking["status"]) {
  return `admin-booking-badge ${status}`;
}

function getPaymentBadgeClass(status: Booking["payment_status"]) {
  return `admin-payment-badge ${status}`;
}

function getCategoryLabel(category: string) {
  if (category === "lashes") return "Lashes";
  if (category === "nails") return "Nails";
  return category;
}

export default async function AdminBookingsRealList() {
  const supabase = createAdminClient();

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(
      "id, client_profile_id, beluer_profile_id, service_id, booking_mode, scheduled_date, scheduled_time, address, district, notes, is_express, express_fee, status, public_price, logistic_fee, base_price, belu_commission_rate, belu_commission_amount, beluer_payment_amount, payment_status, created_at"
    )
    .order("scheduled_date", { ascending: false })
    .order("scheduled_time", { ascending: false });

  if (bookingsError) {
    return (
      <div className="rounded-[2rem] bg-[#FFD6E2] p-6 text-[#E60023]">
        <h3 className="text-lg font-black">Error al cargar reservas</h3>
        <p className="mt-2 text-sm font-bold">{bookingsError.message}</p>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="admin-bookings-admin-empty">
        <span>Reservas</span>
        <h3>Aun no hay reservas registradas</h3>
        <p>
          Cuando una clienta agende un servicio, aparecera aqui para que puedas
          asignar Beluer y gestionar el estado.
        </p>
      </div>
    );
  }

  const clientProfileIds = bookings
    .map((booking) => booking.client_profile_id)
    .filter(Boolean) as string[];

  const beluerProfileIds = bookings
    .map((booking) => booking.beluer_profile_id)
    .filter(Boolean) as string[];

  const serviceIds = bookings.map((booking) => booking.service_id);

  const { data: clientProfiles, error: clientProfilesError } =
    clientProfileIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, email, phone")
          .in("id", clientProfileIds)
      : { data: [], error: null };

  if (clientProfilesError) {
    return (
      <div className="rounded-[2rem] bg-[#FFD6E2] p-6 text-[#E60023]">
        <h3 className="text-lg font-black">Error al cargar clientas</h3>
        <p className="mt-2 text-sm font-bold">{clientProfilesError.message}</p>
      </div>
    );
  }

  const { data: beluerProfiles, error: beluerProfilesError } =
    beluerProfileIds.length > 0
      ? await supabase
          .from("beluer_profiles")
          .select("id, public_name, profile_id")
          .in("id", beluerProfileIds)
      : { data: [], error: null };

  if (beluerProfilesError) {
    return (
      <div className="rounded-[2rem] bg-[#FFD6E2] p-6 text-[#E60023]">
        <h3 className="text-lg font-black">Error al cargar Beluers</h3>
        <p className="mt-2 text-sm font-bold">{beluerProfilesError.message}</p>
      </div>
    );
  }

  const { data: availableBeluers, error: availableBeluersError } =
    await supabase
      .from("beluer_profiles")
      .select("id, public_name")
      .eq("status", "approved")
      .eq("is_available", true)
      .order("public_name", { ascending: true });

  if (availableBeluersError) {
    return (
      <div className="rounded-[2rem] bg-[#FFD6E2] p-6 text-[#E60023]">
        <h3 className="text-lg font-black">
          Error al cargar Beluers disponibles
        </h3>
        <p className="mt-2 text-sm font-bold">
          {availableBeluersError.message}
        </p>
      </div>
    );
  }

  const { data: services, error: servicesError } =
    serviceIds.length > 0
      ? await supabase
          .from("services")
          .select("id, name, category")
          .in("id", serviceIds)
      : { data: [], error: null };

  if (servicesError) {
    return (
      <div className="rounded-[2rem] bg-[#FFD6E2] p-6 text-[#E60023]">
        <h3 className="text-lg font-black">Error al cargar servicios</h3>
        <p className="mt-2 text-sm font-bold">{servicesError.message}</p>
      </div>
    );
  }

  const clientsById = new Map(
    (clientProfiles as Profile[]).map((profile) => [profile.id, profile])
  );

  const beluersById = new Map(
    (beluerProfiles as BeluerProfile[]).map((beluer) => [beluer.id, beluer])
  );

  const servicesById = new Map(
    (services as Service[]).map((service) => [service.id, service])
  );
  const availableBeluerOptions = (availableBeluers as AssignableBeluer[]) || [];
  const typedBookings = bookings as Booking[];
  const bookingSummary = {
    total: typedBookings.length,
    pending: typedBookings.filter((booking) => booking.status === "pending")
      .length,
    assigned: typedBookings.filter((booking) => booking.status === "assigned")
      .length,
    confirmed: typedBookings.filter(
      (booking) => booking.status === "confirmed"
    ).length,
    completed: typedBookings.filter(
      (booking) => booking.status === "completed"
    ).length,
    paymentPending: typedBookings.filter(
      (booking) => booking.payment_status === "pending"
    ).length,
  };

  return (
    <section className="admin-real-panel admin-bookings-admin-page">
      <div className="admin-bookings-admin-hero">
        <div>
          <span className="admin-real-eyebrow">Datos reales</span>

          <h2>Reservas</h2>

          <p>
            Consulta las reservas registradas, su estado operativo, pago y
            Beluer asignada.
          </p>
        </div>

        <div className="admin-bookings-admin-count">
          <strong>{bookingSummary.total}</strong>
          <span>reserva{bookingSummary.total === 1 ? "" : "s"}</span>
        </div>
      </div>

      <div className="admin-bookings-admin-summary">
        <div>
          <span>Total reservas</span>
          <strong>{bookingSummary.total}</strong>
        </div>

        <div>
          <span>Pendientes</span>
          <strong>{bookingSummary.pending}</strong>
        </div>

        <div>
          <span>Asignadas</span>
          <strong>{bookingSummary.assigned}</strong>
        </div>

        <div>
          <span>Confirmadas</span>
          <strong>{bookingSummary.confirmed}</strong>
        </div>

        <div>
          <span>Completadas</span>
          <strong>{bookingSummary.completed}</strong>
        </div>

        <div>
          <span>Pagos pendientes</span>
          <strong>{bookingSummary.paymentPending}</strong>
        </div>
      </div>

      <div className="admin-bookings-admin-list">
        {typedBookings.map((booking) => {
          const client = booking.client_profile_id
            ? clientsById.get(booking.client_profile_id)
            : null;

          const beluer = booking.beluer_profile_id
            ? beluersById.get(booking.beluer_profile_id)
            : null;

          const service = servicesById.get(booking.service_id);
          const hasAssignedBeluer = Boolean(booking.beluer_profile_id);

          return (
            <article key={booking.id} className="admin-booking-admin-card">
              <div className="admin-booking-admin-card-head">
                <div>
                  <div className="admin-booking-badge-row">
                    <span className={getStatusBadgeClass(booking.status)}>
                      {getStatusLabel(booking.status)}
                    </span>

                    <span
                      className={getPaymentBadgeClass(booking.payment_status)}
                    >
                      Pago: {getPaymentStatusLabel(booking.payment_status)}
                    </span>

                    <span className="admin-booking-meta-pill">
                      {booking.booking_mode === "managed"
                        ? "Modo gestionado"
                        : "Modo libre"}
                    </span>

                    {booking.is_express ? (
                      <span className="admin-booking-meta-pill is-express">
                        Express
                      </span>
                    ) : null}
                  </div>

                  <h3>{service?.name || "Servicio no encontrado"}</h3>

                  <p>
                    {formatDate(booking.scheduled_date)} -{" "}
                    {booking.scheduled_time.slice(0, 5)} - {booking.district}
                  </p>
                </div>

                <div className="admin-booking-admin-total">
                  <span>Total publico</span>
                  <strong>{formatCurrency(booking.public_price)}</strong>
                </div>
              </div>

              <div className="admin-booking-admin-grid">
                <section className="admin-booking-admin-block">
                  <h4>Clienta</h4>

                  <dl>
                    <div>
                      <dt>Nombre</dt>
                      <dd>{client?.full_name || "Clienta sin asignar"}</dd>
                    </div>

                    <div>
                      <dt>Email</dt>
                      <dd>{client?.email || "Sin correo"}</dd>
                    </div>

                    <div>
                      <dt>Telefono</dt>
                      <dd>{client?.phone || "Sin telefono"}</dd>
                    </div>
                  </dl>
                </section>

                <section className="admin-booking-admin-block">
                  <h4>Servicio y ubicacion</h4>

                  <dl>
                    <div>
                      <dt>Servicio</dt>
                      <dd>{service?.name || "Servicio no encontrado"}</dd>
                    </div>

                    <div>
                      <dt>Categoria</dt>
                      <dd>
                        {service ? getCategoryLabel(service.category) : "-"}
                      </dd>
                    </div>

                    <div>
                      <dt>Fecha</dt>
                      <dd>{formatDate(booking.scheduled_date)}</dd>
                    </div>

                    <div>
                      <dt>Hora</dt>
                      <dd>{booking.scheduled_time.slice(0, 5)}</dd>
                    </div>

                    <div>
                      <dt>Distrito</dt>
                      <dd>{booking.district}</dd>
                    </div>

                    <div>
                      <dt>Direccion</dt>
                      <dd>{booking.address}</dd>
                    </div>

                    {booking.notes ? (
                      <div>
                        <dt>Notas</dt>
                        <dd>{booking.notes}</dd>
                      </div>
                    ) : null}
                  </dl>
                </section>

                <section className="admin-booking-admin-block">
                  <h4>Beluer</h4>

                  <p className="admin-booking-admin-beluer-name">
                    {beluer?.public_name || "Sin Beluer asignada"}
                  </p>

                  <p className="admin-booking-admin-muted">
                    {hasAssignedBeluer
                      ? "Especialista asignada a esta reserva."
                      : "Pendiente de asignacion por Admin."}
                  </p>

                  <AssignBookingBeluerForm
                    bookingId={booking.id}
                    currentStatus={booking.status}
                    currentBeluerProfileId={booking.beluer_profile_id}
                    availableBeluers={availableBeluerOptions}
                  />
                </section>

                <section className="admin-booking-admin-block">
                  <h4>Importes</h4>

                  <div className="admin-booking-money-grid">
                    <div>
                      <span>Publico</span>
                      <strong>{formatCurrency(booking.public_price)}</strong>
                    </div>

                    <div>
                      <span>Base</span>
                      <strong>{formatCurrency(booking.base_price)}</strong>
                    </div>

                    <div>
                      <span>Nivel Beluer</span>
                      <strong>
                        {hasAssignedBeluer ? "No disponible" : "Pendiente"}
                      </strong>
                    </div>

                    <div>
                      <span>Comision belu</span>
                      <strong>
                        {hasAssignedBeluer
                          ? formatCurrency(booking.belu_commission_amount)
                          : "Pendiente"}
                      </strong>
                      {hasAssignedBeluer ? (
                        <small>
                          Tasa registrada:{" "}
                          {formatRate(booking.belu_commission_rate)}%
                        </small>
                      ) : null}
                    </div>

                    <div>
                      <span>Pago Beluer</span>
                      <strong>
                        {hasAssignedBeluer
                          ? formatCurrency(booking.beluer_payment_amount)
                          : "Pendiente"}
                      </strong>
                    </div>

                    {booking.express_fee > 0 ? (
                      <div>
                        <span>Express</span>
                        <strong>{formatCurrency(booking.express_fee)}</strong>
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="admin-booking-admin-block admin-booking-admin-control-block">
                  <h4>Estado reserva</h4>

                  <span className={getStatusBadgeClass(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </span>

                  <div className="admin-booking-admin-form-area">
                    <p>Cambiar estado</p>

                    <UpdateBookingStatusForm
                      bookingId={booking.id}
                      currentStatus={booking.status}
                    />
                  </div>
                </section>

                <section className="admin-booking-admin-block admin-booking-admin-control-block">
                  <h4>Estado pago</h4>

                  <span className={getPaymentBadgeClass(booking.payment_status)}>
                    {getPaymentStatusLabel(booking.payment_status)}
                  </span>

                  <div className="admin-booking-admin-form-area">
                    <p>Cambiar pago</p>

                    <UpdateBookingPaymentStatusForm
                      bookingId={booking.id}
                      currentPaymentStatus={booking.payment_status}
                    />
                  </div>
                </section>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
