import { createAdminClient } from "@/lib/supabase/admin";
import CreateServiceForm from "@/components/admin-panel-original/CreateServiceForm";
import EditServiceForm from "@/components/admin-panel-original/EditServiceForm";
import ServiceImageGalleryManager from "@/components/admin-panel-original/ServiceImageGalleryManager";
import UpdateServiceStatusForm from "@/components/admin-panel-original/UpdateServiceStatusForm";

type ServiceGalleryImage = {
  id: string;
  service_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
};

type Service = {
  id: string;
  category: "lashes" | "nails";
  name: string;
  description: string | null;
  public_price: number;
  logistic_fee: number;
  base_price: number;
  duration_minutes: number;
  image_url: string | null;
  is_featured: boolean;
  status: "active" | "inactive";
  created_at: string;
  gallery_images: ServiceGalleryImage[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);
}

function getCategoryLabel(category: Service["category"]) {
  if (category === "lashes") return "Lashes";
  if (category === "nails") return "Nails";
  return category;
}

function getBeluerPayments(basePrice: number) {
  return {
    standard: basePrice * 0.87,
    premium: basePrice * 0.9,
    top: basePrice * 0.92,
  };
}

function ServiceThumbnail({ service }: { service: Service }) {
  if (service.image_url) {
    return (
      <img
        src={service.image_url}
        alt={service.name}
        className="h-14 w-14 rounded-2xl object-cover ring-1 ring-black/5"
      />
    );
  }

  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD6E2] text-lg font-black text-[#E60023] ring-1 ring-black/5">
      {service.name.slice(0, 1).toUpperCase()}
    </div>
  );
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

  const baseServices = (services as Omit<Service, "gallery_images">[] | null) || [];
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

  const servicesList: Service[] = baseServices.map((service) => ({
    ...service,
    gallery_images: galleryImagesByService.get(service.id) || [],
  }));

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
            Estos son los servicios con precio fijo para clientas. El pago a la
            Beluer se calcula sobre el precio base, segun su nivel.
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
        <div className="overflow-hidden rounded-[1.5rem] border border-neutral-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
              <thead className="bg-[#F7F3F0] text-xs uppercase tracking-[0.16em] text-neutral-500">
                <tr>
                  <th className="px-5 py-4 font-black">Servicio</th>
                  <th className="px-5 py-4 font-black">Categoria</th>
                  <th className="px-5 py-4 font-black">Precio publico</th>
                  <th className="px-5 py-4 font-black">Base / Logistica</th>
                  <th className="px-5 py-4 font-black">Pago Beluer</th>
                  <th className="px-5 py-4 font-black">Duracion</th>
                  <th className="px-5 py-4 font-black">Estado</th>
                  <th className="px-5 py-4 font-black">Gestion</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {servicesList.map((service) => {
                  const payments = getBeluerPayments(service.base_price);

                  return (
                    <tr key={service.id} className="align-top">
                      <td className="px-5 py-5">
                        <div className="flex min-w-[260px] gap-3">
                          <ServiceThumbnail service={service} />

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-black text-[#1A1A1A]">
                                {service.name}
                              </p>

                              {service.is_featured ? (
                                <span className="rounded-full bg-[#E60023] px-2.5 py-1 text-[10px] font-black uppercase text-white">
                                  Destacado
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-neutral-500">
                              {service.description || "Sin descripcion"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span className="rounded-full bg-[#FFD6E2] px-3 py-1 text-xs font-black text-[#E60023]">
                          {getCategoryLabel(service.category)}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-lg font-black text-[#1A1A1A]">
                          {formatCurrency(service.public_price)}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          Precio final visible para clientas
                        </p>
                      </td>

                      <td className="px-5 py-5 text-xs text-neutral-500">
                        <p>
                          Precio base:{" "}
                          <strong className="text-[#1A1A1A]">
                            {formatCurrency(service.base_price)}
                          </strong>
                        </p>

                        <p className="mt-1">
                          Logistica:{" "}
                          <strong className="text-[#1A1A1A]">
                            {formatCurrency(service.logistic_fee)}
                          </strong>
                        </p>
                      </td>

                      <td className="px-5 py-5 text-xs text-neutral-500">
                        <p>
                          Estandar:{" "}
                          <strong className="text-[#1A1A1A]">
                            {formatCurrency(payments.standard)}
                          </strong>
                        </p>

                        <p className="mt-1">
                          Premium:{" "}
                          <strong className="text-[#1A1A1A]">
                            {formatCurrency(payments.premium)}
                          </strong>
                        </p>

                        <p className="mt-1">
                          Top:{" "}
                          <strong className="text-[#1A1A1A]">
                            {formatCurrency(payments.top)}
                          </strong>
                        </p>
                      </td>

                      <td className="px-5 py-5 text-sm font-black text-[#1A1A1A]">
                        {service.duration_minutes} min
                      </td>

                      <td className="px-5 py-5">
                        <div className="space-y-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                              service.status === "active"
                                ? "bg-green-50 text-green-700"
                                : "bg-neutral-100 text-neutral-500"
                            }`}
                          >
                            {service.status === "active" ? "Activo" : "Inactivo"}
                          </span>

                          <UpdateServiceStatusForm
                            serviceId={service.id}
                            currentStatus={service.status}
                          />
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="min-w-[260px]">
                          <EditServiceForm
                            serviceId={service.id}
                            category={service.category}
                            name={service.name}
                            description={service.description || ""}
                            publicPrice={service.public_price}
                            logisticFee={service.logistic_fee}
                            durationMinutes={service.duration_minutes}
                          />

                          <ServiceImageGalleryManager
                            serviceId={service.id}
                            images={service.gallery_images}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
