import { createAdminClient } from "@/lib/supabase/admin";
import CreateServiceForm from "@/components/admin-panel-original/CreateServiceForm";
import AdminServiceCard, {
  type AdminServiceCardData,
} from "@/components/admin-panel-original/AdminServiceCard";

type ServiceGalleryImage = {
  id: string;
  service_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
};

type ServiceWithoutGallery = Omit<AdminServiceCardData, "gallery_images">;

const categoryOrder: Record<AdminServiceCardData["category"], number> = {
  lashes: 0,
  nails: 1,
};

function sortServices(
  services: AdminServiceCardData[]
): AdminServiceCardData[] {
  return [...services].sort((firstService, secondService) => {
    const statusDifference =
      Number(secondService.status === "active") -
      Number(firstService.status === "active");
    if (statusDifference !== 0) return statusDifference;

    const featuredDifference =
      Number(secondService.is_featured) - Number(firstService.is_featured);
    if (featuredDifference !== 0) return featuredDifference;

    const categoryDifference =
      categoryOrder[firstService.category] - categoryOrder[secondService.category];
    if (categoryDifference !== 0) return categoryDifference;

    const priceDifference =
      Number(firstService.public_price) - Number(secondService.public_price);
    if (priceDifference !== 0) return priceDifference;

    return firstService.name.localeCompare(secondService.name, "es");
  });
}

export default async function AdminServicesRealList() {
  const supabase = createAdminClient();

  const { data: services, error } = await supabase
    .from("services")
    .select(
      "id, category, name, description, public_price, logistic_fee, base_price, duration_minutes, image_url, is_featured, status, created_at"
    )
    .order("category", { ascending: true })
    .order("public_price", { ascending: true });

  if (error) {
    return (
      <div className="rounded-[2rem] bg-[#FFD6E2] p-6 text-[#E60023]">
        <h3 className="text-lg font-black">Error al cargar servicios</h3>
        <p className="mt-2 text-sm font-bold">{error.message}</p>
      </div>
    );
  }

  const baseServices = (services as ServiceWithoutGallery[] | null) || [];
  const serviceIds = baseServices.map((service) => service.id);
  let galleryImages: ServiceGalleryImage[] = [];

  if (serviceIds.length > 0) {
    const { data: galleryData, error: galleryError } = await supabase
      .from("service_images")
      .select("id, service_id, image_url, sort_order, created_at")
      .in("service_id", serviceIds)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (galleryError) {
      return (
        <div className="rounded-[2rem] bg-[#FFD6E2] p-6 text-[#E60023]">
          <h3 className="text-lg font-black">Error al cargar galeria</h3>
          <p className="mt-2 text-sm font-bold">{galleryError.message}</p>
        </div>
      );
    }

    galleryImages = (galleryData as ServiceGalleryImage[] | null) || [];
  }

  const galleryImagesByService = new Map<string, ServiceGalleryImage[]>();

  for (const image of galleryImages) {
    const currentImages = galleryImagesByService.get(image.service_id) || [];
    currentImages.push(image);
    galleryImagesByService.set(image.service_id, currentImages);
  }

  const servicesList = sortServices(
    baseServices.map((service) => ({
      ...service,
      gallery_images: galleryImagesByService.get(service.id) || [],
    }))
  );

  return (
    <section className="admin-real-panel rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#E60023]">
            Catalogo oficial
          </p>

          <h2 className="text-2xl font-black text-[#1A1A1A]">
            Servicios belu
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            Servicios activos primero, destacados arriba y ordenados por
            categoria, precio y nombre.
          </p>
        </div>

        <div className="rounded-full bg-[#FFD6E2] px-4 py-2 text-sm font-black text-[#E60023]">
          {servicesList.length} servicio
          {servicesList.length === 1 ? "" : "s"}
        </div>
      </div>

      <CreateServiceForm />

      {servicesList.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-[#E60023]/30 bg-white p-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#E60023]">
            Sin servicios
          </p>

          <h3 className="mt-3 text-2xl font-black text-[#1A1A1A]">
            Aun no hay servicios registrados
          </h3>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
            Los servicios oficiales de belu apareceran aqui cuando se registren
            en Supabase.
          </p>
        </div>
      ) : (
        <div className="admin-services-card-list">
          {servicesList.map((service) => (
            <AdminServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </section>
  );
}
