import { createAdminClient } from "@/lib/supabase/admin";
import UpdateBeluerStatusForm from "@/components/admin-panel-original/UpdateBeluerStatusForm";
import UpdateBeluerLevelForm from "@/components/admin-panel-original/UpdateBeluerLevelForm";
import UpdateBeluerAvailabilityForm from "@/components/admin-panel-original/UpdateBeluerAvailabilityForm";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
};

type BeluerProfile = {
  id: string;
  profile_id: string;
  public_name: string | null;
  instagram: string | null;
  phone: string | null;
  districts: string[] | string | null;
  experience_years: number | null;
  level: string | null;
  status: string | null;
  rating_average: number | null;
  total_bookings: number | null;
  is_available: boolean | null;
  created_at: string | null;
};

function formatDistricts(districts: BeluerProfile["districts"]) {
  if (!districts) return "Sin distritos";

  if (Array.isArray(districts)) {
    return districts.length > 0 ? districts.join(", ") : "Sin distritos";
  }

  return districts;
}

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getBeluerLevelLabel(level: string | null) {
  if (level === "premium") return "✦✦ Premium";
  if (level === "top") return "✦✦✦ Top";
  return "✦ Estándar";
}

function getBeluerCommission(level: string | null) {
  if (level === "premium") {
    return {
      beluCommission: "10%",
      beluerPayment: "90%",
      requirement: "50+ servicios · rating ≥ 4.7",
    };
  }

  if (level === "top") {
    return {
      beluCommission: "8%",
      beluerPayment: "92%",
      requirement: "100+ servicios · rating ≥ 4.8",
    };
  }

  return {
    beluCommission: "13%",
    beluerPayment: "87%",
    requirement: "< 50 servicios",
  };
}

export default async function AdminBeluersRealList() {
  const supabase = createAdminClient();

  const { data: beluerProfiles, error: beluerError } = await supabase
    .from("beluer_profiles")
    .select(
      "id, profile_id, public_name, instagram, phone, districts, experience_years, level, status, rating_average, total_bookings, is_available, created_at"
    )
    .order("created_at", { ascending: false });

  if (beluerError) {
    return (
      <div className="rounded-[2rem] bg-[#FFD6E2] p-6 text-[#E60023]">
        <h3 className="text-lg font-black">Error al cargar Beluers</h3>
        <p className="mt-2 text-sm font-bold">{beluerError.message}</p>
      </div>
    );
  }

  const profileIds = beluerProfiles?.map((beluer) => beluer.profile_id) ?? [];

  const { data: profiles, error: profilesError } =
    profileIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, email, phone, role")
          .in("id", profileIds)
      : { data: [], error: null };

  if (profilesError) {
    return (
      <div className="rounded-[2rem] bg-[#FFD6E2] p-6 text-[#E60023]">
        <h3 className="text-lg font-black">Error al cargar perfiles</h3>
        <p className="mt-2 text-sm font-bold">{profilesError.message}</p>
      </div>
    );
  }

  const profilesById = new Map(
    (profiles as Profile[]).map((profile) => [profile.id, profile])
  );

  if (!beluerProfiles || beluerProfiles.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[#E60023]/30 bg-white p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#E60023]">
          Sin Beluers
        </p>
        <h3 className="mt-3 text-2xl font-black text-[#1A1A1A]">
          Aún no hay especialistas registradas
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
          Cuando crees una Beluer desde el formulario, aparecerá aquí con su
          información operativa.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-14 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#E60023]">
            Base real
          </p>

          <h2 className="text-3xl font-black tracking-tight text-[#1A1A1A]">
  Beluers registradas
</h2>

          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
  Esta lista ya lee datos reales desde Supabase.
</p>
        </div>

        <div className="rounded-full bg-[#FFD6E2] px-4 py-2 text-sm font-black text-[#E60023]">
          {beluerProfiles.length} Beluer{beluerProfiles.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-neutral-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-[#F7F3F0] text-xs uppercase tracking-[0.16em] text-neutral-500">
              <tr>
                <th className="px-5 py-4 font-black">Beluer</th>
<th className="px-5 py-4 font-black">Contacto</th>
<th className="px-5 py-4 font-black">Distritos</th>
<th className="px-5 py-4 font-black">Nivel</th>
<th className="px-5 py-4 font-black">Estado</th>
<th className="px-5 py-4 font-black">Disponible</th>
<th className="px-5 py-4 font-black">Actividad</th>
<th className="px-5 py-4 font-black">Gestión</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {beluerProfiles.map((beluer) => {
                const profile = profilesById.get(beluer.profile_id);

                return (
                  <tr key={beluer.id} className="align-top">
                    <td className="px-5 py-5">
                      <p className="font-black text-[#1A1A1A]">
                        {beluer.public_name ||
                          profile?.full_name ||
                          "Beluer sin nombre"}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        Creada el {formatDate(beluer.created_at)}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="font-bold text-[#1A1A1A]">
                        {profile?.email || "Sin correo"}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {beluer.phone || profile?.phone || "Sin teléfono"}
                      </p>

                      <p className="mt-1 text-xs text-[#E60023]">
                        {beluer.instagram || "Sin Instagram"}
                      </p>
                    </td>

                    <td className="px-5 py-5 text-neutral-600">
                      {formatDistricts(beluer.districts)}
                    </td>

                    <td className="px-5 py-5">
  <div className="space-y-3">
    <div className="space-y-2">
      <span className="inline-flex rounded-full bg-[#FFD6E2] px-3 py-1 text-xs font-black text-[#E60023]">
        {getBeluerLevelLabel(beluer.level)}
      </span>

      <div className="space-y-1 text-xs text-neutral-500">
        <p>
          Comisión belu:{" "}
          <strong className="text-[#1A1A1A]">
            {getBeluerCommission(beluer.level).beluCommission}
          </strong>
        </p>

        <p>
          Pago Beluer:{" "}
          <strong className="text-[#1A1A1A]">
            {getBeluerCommission(beluer.level).beluerPayment}
          </strong>
        </p>

        <p className="max-w-[170px] leading-snug">
          {getBeluerCommission(beluer.level).requirement}
        </p>
      </div>
    </div>

      </div>
</td>

                    <td className="px-5 py-5">
  <div className="space-y-3">
    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-700">
      {beluer.status || "pending"}
    </span>

      </div>
</td>

                    <td className="px-5 py-5">
  <div className="space-y-3">
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        beluer.is_available
          ? "bg-green-50 text-green-700"
          : "bg-neutral-100 text-neutral-500"
      }`}
    >
      {beluer.is_available ? "Sí" : "No"}
    </span>

      </div>
</td>

                    <td className="px-5 py-5 text-xs text-neutral-500">
                      <p>
                        Reservas:{" "}
                        <strong className="text-[#1A1A1A]">
                          {beluer.total_bookings ?? 0}
                        </strong>
                      </p>

                      <p className="mt-1">
                        Rating:{" "}
                        <strong className="text-[#1A1A1A]">
                          {beluer.rating_average ?? 0}
                        </strong>
                      </p>

                      <p className="mt-1">
                        Exp.:{" "}
                        <strong className="text-[#1A1A1A]">
                          {beluer.experience_years ?? 0} años
                        </strong>
                      </p>
                    </td>
                    <td className="px-5 py-5">
  <div className="min-w-[260px] space-y-5">
    <div>
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400">
        Nivel
      </p>

      <UpdateBeluerLevelForm
        beluerProfileId={beluer.id}
        currentLevel={beluer.level || "standard"}
      />
    </div>

    <div>
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400">
        Estado
      </p>

      <UpdateBeluerStatusForm
        beluerProfileId={beluer.id}
        currentStatus={beluer.status}
      />
    </div>

    <div>
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400">
        Disponibilidad
      </p>

      <UpdateBeluerAvailabilityForm
        beluerProfileId={beluer.id}
        isAvailable={beluer.is_available}
      />
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