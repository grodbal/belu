import { createAdminClient } from "@/lib/supabase/admin";

type BeluerPhoto = {
  id: string;
  beluer_id: string;
  image_url: string;
  category: string;
  caption: string | null;
  is_cover: boolean;
  is_featured: boolean;
  status: "pending_review" | "approved" | "rejected";
  review_notes: string | null;
  created_at: string;
};

type BeluerProfile = {
  id: string;
  public_name: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getCategoryLabel(category: string) {
  if (category === "lashes") return "Lashes";
  if (category === "nails") return "Nails";
  if (category === "brows") return "Brows";
  if (category === "addon") return "Addon";
  return category;
}

function getPhotoStatusLabel(status: BeluerPhoto["status"]) {
  const labels: Record<BeluerPhoto["status"], string> = {
    pending_review: "Pendiente de revisión",
    approved: "Aprobada",
    rejected: "Rechazada",
  };

  return labels[status];
}

function isMissingTableError(message: string) {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("beluer_photos") &&
    (normalizedMessage.includes("does not exist") ||
      normalizedMessage.includes("no existe") ||
      normalizedMessage.includes("schema cache") ||
      normalizedMessage.includes("could not find the table"))
  );
}

export default async function AdminPhotosRealList() {
  const supabase = createAdminClient();

  const { data: photos, error: photosError } = await supabase
    .from("beluer_photos")
    .select(
      "id, beluer_id, image_url, category, caption, is_cover, is_featured, status, review_notes, created_at"
    )
    .order("created_at", { ascending: false });

  if (photosError) {
    if (isMissingTableError(photosError.message)) {
      // Fase posterior: conectar beluer_photos + Supabase Storage para moderación real de portafolio.
      return <AdminPhotosEmptyState />;
    }

    return (
      <div className="rounded-[2rem] bg-[#FFD6E2] p-6 text-[#E60023]">
        <h3 className="text-lg font-black">Error al cargar fotos</h3>
        <p className="mt-2 text-sm font-bold">{photosError.message}</p>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return <AdminPhotosEmptyState />;
  }

  const typedPhotos = photos as BeluerPhoto[];
  const beluerIds = typedPhotos.map((photo) => photo.beluer_id);

  const { data: beluerProfiles, error: beluerProfilesError } =
    beluerIds.length > 0
      ? await supabase
          .from("beluer_profiles")
          .select("id, public_name")
          .in("id", beluerIds)
      : { data: [], error: null };

  if (beluerProfilesError) {
    return (
      <div className="rounded-[2rem] bg-[#FFD6E2] p-6 text-[#E60023]">
        <h3 className="text-lg font-black">Error al cargar Beluers</h3>
        <p className="mt-2 text-sm font-bold">{beluerProfilesError.message}</p>
      </div>
    );
  }

  const beluersById = new Map(
    (beluerProfiles as BeluerProfile[]).map((beluer) => [beluer.id, beluer])
  );

  return (
    <section className="admin-real-panel rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#E60023]">
            Datos reales
          </p>
          <h2 className="text-2xl font-black text-[#1A1A1A]">
            Fotos de portafolio
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            Fotos leídas desde Supabase. La moderación persistente y Storage
            quedan pendientes para una fase posterior.
          </p>
        </div>

        <div className="rounded-full bg-[#FFD6E2] px-4 py-2 text-sm font-black text-[#E60023]">
          {typedPhotos.length} foto{typedPhotos.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {typedPhotos.map((photo) => {
          const beluer = beluersById.get(photo.beluer_id);

          return (
            <article
              key={photo.id}
              className="overflow-hidden rounded-[1.5rem] border border-neutral-100 bg-white"
            >
              <img
                src={photo.image_url}
                alt={photo.caption || "Foto real de portafolio Beluer"}
                className="h-56 w-full object-cover"
              />

              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full bg-[#FFD6E2] px-3 py-1 text-xs font-black text-[#E60023]">
                    {getPhotoStatusLabel(photo.status)}
                  </span>
                  <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-700">
                    {getCategoryLabel(photo.category)}
                  </span>
                  {photo.is_featured ? (
                    <span className="inline-flex rounded-full bg-neutral-900 px-3 py-1 text-xs font-black text-white">
                      Destacada
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-4 text-lg font-black text-[#1A1A1A]">
                  {beluer?.public_name || "Beluer sin nombre"}
                </h3>
                <p className="mt-1 text-xs font-bold text-neutral-500">
                  Subida el {formatDate(photo.created_at)}
                </p>

                {photo.caption ? (
                  <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                    {photo.caption}
                  </p>
                ) : null}

                {photo.review_notes ? (
                  <p className="mt-3 text-xs leading-relaxed text-neutral-400">
                    Nota: {photo.review_notes}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled
                    className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-black text-neutral-400"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    disabled
                    className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-black text-neutral-400"
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    disabled
                    className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-black text-neutral-400"
                  >
                    Destacar
                  </button>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-neutral-500">
                  La moderación de fotos se activará cuando conectemos Supabase
                  Storage.
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AdminPhotosEmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#E60023]/30 bg-white p-8 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#E60023]">
        Sin fotos pendientes
      </p>
      <h3 className="mt-3 text-2xl font-black text-[#1A1A1A]">
        Aún no hay fotos pendientes de revisión.
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
        Cuando exista un flujo real de portafolio, las fotos aparecerán aquí
        para revisión sin usar imágenes ficticias.
      </p>
    </div>
  );
}
