import ClientePanelOriginalPage from "@/components/cliente-panel-original/ClientePanelOriginalPage";
import LogoutButton from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { crearPlaceholder } from "@/components/cliente-panel-original/clientePanelData";
import type {
  Beluer,
  Service,
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

type BeluerServiceSkillRow = {
  status: string;
  services: {
    name: string;
    category: string;
  } | null;
};

type ServiceRow = {
  id: string;
  name: string;
  category: Service["categoria"];
  description: string | null;
  public_price: number;
};

type BeluerProfileRow = {
  id: string;
  public_name: string | null;
  profile_photo_url: string | null;
  districts: string[] | null;
  rating_average: number | null;
  total_bookings: number | null;
  beluer_service_skills: BeluerServiceSkillRow[] | null;
};

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

  if (hasLashes && hasNails) return "mixta";
  if (hasLashes) return "lashes";
  if (hasNails) return "nails";

  return "mixta";
}

export default async function ClientePanelPage() {
  const authClient = await createClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  let profile: ClientProfile | null = null;
  let nextBooking: ClientBooking | null = null;
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
      .select("id, name, category, description, public_price")
      .eq("status", "active")
      .in("category", ["lashes", "nails"])
      .order("category", { ascending: true })
      .order("public_price", { ascending: true });

    realServices = ((servicesData as ServiceRow[] | null) || []).map(
      (service): Service => ({
        id: service.id,
        nombre: service.name,
        precio: Number(service.public_price),
        desc: service.description || "",
        foto: crearPlaceholder(
          service.name,
          service.category === "nails" ? "D81B60" : "AD1457"
        ),
        categoria: service.category,
      })
    );

    const { data: beluersData } = await supabase
      .from("beluer_profiles")
      .select(
        `
        id,
        public_name,
        profile_photo_url,
        districts,
        rating_average,
        total_bookings,
        beluer_service_skills (
          status,
          services (
            name,
            category
          )
        )
      `
      )
      .eq("status", "approved")
      .eq("is_available", true)
      .order("rating_average", { ascending: false });

    realBeluers = ((beluersData as BeluerProfileRow[] | null) || [])
      .map((beluer): Beluer => {
        const activeSkills =
          beluer.beluer_service_skills?.filter(
            (skill) => skill.status === "active"
          ) || [];

        const servicios = activeSkills
          .map((skill) => skill.services?.name)
          .filter((name): name is string => Boolean(name));

        const categorias = activeSkills
          .map((skill) => skill.services?.category)
          .filter((category): category is string => Boolean(category));

        return {
          nombre: beluer.public_name || "Beluer verificada",
          foto: beluer.profile_photo_url || "/beluer-placeholder.jpg",
          espec:
            servicios.length > 0
              ? servicios.slice(0, 2).join(" + ")
              : "Especialista belu",
          categoria: normalizeBeluerCategory(categorias),
          rating: Number(beluer.rating_average || 5).toFixed(1),
          citas: Number(beluer.total_bookings || 0),
          serviciosActivos: servicios,
        };
      })
      .filter((beluer) => beluer.serviciosActivos.length > 0);

    if (profile) {
      const bookingsSelect = `
        id,
        scheduled_date,
        scheduled_time,
        status,
        payment_status,
        public_price,
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

      const { data: bookingData } = await supabase
        .from("bookings")
        .select(bookingsSelect)
        .eq("client_profile_id", profile.id)
        .in("status", ["pending", "assigned", "confirmed", "in_progress"])
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true })
        .limit(1)
        .maybeSingle();

      nextBooking = bookingData as ClientBooking | null;

      const { data: historyData } = await supabase
        .from("bookings")
        .select(bookingsSelect)
        .eq("client_profile_id", profile.id)
        .order("scheduled_date", { ascending: false })
        .order("scheduled_time", { ascending: false });

      bookingHistory = (historyData as ClientBooking[] | null) || [];
    }
  }

  return (
    <>
      <ClientePanelOriginalPage
        clientProfile={profile}
        nextBooking={nextBooking}
        bookingHistory={bookingHistory}
        realBeluers={realBeluers}
        realServices={realServices}
      />

      <LogoutButton className="fixed right-6 bottom-6 z-50 rounded-full bg-[#E60023] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#C4001D]" />
    </>
  );
}
