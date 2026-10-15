"use server";

import { Buffer } from "buffer";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getServiceImageExtension,
  isServiceImageSizeAllowed,
} from "@/lib/images/serviceImageUpload";

type UpdateServiceMainImageState = {
  success: boolean;
  message: string;
};

function getServiceImageStoragePath(imageUrl: string) {
  const marker = "/service-images/";
  const markerIndex = imageUrl.indexOf(marker);

  if (markerIndex === -1) return null;

  const pathWithQuery = imageUrl.slice(markerIndex + marker.length);
  const [path] = pathWithQuery.split("?");

  return decodeURIComponent(path);
}

export async function updateServiceMainImageAction(
  _previousState: UpdateServiceMainImageState,
  formData: FormData
): Promise<UpdateServiceMainImageState> {
  await requireAdmin();

  const serviceId = String(formData.get("serviceId") || "").trim();
  const rawImage = formData.get("image");
  const imageFile =
    rawImage instanceof File && rawImage.size > 0 ? rawImage : null;

  if (!serviceId) {
    return { success: false, message: "No se encontro el servicio." };
  }

  if (!imageFile) {
    return { success: false, message: "Selecciona una foto principal." };
  }

  const imageExtension = getServiceImageExtension(imageFile.type);
  if (!imageExtension) {
    return { success: false, message: "La foto debe ser JPG, PNG o WebP." };
  }

  if (!isServiceImageSizeAllowed(imageFile.size)) {
    return { success: false, message: "La foto no puede superar 3 MiB." };
  }

  const supabase = createAdminClient();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, image_url")
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

  const extension = imageExtension;
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

  const { data: publicUrlData } = supabase.storage
    .from("service-images")
    .getPublicUrl(storagePath);

  const { error: updateError } = await supabase
    .from("services")
    .update({
      image_url: publicUrlData.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", serviceId);

  if (updateError) {
    await supabase.storage.from("service-images").remove([storagePath]);

    return {
      success: false,
      message: `No se pudo actualizar la foto principal: ${updateError.message}`,
    };
  }

  if (service.image_url) {
    const previousStoragePath = getServiceImageStoragePath(service.image_url);

    if (previousStoragePath) {
      await supabase.storage.from("service-images").remove([previousStoragePath]);
    }
  }

  revalidatePath("/app/admin");

  return {
    success: true,
    message: "Foto principal actualizada correctamente.",
  };
}
