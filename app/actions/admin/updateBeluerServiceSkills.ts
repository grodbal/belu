"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type UpdateBeluerServiceSkillsState = {
  success: boolean;
  message: string;
};

export async function updateBeluerServiceSkillsAction(
  previousState: UpdateBeluerServiceSkillsState,
  formData: FormData
): Promise<UpdateBeluerServiceSkillsState> {
  await requireAdmin();

  const beluerProfileId = String(formData.get("beluerProfileId") || "");
  const serviceIds = formData
    .getAll("serviceIds")
    .map((value) => String(value))
    .filter(Boolean);

  if (!beluerProfileId) {
    return {
      success: false,
      message: "No se encontró la Beluer.",
    };
  }

  const supabase = createAdminClient();

  const { error: deleteError } = await supabase
    .from("beluer_service_skills")
    .delete()
    .eq("beluer_profile_id", beluerProfileId);

  if (deleteError) {
    return {
      success: false,
      message: `No se pudieron limpiar los servicios anteriores: ${deleteError.message}`,
    };
  }

  if (serviceIds.length > 0) {
    const rows = serviceIds.map((serviceId) => ({
      beluer_profile_id: beluerProfileId,
      service_id: serviceId,
      status: "active",
    }));

    const { error: insertError } = await supabase
      .from("beluer_service_skills")
      .insert(rows);

    if (insertError) {
      return {
        success: false,
        message: `No se pudieron asignar los servicios: ${insertError.message}`,
      };
    }
  }

  revalidatePath("/app/admin");

  return {
    success: true,
    message: "Servicios de la Beluer actualizados correctamente.",
  };
}
