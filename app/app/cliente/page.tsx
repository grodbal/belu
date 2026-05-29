import ClientePanelOriginalPage from "@/components/cliente-panel-original/ClientePanelOriginalPage";
import LogoutButton from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ClientProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

type ClientBooking = {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  payment_status: string;
  public_price: number;
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

export default async function ClientePanelPage() {
  const authClient = await createClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  let profile: ClientProfile | null = null;
  let nextBooking: ClientBooking | null = null;

  if (user) {
    const supabase = createAdminClient();

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .eq("auth_user_id", user.id)
      .single();

    profile = profileData as ClientProfile | null;

    if (profile) {
      const { data: bookingData } = await supabase
        .from("bookings")
        .select(
          `
          id,
          scheduled_date,
          scheduled_time,
          status,
          payment_status,
          public_price,
          district,
          address,
          services (
            name,
            category
          ),
          beluer_profiles (
            public_name
          )
        `
        )
        .eq("client_profile_id", profile.id)
        .not("status", "eq", "cancelled")
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true })
        .limit(1)
        .maybeSingle();

      nextBooking = bookingData as ClientBooking | null;
    }
  }

  return (
    <>
      <ClientePanelOriginalPage
        clientProfile={profile}
        nextBooking={nextBooking}
      />

      <LogoutButton className="fixed right-6 bottom-6 z-50 rounded-full bg-[#E60023] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#C4001D]" />
    </>
  );
}