"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type UpdateServiceStatusState = {
  success: boolean;
  message: string;
};

const allowedStatuses = ["active", "inactive"];

export async function updateServiceStatusAction(
  previousState: UpdateServiceStatusState,
  formData: FormData
): Promise<UpdateServiceStatusState> {
  await requireAdmin();

  const serviceId = String(formData.get("serviceId") || "");
  const status = String(formData.get("status") || "");

  if (!serviceId) {
    return {
      success: false,
      message: "No se encontró el servicio.",
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
    .from("services")
    .update({
      status,
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
    message: "Estado del servicio actualizado correctamente.",
  };
}
