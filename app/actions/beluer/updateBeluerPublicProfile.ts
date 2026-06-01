"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type UpdateBeluerPublicProfileState = {
  success: boolean;
  message: string;
};

export async function updateBeluerPublicProfileAction(
  formData: FormData
): Promise<UpdateBeluerPublicProfileState> {
  const instagram = String(formData.get("instagram") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const bio = String(formData.get("bio") || "").trim();

  if (bio.length > 600) {
    return {
      success: false,
      message: "La bio pública no debe superar los 600 caracteres.",
    };
  }

  const authClient = await createClient();

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: "Debes iniciar sesión para actualizar tu perfil.",
    };
  }

  const supabase = createAdminClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      message: "No se encontró tu perfil.",
    };
  }

  if (profile.role !== "beluer") {
    return {
      success: false,
      message: "Solo las Beluers pueden actualizar este perfil.",
    };
  }

  const { data: beluer, error: beluerError } = await supabase
    .from("beluer_profiles")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (beluerError || !beluer) {
    return {
      success: false,
      message: "No se encontró tu perfil de Beluer.",
    };
  }

  const { error: updateError } = await supabase
    .from("beluer_profiles")
    .update({
      instagram,
      phone,
      bio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", beluer.id);

  if (updateError) {
    return {
      success: false,
      message: `No se pudo actualizar tu perfil: ${updateError.message}`,
    };
  }

  revalidatePath("/app/beluer");
  revalidatePath("/app/cliente");

  return {
    success: true,
    message: "Tu perfil público fue actualizado correctamente.",
  };
}