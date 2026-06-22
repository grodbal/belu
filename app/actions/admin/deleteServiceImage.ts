"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

type DeleteServiceImageState = {
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

export async function deleteServiceImageAction(
  _previousState: DeleteServiceImageState,
  formData: FormData
): Promise<DeleteServiceImageState> {
  await requireAdmin();

  const imageId = String(formData.get("imageId") || "").trim();

  if (!imageId) {
    return { success: false, message: "No se encontro la foto." };
  }

  const supabase = createAdminClient();

  const { data: image, error: imageError } = await supabase
    .from("service_images")
    .select("id, image_url")
    .eq("id", imageId)
    .maybeSingle();

  if (imageError) {
    return {
      success: false,
      message: `No se pudo validar la foto: ${imageError.message}`,
    };
  }

  if (!image) {
    return { success: false, message: "La foto no existe." };
  }

  const { error: deleteError } = await supabase
    .from("service_images")
    .delete()
    .eq("id", imageId);

  if (deleteError) {
    return {
      success: false,
      message: `No se pudo eliminar la foto: ${deleteError.message}`,
    };
  }

  const storagePath = getServiceImageStoragePath(image.image_url);
  let storageWarning = "";

  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from("service-images")
      .remove([storagePath]);

    if (storageError) {
      storageWarning = ` No se pudo borrar el archivo de Storage: ${storageError.message}`;
    }
  } else {
    storageWarning = " No se pudo derivar el path del archivo en Storage.";
  }

  revalidatePath("/app/admin");

  return {
    success: true,
    message: `Foto eliminada de la galeria.${storageWarning}`,
  };
}
