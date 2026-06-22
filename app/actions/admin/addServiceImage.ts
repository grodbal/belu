"use server";

import { Buffer } from "buffer";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

type AddServiceImageState = {
  success: boolean;
  message: string;
};

const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxImageSize = 5 * 1024 * 1024;
const maxGalleryImages = 5;

export async function addServiceImageAction(
  _previousState: AddServiceImageState,
  formData: FormData
): Promise<AddServiceImageState> {
  await requireAdmin();

  const serviceId = String(formData.get("serviceId") || "").trim();
  const rawImage = formData.get("image");
  const imageFile =
    rawImage instanceof File && rawImage.size > 0 ? rawImage : null;

  if (!serviceId) {
    return { success: false, message: "No se encontro el servicio." };
  }

  if (!imageFile) {
    return { success: false, message: "Selecciona una foto para subir." };
  }

  if (!allowedImageTypes.has(imageFile.type)) {
    return { success: false, message: "La foto debe ser JPG, PNG o WebP." };
  }

  if (imageFile.size > maxImageSize) {
    return { success: false, message: "La foto no puede superar 5 MB." };
  }

  const supabase = createAdminClient();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id")
    .eq("id", serviceId)
    .maybeSingle();

  if (serviceError) {
    return {
      success: false,
      message: `No se pudo validar el servicio: ${serviceError.message}`,
    };
  }

  if (!service) {
    return { success: false, message: "El servicio no existe." };
  }

  const { count, error: countError } = await supabase
    .from("service_images")
    .select("id", { count: "exact", head: true })
    .eq("service_id", serviceId);

  if (countError) {
    return {
      success: false,
      message: `No se pudo validar la galeria: ${countError.message}`,
    };
  }

  if ((count || 0) >= maxGalleryImages) {
    return {
      success: false,
      message: "La galeria permite hasta 5 fotos adicionales.",
    };
  }

  const { data: lastImage, error: lastImageError } = await supabase
    .from("service_images")
    .select("sort_order")
    .eq("service_id", serviceId)
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastImageError) {
    return {
      success: false,
      message: `No se pudo calcular el orden: ${lastImageError.message}`,
    };
  }

  const sortOrder =
    typeof lastImage?.sort_order === "number" ? lastImage.sort_order + 1 : 0;
  const extension = allowedImageTypes.get(imageFile.type)!;
  const storagePath = `services/${serviceId}/gallery/${Date.now()}-${randomUUID()}.${extension}`;
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

  const { data: publicUrlData } = supabase.storage
    .from("service-images")
    .getPublicUrl(storagePath);

  const { error: insertError } = await supabase.from("service_images").insert({
    service_id: serviceId,
    image_url: publicUrlData.publicUrl,
    sort_order: sortOrder,
  });

  if (insertError) {
    await supabase.storage.from("service-images").remove([storagePath]);

    return {
      success: false,
      message: `No se pudo guardar la foto: ${insertError.message}`,
    };
  }

  revalidatePath("/app/admin");

  return {
    success: true,
    message: "Foto agregada a la galeria.",
  };
}
