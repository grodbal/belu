import LogoutButton from "@/components/auth/LogoutButton";
import BeluerPanelOriginalPage from "@/components/beluer-panel-original/BeluerPanelOriginalPage";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { getBeluerServiceCatalog } from "@/app/actions/beluer/serviceOffers";
import {
  getBookingClientTotal,
  getBookingServiceName,
} from "@/lib/bookings/bookingDisplayFinance";
import type {
  BeluerPanelProfile,
  BeluerPanelReadState,
  BookingMode,
  BookingStatus,
  FotoPortafolio,
  ReservaBeluer,
  IngresoBeluer,
  PaymentStatus,
} from "@/components/beluer-panel-original/beluerPanelTypes";
import type { BeluerServiceCatalogItem, ServiceCategory } from "@/app/actions/beluer/serviceOffers";

type BookingRow = {
  id: string;
  client_profile_id: string;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  district: string;
  notes: string | null;
  status: BookingStatus;
  booking_mode: BookingMode;
  payment_status: PaymentStatus;
  public_price: number | string | null;
  base_price: number | string | null;
  service_price_snapshot: number | string | null;
  service_name_snapshot: string | null;
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

  return null;
}

function getBookingPayoutBreakdown(booking: BookingRow) {
  const totalBeluer = getBookingBeluerPayoutTotal(booking);
  const clientTotal = getBookingClientTotal(booking);
  const pagoLogisticaBeluer =
    booking.beluer_logistic_payout_amount != null
      ? moneyToNumber(booking.beluer_logistic_payout_amount)
      : null;
  const pagoExpressBeluer =
    booking.beluer_express_payout_amount != null
      ? moneyToNumber(booking.beluer_express_payout_amount)
      : null;
  const pagoServicioBeluer =
    booking.beluer_service_payout_amount != null
      ? moneyToNumber(booking.beluer_service_payout_amount)
      : null;

  return {
    servicePrice: clientTotal.servicePrice,
    clientTotal: clientTotal.total,
    basePrice: clientTotal.servicePrice,
    logisticFee: clientTotal.logisticFee,
    expressFee: clientTotal.expressFee,
    pagoServicioBeluer,
    pagoLogisticaBeluer,
    pagoExpressBeluer,
    totalBeluer,
    nivelAplicado: booking.beluer_level_snapshot,
    comisionAplicada: nullableRateToNumber(booking.commission_rate_snapshot),
    comisionBelu: booking.belu_commission_amount != null
      ? moneyToNumber(booking.belu_commission_amount)
      : null,
    commissionLockedAt: booking.commission_locked_at,
    commissionLockedEvent: booking.commission_locked_event,
  };
}

function getClientPaymentStatusLabel(paymentStatus: PaymentStatus) {
  const labels: Record<PaymentStatus, string> = {
    pending: "Pago de clienta pendiente",
    paid: "Pago de clienta registrado",
    failed: "Pago de clienta fallido",
    refunded: "Pago de clienta reembolsado",
  };

  return labels[paymentStatus];
}

function mapServiceCategory(
  category: string | null
): BeluerServiceCatalogItem["category"] | null {
  if (category === "lashes" || category === "nails" || category === "brows") {
    return category;
  }

  return null;
}

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

function getCurrentTimestamp() {
  return Date.now();
}

function getLimaWeekDateRange(now = new Date()) {
  const todayKey = getLimaDateTimeKey(now).slice(0, 10);
  const today = new Date(`${todayKey}T00:00:00Z`);
  const day = today.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(today);
  start.setUTCDate(today.getUTCDate() + diffToMonday);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function sumRealizedPayouts(
  bookings: BookingRow[],
  isInPeriod: (booking: BookingRow) => boolean
) {
  return bookings.reduce((total, booking) => {
    if (booking.status !== "completed" || !isInPeriod(booking)) return total;

    return total + (getBookingBeluerPayoutTotal(booking) ?? 0);
  }, 0);
}

export default async function BeluerPanelPage() {
  const authClient = await createClient();

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();

  if (userError || !user) {
    redirect("/login?redirectTo=/app/beluer");
  }

  let beluerProfile: BeluerPanelProfile | null = null;
  let realReservas: ReservaBeluer[] = [];
  let realIngresos: IngresoBeluer[] = [];
  let realServicios: BeluerServiceCatalogItem[] = [];
  let approvedCategories: ServiceCategory[] = [];
  let realPortafolio: FotoPortafolio[] = [];
  const readState: BeluerPanelReadState = {
    bookings: "ready",
    clients: "ready",
    services: "ready",
    portfolio: "ready",
  };

  if (user) {
    const supabase = createAdminClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, role")
      .eq("auth_user_id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "beluer") {
      redirect("/login?redirectTo=/app/beluer");
    }

    if (profile) {
      const { data: beluer, error: beluerError } = await supabase
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

      if (beluerError || !beluer) {
        redirect("/login?redirectTo=/app/beluer");
      }

      if (beluer) {
        const [catalogResult, approvalsResult] = await Promise.all([
          getBeluerServiceCatalog(),
          supabase
            .from("beluer_category_approvals")
            .select("category")
            .eq("beluer_profile_id", beluer.id)
            .eq("status", "approved"),
        ]);

        if (!catalogResult.ok || approvalsResult.error) {
          readState.services = "unavailable";
        } else {
          realServicios = catalogResult.data;
          approvedCategories = (approvalsResult.data ?? []).map((row) => row.category as ServiceCategory);
        }

        const { data: portfolioData, error: portfolioError } = await supabase
          .from("beluer_photos")
          .select("id, image_url, category, caption, is_cover, status")
          .eq("beluer_id", beluer.id)
          .eq("status", "approved")
          .order("is_cover", { ascending: false })
          .order("created_at", { ascending: false });

        if (portfolioError) readState.portfolio = "unavailable";

        realPortafolio = (portfolioError
          ? []
          : (portfolioData as BeluerPhotoRow[] | null) || [])
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

        const { data: bookingsData, error: bookingsError } = await supabase
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
            booking_mode,
            payment_status,
            public_price,
            base_price,
            service_price_snapshot,
            service_name_snapshot,
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
          .neq("status", "payment_pending")
          .order("scheduled_date", { ascending: true })
          .order("scheduled_time", { ascending: true });

        if (bookingsError) readState.bookings = "unavailable";

        const bookings = bookingsError
          ? []
          : (bookingsData as unknown as BookingRow[] | null) || [];

        const limaNowKey = getLimaDateTimeKey();
        const currentMonth = limaNowKey.slice(0, 7);
        const { startDate: weekStart, endDate: weekEnd } =
          getLimaWeekDateRange();

        const clientIds = Array.from(
          new Set(bookings.map((booking) => booking.client_profile_id))
        );

        let clients: ClientProfileRow[] = [];

        if (clientIds.length > 0) {
          const { data: clientsData, error: clientsError } = await supabase
            .from("profiles")
            .select("id, full_name, email, phone")
            .in("id", clientIds);

          if (clientsError) {
            readState.clients = "unavailable";
          } else {
            clients = (clientsData as ClientProfileRow[] | null) || [];
          }
        }

        realReservas = bookings.map((booking) => {
          const client = clients.find(
            (item) => item.id === booking.client_profile_id
          );
          const payout = getBookingPayoutBreakdown(booking);

          return {
            id: booking.id,
            servicio: getBookingServiceName(booking.service_name_snapshot, booking.services?.name),
            clienta:
              client?.full_name ||
              client?.email ||
              (readState.clients === "unavailable"
                ? "Clienta no disponible"
                : "Clienta belu"),
            distrito: booking.district,
            fecha: booking.scheduled_date,
            hora: booking.scheduled_time.slice(0, 5),
            total: payout.totalBeluer,
            direccion: booking.address,
            instrucciones: booking.notes || "Sin instrucciones adicionales.",
            metodoPago: getClientPaymentStatusLabel(booking.payment_status),
            estado: mapBookingStatusToBeluerStatus(booking.status),
            status: booking.status,
            bookingMode: booking.booking_mode,
            paymentStatus: booking.payment_status,
            ...payout,
          };
        });

        realIngresos = bookings
          .filter((booking) =>
            ["confirmed", "in_progress", "completed"].includes(booking.status)
          )
          .map((booking) => {
            const client = clients.find(
              (item) => item.id === booking.client_profile_id
            );

            const payout = getBookingPayoutBreakdown(booking);
            const totalServicio = payout.servicePrice;
            const netoBeluer = payout.totalBeluer;

            return {
              id: booking.id,
              servicio: getBookingServiceName(booking.service_name_snapshot, booking.services?.name),
              clienta:
                client?.full_name ||
                client?.email ||
                (readState.clients === "unavailable"
                  ? "Clienta no disponible"
                  : "Clienta belu"),
              fecha: booking.scheduled_date,
              ...payout,
              totalServicio,
              netoBeluer,
              bookingStatus: booking.status,
              estadoPago: booking.payment_status,
            };
          });

        const nextConfirmedBooking =
          realReservas.find(
            (booking) =>
              (booking.status === "confirmed" ||
                booking.status === "in_progress") &&
              `${booking.fecha}T${booking.hora}` > limaNowKey
          ) ?? null;
        const publicName = beluer.public_name || profile.full_name || "Beluer";
        const ratingValue = Number(beluer.rating_average);

        beluerProfile = {
          publicName,
          firstName: publicName.split(" ")[0] || "Beluer",
          levelLabel: getLevelLabel(beluer.level),
          statusLabel: getStatusLabel(beluer.status),
          photoUrl: beluer.profile_photo_url || "/beluer-placeholder.jpg",
          initials: getInitials(publicName),
          rating:
            Number.isFinite(ratingValue) && ratingValue > 0
              ? ratingValue
              : null,
          instagram: beluer.instagram || "",
          phone: beluer.phone || profile.phone || "",
          bio: beluer.bio || "",
          experienceYears: Number(beluer.experience_years ?? 0),
          districts: beluer.districts || [],
          districtsCount: (beluer.districts || []).length,
          isAvailable: Boolean(beluer.is_available),
          monthlyIncomeGoal: Number(beluer.monthly_income_goal ?? 0),
          weeklyRealizedIncome: sumRealizedPayouts(
            bookings,
            (booking) =>
              booking.scheduled_date >= weekStart &&
              booking.scheduled_date <= weekEnd
          ),
          weeklyUncalculatedCompletedCount: bookings.filter(
            (booking) =>
              booking.status === "completed" &&
              booking.scheduled_date >= weekStart &&
              booking.scheduled_date <= weekEnd &&
              getBookingBeluerPayoutTotal(booking) == null
          ).length,
          monthlyRealizedIncome: sumRealizedPayouts(
            bookings,
            (booking) => booking.scheduled_date.startsWith(currentMonth)
          ),
          monthlyUncalculatedCompletedCount: bookings.filter(
            (booking) =>
              booking.status === "completed" &&
              booking.scheduled_date.startsWith(currentMonth) &&
              getBookingBeluerPayoutTotal(booking) == null
          ).length,
          assignedRequestsCount: bookings.filter(
            (booking) => booking.status === "assigned"
          ).length,
          nextConfirmedBooking,
          completedBookingsCountThisMonth: bookings.filter(
            (booking) =>
              booking.status === "completed" &&
              booking.scheduled_date.startsWith(currentMonth)
          ).length,
        };
      }
    }
  }

  if (!beluerProfile) {
    redirect("/login?redirectTo=/app/beluer");
  }

  return (
    <>
      <BeluerPanelOriginalPage
        beluerProfile={beluerProfile}
        realReservas={realReservas}
        realIngresos={realIngresos}
        realServicios={realServicios}
        approvedCategories={approvedCategories}
        currentTime={getCurrentTimestamp()}
        realPortafolio={realPortafolio}
        readState={readState}
        logoutButton={<LogoutButton className="beluer-logout-button" />}
      />
    </>
  );
}
