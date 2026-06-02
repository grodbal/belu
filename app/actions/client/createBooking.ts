"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type CreateBookingState = {
  success: boolean;
  message: string;
};

const allowedDistricts = [
  "Miraflores",
  "San Isidro",
  "Surco",
  "La Molina",
  "Barranco",
  "San Borja",
  "San Miguel",
];

const serviceNameAliases: Record<string, string> = {
  "Mega Volumen 5D": "Mega Volumen 5D",
  "Mega Volume 5D": "Mega Volumen 5D",
  "Mega Volume": "Mega Volumen 5D",
  "Acrilico Sculpted": "Acrílico Sculpted",
  "Acrílico Sculpted": "Acrílico Sculpted",
  "Extensiones Classic": "Extensiones Classic",
  "Extensiones Volume": "Extensiones Volume",
  "Lifting de pestañas": "Lifting de Pestañas",
  "Lifting de Pestañas": "Lifting de Pestañas",
  "Semipermanente": "Semipermanente",
  "Nail Art Premium": "Nail Art Premium",
};

export async function createBookingAction(
  previousState: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const serviceId = String(formData.get("serviceId") || "");
  const rawServiceName = String(formData.get("serviceName") || "").trim();
  const serviceName = serviceNameAliases[rawServiceName] || rawServiceName;

  const selectedBeluerName = String(
    formData.get("selectedBeluerName") || ""
  ).trim();

  const bookingMode =
    String(formData.get("bookingMode") || "") === "libre" &&
    selectedBeluerName
      ? "libre"
      : "managed";

  const scheduledDate = String(formData.get("scheduledDate") || "");
  const scheduledTime = String(formData.get("scheduledTime") || "");
  const address = String(formData.get("address") || "").trim();
  const district = String(formData.get("district") || "");
  const notes = String(formData.get("notes") || "").trim();
  const isExpress = String(formData.get("isExpress") || "") === "true";

  if (!serviceId && !serviceName) {
    return { success: false, message: "Selecciona un servicio." };
  }

  if (!scheduledDate || !scheduledTime) {
    return { success: false, message: "Selecciona fecha y hora." };
  }

  if (!address) {
    return { success: false, message: "Ingresa la dirección del servicio." };
  }

  if (!allowedDistricts.includes(district)) {
    return { success: false, message: "Selecciona un distrito válido." };
  }

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
    return {
      success: false,
      message: "No se encontró tu perfil de clienta.",
    };
  }

  if (profile.role !== "cliente") {
    return {
      success: false,
      message: "Solo las clientas pueden crear reservas.",
    };
  }

let service = null;
let serviceError = null;

if (serviceId) {
  const response = await supabase
    .from("services")
    .select("id, name, public_price, logistic_fee, base_price, status")
    .eq("id", serviceId)
    .single();

  service = response.data;
  serviceError = response.error;
} else {
  const response = await supabase
    .from("services")
    .select("id, name, public_price, logistic_fee, base_price, status")
    .eq("name", serviceName)
    .maybeSingle();

  service = response.data;
  serviceError = response.error;
}

if (serviceError || !service) {
  return {
    success: false,
    message: `No se encontró el servicio seleccionado en Supabase. Servicio recibido: ${rawServiceName}. Revisa que exista en la tabla services.`,
  };
}

  if (service.status !== "active") {
    return {
      success: false,
      message: "Este servicio no está disponible actualmente.",
    };
  }

  let beluerProfileId: string | null = null;

  if (bookingMode === "libre") {
    const { data: beluer, error: beluerError } = await supabase
      .from("beluer_profiles")
      .select("id, public_name, status, is_available")
      .eq("public_name", selectedBeluerName)
      .single();

    if (beluerError || !beluer) {
      return {
        success: false,
        message: `No se encontró la Beluer seleccionada: ${selectedBeluerName}`,
      };
    }

    if (beluer.status !== "approved") {
      return {
        success: false,
        message: "La Beluer seleccionada aún no está aprobada.",
      };
    }

    if (!beluer.is_available) {
      return {
        success: false,
        message: "La Beluer seleccionada no está disponible actualmente.",
      };
    }

    beluerProfileId = beluer.id;
  }

  const expressFee = isExpress ? 20 : 0;

  const commissionRate = 13;
  const basePrice = Number(service.base_price);
  const beluCommissionAmount = basePrice * (commissionRate / 100);
  const beluerPaymentAmount = basePrice - beluCommissionAmount + expressFee;

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
    public_price: service.public_price,
    logistic_fee: service.logistic_fee,
    base_price: service.base_price,
    belu_commission_rate: commissionRate,
    belu_commission_amount: beluCommissionAmount,
    beluer_payment_amount: beluerPaymentAmount,
    payment_status: "pending",
  });

  if (bookingError) {
    return {
      success: false,
      message: `No se pudo crear la reserva: ${bookingError.message}`,
    };
  }

  revalidatePath("/app/cliente");
  revalidatePath("/app/admin");

  return {
    success: true,
    message:
      "Reserva creada correctamente. En breve confirmaremos la disponibilidad.",
  };
}
