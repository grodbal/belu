"use server";

import { revalidatePath } from "next/cache";
import { normalizeBookingDistrict } from "@/lib/bookings/foundation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type CreateBookingState = {
  success: boolean;
  message: string;
  code?: "BELUER_DISTRICT_MISMATCH";
};

const PUBLIC_BOOKING_ERROR =
  "No pudimos registrar tu reserva. Inténtalo nuevamente.";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function normalizeTime(value: string) {
  const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
  return match ? `${match[1]}:${match[2]}` : null;
}

function getLimaNowParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

function isValidMoney(value: unknown, allowZero = true) {
  const amount = Number(value);
  return Number.isFinite(amount) && (allowZero ? amount >= 0 : amount > 0);
}

export async function createBookingAction(
  previousState: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  void previousState;

  const serviceId = String(formData.get("serviceId") || "").trim();
  const selectedBeluerId = String(
    formData.get("selectedBeluerId") || ""
  ).trim();
  const bookingMode =
    String(formData.get("bookingMode") || "") === "libre"
      ? "libre"
      : "managed";
  const scheduledDate = String(formData.get("scheduledDate") || "");
  const scheduledTime = normalizeTime(
    String(formData.get("scheduledTime") || "")
  );
  const address = String(formData.get("address") || "").trim();
  const districtValue = formData.get("district");
  const district =
    typeof districtValue === "string" ? districtValue.trim() : "";
  const notes = String(formData.get("notes") || "").trim();
  const expressRequested = String(formData.get("isExpress") || "") === "true";
  const idempotencyKey = String(
    formData.get("idempotencyKey") || ""
  ).trim();

  if (!isUuid(serviceId)) {
    return { success: false, message: "Selecciona un servicio válido." };
  }

  if (!isValidDate(scheduledDate) || !scheduledTime) {
    return { success: false, message: "Selecciona una fecha y hora válidas." };
  }

  const nowInLima = getLimaNowParts();
  if (
    scheduledDate < nowInLima.date ||
    (scheduledDate === nowInLima.date && scheduledTime <= nowInLima.time)
  ) {
    return {
      success: false,
      message: "La fecha y hora de la reserva deben ser futuras.",
    };
  }

  if (!address) {
    return { success: false, message: "Ingresa la dirección del servicio." };
  }

  if (!district || district.length > 120) {
    return {
      success: false,
      message: "Ingresa el distrito donde recibirás el servicio.",
    };
  }

  if (bookingMode === "libre" && !isUuid(selectedBeluerId)) {
    return { success: false, message: "Selecciona una Beluer válida." };
  }

  if (!isUuid(idempotencyKey)) {
    return {
      success: false,
      message: "No pudimos validar este intento de reserva. Inténtalo nuevamente.",
    };
  }

  try {
    const authClient = await createClient();
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Debes iniciar sesión para reservar.",
      };
    }

    const supabase = createAdminClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("auth_user_id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("createBooking: client profile lookup failed", profileError);
      return { success: false, message: PUBLIC_BOOKING_ERROR };
    }

    if (profile.role !== "cliente") {
      return {
        success: false,
        message: "Solo las clientas pueden crear reservas.",
      };
    }

    const { data: existingBooking, error: existingBookingError } =
      await supabase
        .from("bookings")
        .select("id")
        .eq("client_profile_id", profile.id)
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();

    if (existingBookingError) {
      console.error(
        "createBooking: idempotency lookup failed",
        existingBookingError
      );
      return { success: false, message: PUBLIC_BOOKING_ERROR };
    }

    if (existingBooking) {
      revalidatePath("/app/cliente");
      return {
        success: true,
        message: "Tu reserva ya estaba registrada. El pago continúa pendiente.",
      };
    }

    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("id, public_price, logistic_fee, base_price, status")
      .eq("id", serviceId)
      .single();

    if (serviceError) {
      console.error("createBooking: service lookup failed", serviceError);
    }

    if (
      serviceError ||
      !service ||
      service.status !== "active" ||
      !isValidMoney(service.public_price, false) ||
      !isValidMoney(service.logistic_fee) ||
      !isValidMoney(service.base_price)
    ) {
      return {
        success: false,
        message: "El servicio seleccionado no está disponible.",
      };
    }

    let beluerProfileId: string | null = null;

    if (bookingMode === "libre") {
      const { data: beluer, error: beluerError } = await supabase
        .from("beluer_profiles")
        .select("id, status, is_available, districts")
        .eq("id", selectedBeluerId)
        .single();

      if (beluerError) {
        console.error("createBooking: beluer lookup failed", beluerError);
      }

      if (
        beluerError ||
        !beluer ||
        beluer.status !== "approved" ||
        !beluer.is_available
      ) {
        return {
          success: false,
          message: "La Beluer seleccionada no está disponible.",
        };
      }

      const { data: skill, error: skillError } = await supabase
        .from("beluer_service_skills")
        .select("id")
        .eq("beluer_profile_id", beluer.id)
        .eq("service_id", service.id)
        .eq("status", "active")
        .maybeSingle();

      if (skillError) {
        console.error("createBooking: beluer skill lookup failed", skillError);
      }

      if (skillError || !skill) {
        return {
          success: false,
          message: "La Beluer seleccionada no realiza este servicio.",
        };
      }

      const coveredDistricts = Array.isArray(beluer.districts)
        ? beluer.districts.map(normalizeBookingDistrict)
        : [];

      if (
        coveredDistricts.length === 0 ||
        !coveredDistricts.includes(normalizeBookingDistrict(district))
      ) {
        return {
          success: false,
          code: "BELUER_DISTRICT_MISMATCH",
          message:
            "Esta especialista ya no está disponible para esa zona. Elige otra Beluer.",
        };
      }

      beluerProfileId = beluer.id;
    }

    const scheduledAt = new Date(
      `${scheduledDate}T${scheduledTime}:00-05:00`
    ).getTime();
    const isAutomaticallyExpress =
      scheduledAt <= Date.now() + 2 * 60 * 60 * 1000;
    const isExpress = expressRequested || isAutomaticallyExpress;
    const expressFee = isExpress ? 20 : 0;
    const { error: bookingError } = await supabase.from("bookings").insert({
      client_profile_id: profile.id,
      beluer_profile_id: beluerProfileId,
      service_id: service.id,
      booking_mode: bookingMode,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      address,
      district,
      notes,
      is_express: isExpress,
      express_fee: expressFee,
      status: bookingMode === "libre" ? "assigned" : "pending",
      public_price: Number(service.public_price),
      logistic_fee: Number(service.logistic_fee),
      base_price: Number(service.base_price),
      payment_status: "pending",
      idempotency_key: idempotencyKey,
    });

    if (bookingError) {
      if (bookingError.code === "23505") {
        const { data: duplicateBooking } = await supabase
          .from("bookings")
          .select("id")
          .eq("client_profile_id", profile.id)
          .eq("idempotency_key", idempotencyKey)
          .maybeSingle();

        if (duplicateBooking) {
          revalidatePath("/app/cliente");
          return {
            success: true,
            message:
              "Tu reserva ya estaba registrada. El pago continúa pendiente.",
          };
        }
      }

      console.error("createBooking: insert failed", bookingError);
      return { success: false, message: PUBLIC_BOOKING_ERROR };
    }

    revalidatePath("/app/cliente");
    revalidatePath("/app/admin");

    return {
      success: true,
      message: "Reserva registrada. El pago con Yape continúa pendiente.",
    };
  } catch (error) {
    console.error("createBooking: unexpected failure", error);
    return { success: false, message: PUBLIC_BOOKING_ERROR };
  }
}
