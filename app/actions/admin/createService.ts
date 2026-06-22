"use server";

import { Buffer } from "buffer";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type CreateServiceState = {
  success: boolean;
  message: string;
};

const allowedCategories = ["lashes", "nails"];
const allowedStatuses = ["active", "inactive"];
const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxImageSize = 5 * 1024 * 1024;

function parseMoney(value: FormDataEntryValue | null) {
  return Number(String(value ?? "").trim());
}

export async function createServiceAction(
  _previousState: CreateServiceState,
  formData: FormData
): Promise<CreateServiceState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const publicPrice = parseMoney(formData.get("publicPrice"));
  const logisticFee = parseMoney(formData.get("logisticFee"));
  const durationMinutes = Number(
    String(formData.get("durationMinutes") ?? "").trim()
  );
  const status = String(formData.get("status") ?? "");
  const isFeatured = String(formData.get("isFeatured") ?? "") === "true";
  const rawImage = formData.get("image");
  const imageFile =
    rawImage instanceof File && rawImage.size > 0 ? rawImage : null;

  if (!name) {
    return { success: false, message: "Ingresa el nombre del servicio." };
  }

  if (!allowedCategories.includes(category)) {
    return { success: false, message: "Categoria no valida." };
  }

  if (Number.isNaN(publicPrice) || publicPrice < 0) {
    return { success: false, message: "El precio publico no es valido." };
  }

  if (Number.isNaN(logisticFee) || logisticFee < 0) {
    return { success: false, message: "El cargo logistico no es valido." };
  }

  if (publicPrice < logisticFee) {
    return {
      success: false,
      message: "El precio publico no puede ser menor al cargo logistico.",
    };
  }

  if (
    Number.isNaN(durationMinutes) ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0
  ) {
    return {
      success: false,
      message: "La duracion debe ser un entero positivo.",
    };
  }

  if (!allowedStatuses.includes(status)) {
    return { success: false, message: "Estado no valido." };
  }

  if (imageFile) {
    if (!allowedImageTypes.has(imageFile.type)) {
      return {
        success: false,
        message: "La foto debe ser JPG, PNG o WebP.",
      };
    }

    if (imageFile.size > maxImageSize) {
      return {
        success: false,
        message: "La foto no puede superar 5 MB.",
      };
    }
  }

  const supabase = createAdminClient();
  let imageUrl: string | null = null;
  let uploadedImagePath: string | null = null;

  if (imageFile) {
    const extension = allowedImageTypes.get(imageFile.type)!;
    const storagePath = `services/${Date.now()}-${randomUUID()}.${extension}`;
    const imageBytes = Buffer.from(await imageFile.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("service-images")
      .upload(storagePath, imageBytes, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        message: `No se pudo subir la foto: ${uploadError.message}`,
      };
    }

    uploadedImagePath = storagePath;

    const { data: publicUrlData } = supabase.storage
      .from("service-images")
      .getPublicUrl(storagePath);

    imageUrl = publicUrlData.publicUrl;
  }

  const { error } = await supabase.from("services").insert({
    category,
    name,
    description: description || null,
    public_price: publicPrice,
    logistic_fee: logisticFee,
    duration_minutes: durationMinutes,
    status,
    image_url: imageUrl,
    is_featured: isFeatured,
  });

  if (error) {
    if (uploadedImagePath) {
      await supabase.storage.from("service-images").remove([uploadedImagePath]);
    }

    return {
      success: false,
      message: `No se pudo crear el servicio: ${error.message}`,
    };
  }

  revalidatePath("/app/admin");

  return {
    success: true,
    message: "Servicio creado correctamente.",
  };
}
