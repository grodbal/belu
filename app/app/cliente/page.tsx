import ClientePanelOriginalPage from "@/components/cliente-panel-original/ClientePanelOriginalPage";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { crearPlaceholder } from "@/components/cliente-panel-original/clientePanelData";
import type {
  Beluer,
  Service,
  ServiceOffer,
} from "@/components/cliente-panel-original/clientePanelTypes";

type ClientProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  beauty_preference: string | null;
};

type ClientBooking = {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  payment_status: string;
  public_price: number;
  service_price_snapshot: number | null;
  logistic_fee: number;
  is_express: boolean;
  express_fee: number;
  district: string;
  address: string;
  services: {
    name: string;
    category: string;
  } | null;
  beluer_profiles: {
    public_name: string | null;
  } | null;
};

type ServiceRow = {
  id: string;
  name: string;
  category: Service["categoria"];
  description: string | null;
  image_url: string | null;
  is_featured: boolean | null;
  service_type: "primary" | "addon";
  duration_minutes: number | null;
  service_images: {
    id: string;
    image_url: string;
    sort_order: number;
    created_at: string;
  }[] | null;
};

type BeluerProfileRow = {
  id: string;
  public_name: string | null;
  profile_photo_url: string | null;
  districts: string[] | null;
  rating_average: number | null;
  total_bookings: number | null;
  level: string;
};

type SkillOfferRow = {
  service_id: string;
  beluer_profile_id: string;
  status: string;
  beluer_price: number | null;
};

type PricingRuleRow = { service_id: string; minimum_price: number };
type CategoryApprovalRow = { beluer_profile_id: string; category: string; status: string };

const ACTIVE_UPCOMING_BOOKING_STATUSES = new Set([
  "pending",
  "assigned",
  "confirmed",
  "in_progress",
]);

function getLimaDateTimeKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

function getBookingDateTimeKey(booking: ClientBooking) {
  const [hour = "00", minute = "00"] = booking.scheduled_time.split(":");

  return `${booking.scheduled_date}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

function normalizeBeluerCategory(categories: string[]): Beluer["categoria"] {
  const normalizedCategories = categories.map((category) =>
    category.toLowerCase()
  );

  const hasLashes = normalizedCategories.some((category) =>
    category.includes("lash")
  );

  const hasNails = normalizedCategories.some((category) =>
    category.includes("nail")
  );
  const hasBrows = normalizedCategories.some((category) => category.includes("brow"));

  if ((hasLashes && hasNails) || (hasBrows && (hasLashes || hasNails))) return "mixta";
  if (hasLashes) return "lashes";
  if (hasNails) return "nails";
  if (hasBrows) return "brows";

  return "mixta";
}

export default async function ClientePanelPage() {
  const authClient = await createClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  let profile: ClientProfile | null = null;
  let upcomingBookings: ClientBooking[] = [];
  let bookingHistory: ClientBooking[] = [];
  let realBeluers: Beluer[] = [];
  let realServices: Service[] = [];

  if (user) {
    const supabase = createAdminClient();

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .eq("auth_user_id", user.id)
      .single();

    const baseProfile = profileData as Omit<
      ClientProfile,
      "beauty_preference"
    > | null;

    if (baseProfile) {
      const { data: clientProfileData } = await supabase
        .from("client_profiles")
        .select("beauty_preference")
        .eq("profile_id", baseProfile.id)
        .maybeSingle();

      profile = {
        ...baseProfile,
        beauty_preference: clientProfileData?.beauty_preference || null,
      };
    }

    const { data: servicesData } = await supabase
      .from("services")
      .select(
        `
        id,
        name,
        category,
        description,
        service_type,
        duration_minutes,
        image_url,
        is_featured,
        service_images (
          id,
          image_url,
          sort_order,
          created_at
        )
      `
      )
      .eq("status", "active")
      .in("category", ["lashes", "brows", "nails"])
      .order("category", { ascending: true })
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true });

    const services = (servicesData as ServiceRow[] | null) || [];
    const serviceIds = services.map((service) => service.id);
    const [{ data: skillsData }, { data: rulesData }] = serviceIds.length
      ? await Promise.all([
          supabase.from("beluer_service_skills").select("service_id,beluer_profile_id,status,beluer_price").in("service_id", serviceIds).eq("status", "active").not("beluer_price", "is", null),
          supabase.from("service_pricing_rules").select("service_id,minimum_price").in("service_id", serviceIds),
        ])
      : [{ data: [] }, { data: [] }];
    const skills = (skillsData as SkillOfferRow[] | null) || [];
    const rules = (rulesData as PricingRuleRow[] | null) || [];
    const profileIds = [...new Set(skills.map((skill) => skill.beluer_profile_id))];
    const [{ data: profilesData }, { data: approvalsData }] = profileIds.length
      ? await Promise.all([
          supabase.from("beluer_profiles").select("id,public_name,profile_photo_url,districts,rating_average,total_bookings,level").in("id", profileIds).eq("status", "approved").eq("is_available", true),
          supabase.from("beluer_category_approvals").select("beluer_profile_id,category,status").in("beluer_profile_id", profileIds).eq("status", "approved"),
        ])
      : [{ data: [] }, { data: [] }];
    const profiles = (profilesData as BeluerProfileRow[] | null) || [];
    const approvals = (approvalsData as CategoryApprovalRow[] | null) || [];
    const ruleByService = new Map((rules as PricingRuleRow[]).map((rule) => [rule.service_id, Number(rule.minimum_price)]));
    const profileById = new Map(profiles.map((beluer) => [beluer.id, beluer]));
    const serviceById = new Map(services.map((service) => [service.id, service]));
    const offersByService = new Map<string, ServiceOffer[]>();
    skills.forEach((skill) => {
      const service = serviceById.get(skill.service_id);
      const profile = profileById.get(skill.beluer_profile_id);
      const minimumPrice = ruleByService.get(skill.service_id);
      if (!service || !profile || minimumPrice == null || skill.beluer_price == null || Number(skill.beluer_price) < minimumPrice) return;
      if (!approvals.some((approval) => approval.beluer_profile_id === profile.id && approval.category === service.category)) return;
      const offer: ServiceOffer = {
        beluerProfileId: profile.id,
        nombre: profile.public_name || "Beluer verificada",
        foto: profile.profile_photo_url || "",
        nivel: profile.level,
        rating: profile.rating_average == null ? "Sin calificación" : Number(profile.rating_average).toFixed(1),
        citas: Number(profile.total_bookings || 0),
        distritos: profile.districts || [],
        beluerPrice: Number(skill.beluer_price),
      };
      offersByService.set(skill.service_id, [...(offersByService.get(skill.service_id) || []), offer]);
    });

    realServices = services.map(
      (service): Service => {
        const galleryImages = [...(service.service_images || [])].sort(
          (first, second) => {
            const orderDifference =
              Number(first.sort_order || 0) - Number(second.sort_order || 0);

            if (orderDifference !== 0) return orderDifference;

            return String(first.created_at || "").localeCompare(
              String(second.created_at || "")
            );
          }
        );

        return {
          id: service.id,
          nombre: service.name,
          precio: Math.min(...(offersByService.get(service.id) || []).map((offer) => offer.beluerPrice), Number.POSITIVE_INFINITY),
          logisticFee: 10,
          desc: service.description || "",
          foto:
            service.image_url ||
            crearPlaceholder(
              service.name,
              service.category === "nails" ? "D81B60" : "AD1457"
            ),
          categoria: service.category,
          serviceType: service.service_type,
          durationMinutes: service.duration_minutes,
          offers: (offersByService.get(service.id) || []).sort((a, b) => a.beluerPrice - b.beluerPrice),
          image_url: service.image_url,
          is_featured: service.is_featured,
          gallery_images: galleryImages,
        };
      }
    );
    realServices = realServices.filter((service) => (service.offers || []).length > 0);
    const beluerOfferMap = new Map<string, { profile: BeluerProfileRow; services: string[]; categories: string[] }>();
    realServices.forEach((service) => (service.offers || []).forEach((offer) => {
      const profile = profileById.get(offer.beluerProfileId);
      if (!profile) return;
      const current = beluerOfferMap.get(profile.id) || { profile, services: [], categories: [] };
      current.services.push(service.nombre);
      current.categories.push(service.categoria);
      beluerOfferMap.set(profile.id, current);
    }));
    realBeluers = [...beluerOfferMap.values()].map(({ profile, services: activeServices, categories }): Beluer => ({
      id: profile.id,
      nombre: profile.public_name || "Beluer verificada",
      foto: profile.profile_photo_url || "",
      espec: activeServices.slice(0, 2).join(" + ") || "Especialista belu",
      categoria: normalizeBeluerCategory(categories),
      rating: profile.rating_average == null ? "Sin calificación" : Number(profile.rating_average).toFixed(1),
      citas: Number(profile.total_bookings || 0),
      serviciosActivos: [...new Set(activeServices)],
      distritos: profile.districts || [],
      nivel: profile.level,
    }));

    if (profile) {
      const bookingsSelect = `
        id,
        scheduled_date,
        scheduled_time,
        status,
        payment_status,
        public_price,
        service_price_snapshot,
        logistic_fee,
        is_express,
        express_fee,
        district,
        address,
        services (
          name,
          category
        ),
        beluer_profiles (
          public_name
        )
      `;

      const { data: historyData } = await supabase
        .from("bookings")
        .select(bookingsSelect)
        .eq("client_profile_id", profile.id)
        .order("scheduled_date", { ascending: false })
        .order("scheduled_time", { ascending: false });

      bookingHistory = (historyData as ClientBooking[] | null) || [];
      const nowInLima = getLimaDateTimeKey();

      upcomingBookings = bookingHistory
        .filter(
          (booking) =>
            ACTIVE_UPCOMING_BOOKING_STATUSES.has(booking.status) &&
            getBookingDateTimeKey(booking) >= nowInLima
        )
        .sort((first, second) =>
          getBookingDateTimeKey(first).localeCompare(
            getBookingDateTimeKey(second)
          )
        );
    }
  }

  return (
    <ClientePanelOriginalPage
      clientProfile={profile}
      upcomingBookings={upcomingBookings}
      bookingHistory={bookingHistory}
      realBeluers={realBeluers}
      realServices={realServices}
    />
  );
}
