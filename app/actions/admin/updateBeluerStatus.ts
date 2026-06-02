"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type UpdateBeluerStatusState = {
  success: boolean;
  message: string;
};

const allowedStatuses = ["pending", "approved", "paused", "rejected"];

export async function updateBeluerStatusAction(
  previousState: UpdateBeluerStatusState,
  formData: FormData
): Promise<UpdateBeluerStatusState> {
  await requireAdmin();

  const beluerProfileId = String(formData.get("beluerProfileId") || "");
  const status = String(formData.get("status") || "");

  if (!beluerProfileId) {
    return {
      success: false,
      message: "No se encontró la Beluer.",
    };
  }

  if (!allowedStatuses.includes(status)) {
    return {
      success: false,
      message: "Estado no válido.",
    };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("beluer_profiles")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", beluerProfileId);

  if (error) {
    return {
      success: false,
      message: `No se pudo actualizar el estado: ${error.message}`,
    };
  }

  revalidatePath("/app/admin");

  return {
    success: true,
    message: "Estado actualizado correctamente.",
  };
}
