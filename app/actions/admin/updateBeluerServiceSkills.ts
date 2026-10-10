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
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index);

  if (!beluerProfileId) {
    return {
      success: false,
      message: "No se encontró la Beluer.",
    };
  }

  const supabase = createAdminClient();

  // This legacy Admin assignment flow must not delete or recreate offers from
  // the new catalog. Those rows (and their Beluer-set prices) belong to the
  // Beluer offer actions and are identified by service_pricing_rules.
  const { data: pricedServices, error: rulesError } = await supabase
    .from("service_pricing_rules")
    .select("service_id");

  if (rulesError) {
    return {
      success: false,
      message: "No se pudo validar el catálogo de servicios.",
    };
  }

  const newCatalogServiceIds = new Set(
    (pricedServices ?? []).map((rule) => rule.service_id)
  );
  if (serviceIds.some((serviceId) => newCatalogServiceIds.has(serviceId))) {
    return {
      success: false,
      message: "Los servicios del nuevo catálogo se gestionan desde las ofertas de la Beluer.",
    };
  }

  const { data: currentSkills, error: skillsError } = await supabase
    .from("beluer_service_skills")
    .select("id, service_id")
    .eq("beluer_profile_id", beluerProfileId);

  if (skillsError) {
    return {
      success: false,
      message: "No se pudieron leer los servicios anteriores.",
    };
  }

  const legacySkillIds = (currentSkills ?? [])
    .filter((skill) => !newCatalogServiceIds.has(skill.service_id))
    .map((skill) => skill.id);

  const { error: deleteError } = legacySkillIds.length
    ? await supabase
        .from("beluer_service_skills")
        .delete()
        .in("id", legacySkillIds)
    : { error: null };

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
