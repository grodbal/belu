"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type UpdateServiceState = {
  success: boolean;
  message: string;
};

const allowedCategories = ["lashes", "nails"];

function getBooleanFromFormData(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return false;

  return ["on", "true", "1", "yes"].includes(value.toLowerCase());
}

export async function updateServiceAction(
  previousState: UpdateServiceState,
  formData: FormData
): Promise<UpdateServiceState> {
  await requireAdmin();

  const serviceId = String(formData.get("serviceId") || "");

  const category = String(formData.get("category") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const publicPriceRaw = String(formData.get("publicPrice") || "");
  const logisticFeeRaw = String(formData.get("logisticFee") || "10");
  const durationMinutesRaw = String(formData.get("durationMinutes") || "90");
  const isFeatured = getBooleanFromFormData(formData.get("isFeatured"));

  if (!serviceId) {
    return {
      success: false,
      message: "No se encontró el servicio.",
    };
  }

  if (!allowedCategories.includes(category)) {
    return {
      success: false,
      message: "Categoría no válida.",
    };
  }

  if (!name) {
    return {
      success: false,
      message: "El nombre del servicio es obligatorio.",
    };
  }

  const publicPrice = Number(publicPriceRaw);
  const logisticFee = Number(logisticFeeRaw);
  const durationMinutes = Number(durationMinutesRaw);

  if (Number.isNaN(publicPrice) || publicPrice <= 0) {
    return {
      success: false,
      message: "El precio público debe ser mayor a 0.",
    };
  }

  if (Number.isNaN(logisticFee) || logisticFee < 0) {
    return {
      success: false,
      message: "El cargo logístico no es válido.",
    };
  }

  if (publicPrice < logisticFee) {
    return {
      success: false,
      message: "El precio público no puede ser menor al cargo logístico.",
    };
  }

  if (Number.isNaN(durationMinutes) || durationMinutes <= 0) {
    return {
      success: false,
      message: "La duración debe ser mayor a 0 minutos.",
    };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("services")
    .update({
      category,
      name,
      description,
      public_price: publicPrice,
      logistic_fee: logisticFee,
      duration_minutes: durationMinutes,
      is_featured: isFeatured,
      updated_at: new Date().toISOString(),
    })
    .eq("id", serviceId);

  if (error) {
    return {
      success: false,
      message: `No se pudo actualizar el servicio: ${error.message}`,
    };
  }

  revalidatePath("/app/admin");

  return {
    success: true,
    message: "Servicio actualizado correctamente.",
  };
}
