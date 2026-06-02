"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type UpdateBeluerLevelState = {
  success: boolean;
  message: string;
};

const allowedLevels = ["standard", "premium", "top"];

export async function updateBeluerLevelAction(
  previousState: UpdateBeluerLevelState,
  formData: FormData
): Promise<UpdateBeluerLevelState> {
  await requireAdmin();

  const beluerProfileId = String(formData.get("beluerProfileId") || "");
  const level = String(formData.get("level") || "");

  if (!beluerProfileId) {
    return {
      success: false,
      message: "No se encontró la Beluer.",
    };
  }

  if (!allowedLevels.includes(level)) {
    return {
      success: false,
      message: "Nivel no válido.",
    };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("beluer_profiles")
    .update({
      level,
      updated_at: new Date().toISOString(),
    })
    .eq("id", beluerProfileId);

  if (error) {
    return {
      success: false,
      message: `No se pudo actualizar el nivel: ${error.message}`,
    };
  }

  revalidatePath("/app/admin");

  return {
    success: true,
    message: "Nivel actualizado correctamente.",
  };
}
