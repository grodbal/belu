"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type UpdateBeluerAvailabilityState = {
  success: boolean;
  message: string;
};

export async function updateBeluerAvailabilityAction(
  previousState: UpdateBeluerAvailabilityState,
  formData: FormData
): Promise<UpdateBeluerAvailabilityState> {
  await requireAdmin();

  const beluerProfileId = String(formData.get("beluerProfileId") || "");
  const isAvailableValue = String(formData.get("isAvailable") || "");

  if (!beluerProfileId) {
    return {
      success: false,
      message: "No se encontró la Beluer.",
    };
  }

  if (isAvailableValue !== "true" && isAvailableValue !== "false") {
    return {
      success: false,
      message: "Disponibilidad no válida.",
    };
  }

  const isAvailable = isAvailableValue === "true";

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("beluer_profiles")
    .update({
      is_available: isAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq("id", beluerProfileId);

  if (error) {
    return {
      success: false,
      message: `No se pudo actualizar la disponibilidad: ${error.message}`,
    };
  }

  revalidatePath("/app/admin");

  return {
    success: true,
    message: "Disponibilidad actualizada correctamente.",
  };
}
