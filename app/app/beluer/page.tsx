import LogoutButton from "@/components/auth/LogoutButton";
import BeluerPanelOriginalPage from "@/components/beluer-panel-original/BeluerPanelOriginalPage";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  FotoPortafolio,
  ReservaBeluer,
  IngresoBeluer,
  ServicioBeluer,
} from "@/components/beluer-panel-original/beluerPanelTypes";

type BeluerPanelProfile = {
  publicName: string;
  firstName: string;
  levelLabel: "Beluer Nueva" | "Beluer Verificada" | "Beluer Top ✦";
  statusLabel: "Activo" | "En revisión" | "Pausado";
  photoUrl: string;
  initials: string;
  rating: string;
  instagram: string;
  phone: string;
  bio: string;
  experienceYears: number;
  districts: string[];
  isAvailable: boolean;
  weeklyIncomeGoal: number;
  monthlyIncomeGoal: number;
  weeklyIncome: number;
  monthlyIncome: number;
  weeklyRangeLabel: string;
};

type BookingRow = {
  id: string;
  client_profile_id: string;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  district: string;
  notes: string | null;
  status: string;
  payment_status: string;
  public_price: number | string | null;
  base_price: number | string | null;
  logistic_fee: number | string | null;
  express_fee: number | string | null;
  beluer_level_snapshot: string | null;
  commission_rate_snapshot: number | string | null;
  belu_commission_amount: number | string | null;
  beluer_service_payout_amount: number | string | null;
  beluer_logistic_payout_amount: number | string | null;
  beluer_express_payout_amount: number | string | null;
  beluer_total_payout_amount: number | string | null;
  beluer_payment_amount: number | string | null;
  commission_locked_at: string | null;
  commission_locked_event: string | null;
  services: {
    name: string;
    category: string;
  } | null;
};

type ClientProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

type BeluerServiceSkillRow = {
  id: string;
  status: string | null;
  services: {
    id: string;
    name: string;
    category: string;
    public_price: number | null;
    base_price: number | null;
    duration_minutes: number | null;
  } | null;
};

type BeluerPhotoRow = {
  id: string;
  image_url: string;
  category: string;
  caption: string | null;
  is_cover: boolean | null;
  status: string | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getLevelLabel(
  level: string | null
): BeluerPanelProfile["levelLabel"] {
  if (level === "top") return "Beluer Top ✦";
  if (level === "premium") return "Beluer Verificada";
  return "Beluer Nueva";
}

function getStatusLabel(
  status: string | null
): BeluerPanelProfile["statusLabel"] {
  if (status === "approved") return "Activo";
  if (status === "paused" || status === "rejected") return "Pausado";
  return "En revisión";
}

function mapBookingStatusToBeluerStatus(
  status: string
): ReservaBeluer["estado"] {
  if (status === "cancelled") return "rechazada";

  if (
    status === "confirmed" ||
    status === "in_progress" ||
    status === "completed"
  ) {
    return "aceptada";
  }

  return "pendiente";
}

function moneyToNumber(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount) ? amount : 0;
}

function nullableRateToNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;

  const rate = Number(value);

  return Number.isFinite(rate) ? rate : null;
}

function getBookingBeluerPayoutTotal(booking: BookingRow) {
  if (booking.beluer_total_payout_amount != null) {
    return moneyToNumber(booking.beluer_total_payout_amount);
  }

  if (booking.beluer_payment_amount != null) {
    return moneyToNumber(booking.beluer_payment_amount);
  }

  return moneyToNumber(booking.public_price);
}

function getBookingPayoutBreakdown(booking: BookingRow) {
  const totalBeluer = getBookingBeluerPayoutTotal(booking);
  const publicPrice = moneyToNumber(booking.public_price);
  const logisticFee = moneyToNumber(booking.logistic_fee);
  const pagoLogisticaBeluer =
    booking.beluer_logistic_payout_amount != null
      ? moneyToNumber(booking.beluer_logistic_payout_amount)
      : logisticFee;
  const pagoExpressBeluer =
    booking.beluer_express_payout_amount != null
      ? moneyToNumber(booking.beluer_express_payout_amount)
      : moneyToNumber(booking.express_fee);
  const pagoServicioBeluer =
    booking.beluer_service_payout_amount != null
      ? moneyToNumber(booking.beluer_service_payout_amount)
      : Math.max(totalBeluer - pagoLogisticaBeluer - pagoExpressBeluer, 0);

  return {
    publicPrice,
    basePrice:
      booking.base_price != null
        ? moneyToNumber(booking.base_price)
        : Math.max(publicPrice - logisticFee, 0),
    logisticFee,
    expressFee: moneyToNumber(booking.express_fee),
    pagoServicioBeluer,
    pagoLogisticaBeluer,
    pagoExpressBeluer,
    totalBeluer,
    nivelAplicado: booking.beluer_level_snapshot,
    comisionAplicada: nullableRateToNumber(booking.commission_rate_snapshot),
    comisionBelu: moneyToNumber(booking.belu_commission_amount),
    commissionLockedAt: booking.commission_locked_at,
    commissionLockedEvent: booking.commission_locked_event,
  };
}

function mapPaymentStatusToIngresoStatus(
  paymentStatus: string
): IngresoBeluer["estadoPago"] {
  if (paymentStatus === "paid") return "pagado";
  if (paymentStatus === "refunded") return "retenido";
  return "pendiente";
}

function mapServiceCategory(
  category: string | null
): ServicioBeluer["categoria"] | null {
  if (category === "lashes" || category === "nails" || category === "brows") {
    return category;
  }

  return null;
}

function formatDuration(minutes: number | null) {
  if (!minutes || minutes <= 0) return "Duración no definida";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}min`;
  }

  if (hours > 0) return `${hours}h`;

  return `${remainingMinutes}min`;
}

function formatDateForDisplay(date: Date) {
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getCurrentWeekRange() {
  const now = new Date();

  const startOfWeek = new Date(now);
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  startOfWeek.setDate(now.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const weeklyRangeLabel = `Semana del ${formatDateForDisplay(
    startOfWeek
  )} al ${formatDateForDisplay(endOfWeek)}`;

  return { startOfWeek, endOfWeek, weeklyRangeLabel };
}

function getCurrentMonthRange() {
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  return { startOfMonth, endOfMonth };
}

function calculateIncomeByDateRange({
  bookings,
  startDate,
  endDate,
}: {
  bookings: BookingRow[];
  startDate: Date;
  endDate: Date;
}) {
  const incomeStatuses = ["assigned", "confirmed", "in_progress", "completed"];

  return bookings
    .filter((booking) => {
      const bookingDate = new Date(`${booking.scheduled_date}T00:00:00`);

      return (
        incomeStatuses.includes(booking.status) &&
        bookingDate >= startDate &&
        bookingDate <= endDate
      );
    })
    .reduce((acc, booking) => acc + getBookingBeluerPayoutTotal(booking), 0);
}

export default async function BeluerPanelPage() {
  const authClient = await createClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  let beluerProfile: BeluerPanelProfile | null = null;
  let realReservas: ReservaBeluer[] = [];
  let realIngresos: IngresoBeluer[] = [];
  let realServicios: ServicioBeluer[] = [];
  let realPortafolio: FotoPortafolio[] = [];

  if (user) {
    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, role")
      .eq("auth_user_id", user.id)
      .single();

    if (profile) {
      const { data: beluer } = await supabase
        .from("beluer_profiles")
        .select(
          `
          id,
          public_name,
          bio,
          instagram,
          phone,
          profile_photo_url,
          districts,
          experience_years,
          level,
          rating_average,
          total_bookings,
          status,
          is_available,
          weekly_income_goal,
          monthly_income_goal
        `
        )
        .eq("profile_id", profile.id)
        .single();

      if (beluer) {
        const { data: serviceSkillsData } = await supabase
          .from("beluer_service_skills")
          .select(
            `
            id,
            status,
            services (
              id,
              name,
              category,
              public_price,
              base_price,
              duration_minutes
            )
          `
          )
          .eq("beluer_profile_id", beluer.id);

        realServicios = ((serviceSkillsData as BeluerServiceSkillRow[] | null) || [])
          .map((skill) => {
            const service = skill.services;
            const category = mapServiceCategory(service?.category || null);

            if (!service || !category) return null;

            const publicPrice = Number(service.public_price || 0);
            const basePrice = Number(service.base_price || publicPrice || 0);

            return {
              id: skill.id,
              nombre: service.name,
              categoria: category,
              precio: publicPrice,
              precioMinimo: basePrice,
              duracion: formatDuration(service.duration_minutes),
              activo: skill.status === "active",
            };
          })
          .filter((service): service is ServicioBeluer => Boolean(service));

        const { data: portfolioData } = await supabase
          .from("beluer_photos")
          .select("id, image_url, category, caption, is_cover, status")
          .eq("beluer_id", beluer.id)
          .eq("status", "approved")
          .order("is_cover", { ascending: false })
          .order("created_at", { ascending: false });

        realPortafolio = ((portfolioData as BeluerPhotoRow[] | null) || [])
          .reduce<FotoPortafolio[]>((acc, photo) => {
            const category = mapServiceCategory(photo.category || null);

            if (!category) return acc;

            acc.push({
              id: photo.id,
              titulo: photo.caption || "Foto de portafolio",
              categoria: category,
              imagen: photo.image_url,
              estado: "aprobada" as const,
              portada: Boolean(photo.is_cover),
            });

            return acc;
          }, []);

        const { data: bookingsData } = await supabase
          .from("bookings")
          .select(
            `
            id,
            client_profile_id,
            scheduled_date,
            scheduled_time,
            address,
            district,
            notes,
            status,
            payment_status,
            public_price,
            base_price,
            logistic_fee,
            express_fee,
            beluer_level_snapshot,
            commission_rate_snapshot,
            belu_commission_amount,
            beluer_service_payout_amount,
            beluer_logistic_payout_amount,
            beluer_express_payout_amount,
            beluer_total_payout_amount,
            beluer_payment_amount,
            commission_locked_at,
            commission_locked_event,
            services (
              name,
              category
            )
          `
          )
          .eq("beluer_profile_id", beluer.id)
          .not("status", "eq", "cancelled")
          .order("scheduled_date", { ascending: true })
          .order("scheduled_time", { ascending: true });

        const bookings = (bookingsData as BookingRow[] | null) || [];

        const { startOfWeek, endOfWeek, weeklyRangeLabel } =
          getCurrentWeekRange();

        const { startOfMonth, endOfMonth } = getCurrentMonthRange();

        const weeklyIncome = calculateIncomeByDateRange({
          bookings,
          startDate: startOfWeek,
          endDate: endOfWeek,
        });

        const monthlyIncome = calculateIncomeByDateRange({
          bookings,
          startDate: startOfMonth,
          endDate: endOfMonth,
        });

        const publicName = beluer.public_name || profile.full_name || "Beluer";

        beluerProfile = {
          publicName,
          firstName: publicName.split(" ")[0] || "Beluer",
          levelLabel: getLevelLabel(beluer.level),
          statusLabel: getStatusLabel(beluer.status),
          photoUrl: beluer.profile_photo_url || "/beluer-placeholder.jpg",
          initials: getInitials(publicName),
          rating: Number(beluer.rating_average || 5).toFixed(1),
          instagram: beluer.instagram || "",
          phone: beluer.phone || profile.phone || "",
          bio: beluer.bio || "",
          experienceYears: Number(beluer.experience_years || 0),
          districts: beluer.districts || [],
          isAvailable: Boolean(beluer.is_available),
          weeklyIncomeGoal: Number(beluer.weekly_income_goal || 1000),
          monthlyIncomeGoal: Number(beluer.monthly_income_goal || 4000),
          weeklyIncome,
          monthlyIncome,
          weeklyRangeLabel,
        };

        const clientIds = Array.from(
          new Set(bookings.map((booking) => booking.client_profile_id))
        );

        let clients: ClientProfileRow[] = [];

        if (clientIds.length > 0) {
          const { data: clientsData } = await supabase
            .from("profiles")
            .select("id, full_name, email, phone")
            .in("id", clientIds);

          clients = (clientsData as ClientProfileRow[] | null) || [];
        }

        realReservas = bookings.map((booking) => {
          const client = clients.find(
            (item) => item.id === booking.client_profile_id
          );
          const payout = getBookingPayoutBreakdown(booking);

          return {
            id: booking.id,
            servicio: booking.services?.name || "Servicio belu",
            clienta: client?.full_name || client?.email || "Clienta belu",
            distrito: booking.district,
            fecha: booking.scheduled_date,
            hora: booking.scheduled_time.slice(0, 5),
            total: payout.totalBeluer,
            direccion: booking.address,
            instrucciones: booking.notes || "Sin instrucciones adicionales.",
            metodoPago:
              booking.payment_status === "paid"
                ? "Pago registrado por belu"
                : "Pendiente de liquidación",
            estado: mapBookingStatusToBeluerStatus(booking.status),
            ...payout,
          };
        });

        realIngresos = bookings
          .filter((booking) =>
            ["assigned", "confirmed", "in_progress", "completed"].includes(
              booking.status
            )
          )
          .map((booking) => {
            const client = clients.find(
              (item) => item.id === booking.client_profile_id
            );

            const payout = getBookingPayoutBreakdown(booking);
            const totalServicio = payout.publicPrice;
            const netoBeluer = payout.totalBeluer;

            return {
              id: booking.id,
              servicio: booking.services?.name || "Servicio belu",
              clienta: client?.full_name || client?.email || "Clienta belu",
              fecha: booking.scheduled_date,
              ...payout,
              totalServicio,
              netoBeluer,
              estadoPago: mapPaymentStatusToIngresoStatus(
                booking.payment_status
              ),
            };
          });
      }
    }
  }

  return (
    <>
      <BeluerPanelOriginalPage
        beluerProfile={beluerProfile}
        realReservas={realReservas}
        realIngresos={realIngresos}
        realServicios={realServicios}
        realPortafolio={realPortafolio}
      />

      <LogoutButton className="fixed right-6 bottom-6 z-50 rounded-full bg-[#E60023] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#C4001D] transition" />
    </>
  );
}
