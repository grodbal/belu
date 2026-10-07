"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { parseBeluerCoverageDistricts } from "@/lib/bookings/foundation";

type UpdateBeluerProfileState = {
  success: boolean;
  message: string;
};

export async function updateBeluerProfileAction(
  previousState: UpdateBeluerProfileState,
  formData: FormData
): Promise<UpdateBeluerProfileState> {
  await requireAdmin();

  const profileId = String(formData.get("profileId") || "");
  const beluerProfileId = String(formData.get("beluerProfileId") || "");

  const fullName = String(formData.get("fullName") || "").trim();
  const publicName = String(formData.get("publicName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const instagram = String(formData.get("instagram") || "").trim();
  const { districts, invalidDistricts } = parseBeluerCoverageDistricts(
    formData.getAll("districts")
  );
  const experienceYearsRaw = String(formData.get("experienceYears") || "0");
  const bio = String(formData.get("bio") || "").trim();

  if (!profileId || !beluerProfileId) {
    return {
      success: false,
      message: "No se encontró el perfil de la Beluer.",
    };
  }

  if (!fullName) {
    return {
      success: false,
      message: "El nombre completo es obligatorio.",
    };
  }

  const experienceYears = Number(experienceYearsRaw);

  if (Number.isNaN(experienceYears) || experienceYears < 0) {
    return {
      success: false,
      message: "Los años de experiencia no son válidos.",
    };
  }

  if (invalidDistricts.length > 0 || districts.length === 0) {
    return {
      success: false,
      message: "Selecciona al menos un distrito de atención válido.",
    };
  }

  const supabase = createAdminClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (profileError) {
    return {
      success: false,
      message: `No se pudo actualizar el perfil base: ${profileError.message}`,
    };
  }

  const { error: beluerError } = await supabase
    .from("beluer_profiles")
    .update({
      public_name: publicName || fullName,
      phone,
      instagram,
      districts,
      experience_years: experienceYears,
      bio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", beluerProfileId);

  if (beluerError) {
    return {
      success: false,
      message: `No se pudo actualizar la información de Beluer: ${beluerError.message}`,
    };
  }

  revalidatePath("/app/admin");
  revalidatePath("/app/beluer");
  revalidatePath("/app/cliente");

  return {
    success: true,
    message: "Perfil actualizado correctamente.",
  };
}
