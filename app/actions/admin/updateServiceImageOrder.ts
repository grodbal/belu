"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

type UpdateServiceImageOrderState = {
  success: boolean;
  message: string;
};

type ServiceImageOrderRow = {
  id: string;
  sort_order: number;
};

export async function updateServiceImageOrderAction(
  _previousState: UpdateServiceImageOrderState,
  formData: FormData
): Promise<UpdateServiceImageOrderState> {
  await requireAdmin();

  const imageId = String(formData.get("imageId") || "").trim();
  const direction = String(formData.get("direction") || "");

  if (!imageId) {
    return { success: false, message: "No se encontro la foto." };
  }

  if (!["up", "down"].includes(direction)) {
    return { success: false, message: "Direccion no valida." };
  }

  const supabase = createAdminClient();

  const { data: image, error: imageError } = await supabase
    .from("service_images")
    .select("id, service_id")
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

  const { data: images, error: imagesError } = await supabase
    .from("service_images")
    .select("id, sort_order")
    .eq("service_id", image.service_id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (imagesError) {
    return {
      success: false,
      message: `No se pudo cargar la galeria: ${imagesError.message}`,
    };
  }

  const orderedImages = ((images as ServiceImageOrderRow[] | null) || []).slice();
  const currentIndex = orderedImages.findIndex((item) => item.id === imageId);

  if (currentIndex === -1) {
    return { success: false, message: "La foto no pertenece a la galeria." };
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= orderedImages.length) {
    return { success: true, message: "La foto ya esta en esa posicion." };
  }

  const [movedImage] = orderedImages.splice(currentIndex, 1);
  orderedImages.splice(targetIndex, 0, movedImage);

  for (const [index, item] of orderedImages.entries()) {
    if (item.sort_order === index) continue;

    const { error: updateError } = await supabase
      .from("service_images")
      .update({ sort_order: index })
      .eq("id", item.id);

    if (updateError) {
      return {
        success: false,
        message: `No se pudo actualizar el orden: ${updateError.message}`,
      };
    }
  }

  revalidatePath("/app/admin");

  return {
    success: true,
    message: "Orden actualizado.",
  };
}
