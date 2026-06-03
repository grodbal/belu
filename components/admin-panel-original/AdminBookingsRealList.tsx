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
      <div className="rounded-[2rem] border border-dashed border-[#E60023]/30 bg-white p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#E60023]">
          Sin reservas
        </p>

        <h3 className="mt-3 text-2xl font-black text-[#1A1A1A]">
          Aún no hay reservas registradas
        </h3>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
          Cuando una clienta reserve un servicio, la información aparecerá aquí
          con servicio, fecha, Beluer, estado y pago.
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

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#E60023]">
            Base real
          </p>

          <h2 className="text-2xl font-black text-[#1A1A1A]">
            Reservas registradas
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            Estas reservas leen datos reales desde Supabase. Más adelante se
            conectarán al pago y al flujo de WhatsApp.
          </p>
        </div>

        <div className="rounded-full bg-[#FFD6E2] px-4 py-2 text-sm font-black text-[#E60023]">
          {bookings.length} reserva{bookings.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-neutral-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
            <thead className="bg-[#F7F3F0] text-xs uppercase tracking-[0.16em] text-neutral-500">
              <tr>
                <th className="px-5 py-4 font-black">Reserva</th>
                <th className="px-5 py-4 font-black">Clienta</th>
                <th className="px-5 py-4 font-black">Servicio</th>
                <th className="px-5 py-4 font-black">Beluer</th>
                <th className="px-5 py-4 font-black">Ubicación</th>
                <th className="px-5 py-4 font-black">Importes</th>
                <th className="px-5 py-4 font-black">Estado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {(bookings as Booking[]).map((booking) => {
                const client = booking.client_profile_id
                  ? clientsById.get(booking.client_profile_id)
                  : null;

                const beluer = booking.beluer_profile_id
                  ? beluersById.get(booking.beluer_profile_id)
                  : null;

                const service = servicesById.get(booking.service_id);

                return (
                  <tr key={booking.id} className="align-top">
                    <td className="px-5 py-5">
                      <p className="font-black text-[#1A1A1A]">
                        {formatDate(booking.scheduled_date)}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {booking.scheduled_time.slice(0, 5)}
                      </p>

                      <p className="mt-2 text-xs text-neutral-500">
                        {booking.booking_mode === "managed"
                          ? "Modo Gestionado"
                          : "Modo Libre"}
                      </p>

                      {booking.is_express ? (
                        <span className="mt-2 inline-flex rounded-full bg-[#E60023] px-3 py-1 text-xs font-black text-white">
                          Express
                        </span>
                      ) : null}
                    </td>

                    <td className="px-5 py-5">
                      <p className="font-black text-[#1A1A1A]">
                        {client?.full_name || "Clienta sin asignar"}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {client?.email || "Sin correo"}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {client?.phone || "Sin teléfono"}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="font-black text-[#1A1A1A]">
                        {service?.name || "Servicio no encontrado"}
                      </p>

                      <span className="mt-2 inline-flex rounded-full bg-[#FFD6E2] px-3 py-1 text-xs font-black text-[#E60023]">
                        {service ? getCategoryLabel(service.category) : "—"}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <p className="font-black text-[#1A1A1A]">
                        {beluer?.public_name || "Sin Beluer asignada"}
                      </p>

                      <AssignBookingBeluerForm
                        bookingId={booking.id}
                        currentStatus={booking.status}
                        currentBeluerProfileId={booking.beluer_profile_id}
                        availableBeluers={availableBeluerOptions}
                      />
                    </td>

                    <td className="px-5 py-5">
                      <p className="font-black text-[#1A1A1A]">
                        {booking.district}
                      </p>

                      <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-neutral-500">
                        {booking.address}
                      </p>

                      {booking.notes ? (
                        <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-neutral-400">
                          Nota: {booking.notes}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-5 py-5 text-xs text-neutral-500">
                      <p>
                        Público:{" "}
                        <strong className="text-[#1A1A1A]">
                          {formatCurrency(booking.public_price)}
                        </strong>
                      </p>

                      <p className="mt-1">
                        Base:{" "}
                        <strong className="text-[#1A1A1A]">
                          {formatCurrency(booking.base_price)}
                        </strong>
                      </p>

                      <p className="mt-1">
                        Comisión belu:{" "}
                        <strong className="text-[#1A1A1A]">
                          {formatCurrency(booking.belu_commission_amount)}
                        </strong>
                      </p>

                      <p className="mt-1">
                        Pago Beluer:{" "}
                        <strong className="text-[#1A1A1A]">
                          {formatCurrency(booking.beluer_payment_amount)}
                        </strong>
                      </p>

                      {booking.express_fee > 0 ? (
                        <p className="mt-1">
                          Express:{" "}
                          <strong className="text-[#1A1A1A]">
                            {formatCurrency(booking.express_fee)}
                          </strong>
                        </p>
                      ) : null}
                    </td>

                    <td className="px-5 py-5">
  <div className="space-y-3">
    <div>
      <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-700">
        {getStatusLabel(booking.status)}
      </span>

      <span className="mt-2 inline-flex rounded-full bg-[#FFD6E2] px-3 py-1 text-xs font-black text-[#E60023]">
        Pago: {getPaymentStatusLabel(booking.payment_status)}
      </span>
    </div>

    <div>
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400">
        Cambiar estado
      </p>

      <UpdateBookingStatusForm
        bookingId={booking.id}
        currentStatus={booking.status}
      />
      <div>
  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400">
    Cambiar pago
  </p>

  <UpdateBookingPaymentStatusForm
    bookingId={booking.id}
    currentPaymentStatus={booking.payment_status}
  />
</div>
    </div>
  </div>
</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
