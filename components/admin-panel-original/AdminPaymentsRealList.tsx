import { createAdminClient } from "@/lib/supabase/admin";

type BookingPayment = {
  id: string;
  client_profile_id: string | null;
  beluer_profile_id: string | null;
  service_id: string;
  scheduled_date: string;
  scheduled_time: string;
  payment_status:
    | "pending"
    | "paid"
    | "failed"
    | "refunded"
    | "partially_refunded";
  public_price: number;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type BeluerProfile = {
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

function getPaymentStatusLabel(status: BookingPayment["payment_status"]) {
  const labels: Record<BookingPayment["payment_status"], string> = {
    pending: "Pago pendiente de confirmación",
    paid: "Pago confirmado",
    failed: "Pago fallido",
    refunded: "Pago reembolsado",
    partially_refunded: "Pago parcialmente reembolsado",
  };

  return labels[status];
}

function getCategoryLabel(category: string) {
  if (category === "lashes") return "Lashes";
  if (category === "nails") return "Nails";
  if (category === "brows") return "Brows";
  return category;
}

export default async function AdminPaymentsRealList() {
  const supabase = createAdminClient();

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(
      "id, client_profile_id, beluer_profile_id, service_id, scheduled_date, scheduled_time, payment_status, public_price"
    )
    .order("scheduled_date", { ascending: false })
    .order("scheduled_time", { ascending: false });

  if (bookingsError) {
    return (
      <div className="rounded-[2rem] bg-[#FFD6E2] p-6 text-[#E60023]">
        <h3 className="text-lg font-black">Error al cargar pagos</h3>
        <p className="mt-2 text-sm font-bold">{bookingsError.message}</p>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[#E60023]/30 bg-white p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#E60023]">
          Sin pagos
        </p>
        <h3 className="mt-3 text-2xl font-black text-[#1A1A1A]">
          Aún no hay pagos registrados.
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
          Cuando existan reservas reales, este panel mostrará su estado de pago
          sin inventar códigos, operaciones ni comprobantes.
        </p>
      </div>
    );
  }

  const typedBookings = bookings as BookingPayment[];
  const clientProfileIds = typedBookings
    .map((booking) => booking.client_profile_id)
    .filter(Boolean) as string[];
  const beluerProfileIds = typedBookings
    .map((booking) => booking.beluer_profile_id)
    .filter(Boolean) as string[];
  const serviceIds = typedBookings.map((booking) => booking.service_id);

  const { data: clientProfiles, error: clientProfilesError } =
    clientProfileIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, email")
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
          .select("id, public_name")
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

  return (
    <section className="admin-real-panel rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#E60023]">
            Datos reales
          </p>
          <h2 className="text-2xl font-black text-[#1A1A1A]">
            Pagos desde reservas
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            Vista básica basada en reservas reales. La pasarela de pagos y los
            comprobantes quedan pendientes para una fase posterior.
          </p>
        </div>

        <div className="rounded-full bg-[#FFD6E2] px-4 py-2 text-sm font-black text-[#E60023]">
          {typedBookings.length} registro
          {typedBookings.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-neutral-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-[#F7F3F0] text-xs uppercase tracking-[0.16em] text-neutral-500">
              <tr>
                <th className="px-5 py-4 font-black">Servicio</th>
                <th className="px-5 py-4 font-black">Clienta</th>
                <th className="px-5 py-4 font-black">Beluer</th>
                <th className="px-5 py-4 font-black">Fecha</th>
                <th className="px-5 py-4 font-black">Pago</th>
                <th className="px-5 py-4 font-black">Comprobante</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {typedBookings.map((booking) => {
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
                        {service?.name || "Servicio no encontrado"}
                      </p>
                      <span className="mt-2 inline-flex rounded-full bg-[#FFD6E2] px-3 py-1 text-xs font-black text-[#E60023]">
                        {service ? getCategoryLabel(service.category) : "—"}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <p className="font-black text-[#1A1A1A]">
                        {client?.full_name || "Clienta sin asignar"}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {client?.email || "Sin correo"}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="font-black text-[#1A1A1A]">
                        {beluer?.public_name || "Sin Beluer asignada"}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="font-black text-[#1A1A1A]">
                        {formatDate(booking.scheduled_date)}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {booking.scheduled_time.slice(0, 5)}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <span className="inline-flex rounded-full bg-[#FFD6E2] px-3 py-1 text-xs font-black text-[#E60023]">
                        {getPaymentStatusLabel(booking.payment_status)}
                      </span>
                      <p className="mt-2 text-sm font-black text-[#1A1A1A]">
                        {formatCurrency(booking.public_price)}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <button
                        type="button"
                        disabled
                        className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-black text-neutral-400"
                      >
                        Ver comprobante
                      </button>
                      <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-neutral-500">
                        Comprobante disponible cuando se conecte la pasarela de
                        pagos.
                      </p>
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
