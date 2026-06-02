"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type UpdateClientProfileState = {
  success: boolean;
  message: string;
};

const allowedBeautyPreferences = [
  "Lashes naturales",
  "Lashes con volumen",
  "Nails minimalistas",
  "Nails protagonistas",
  "Lashes y nails",
];

export async function updateClientProfileAction(
  formData: FormData
): Promise<UpdateClientProfileState> {
  const phone = String(formData.get("phone") || "").trim();
  const beautyPreference = String(
    formData.get("beautyPreference") || ""
  ).trim();

  if (!allowedBeautyPreferences.includes(beautyPreference)) {
    return {
      success: false,
      message: "Selecciona una preferencia de belleza valida.",
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
      message: "Debes iniciar sesion para actualizar tu perfil.",
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
      message: "No se encontro tu perfil de clienta.",
    };
  }

  if (profile.role !== "cliente") {
    return {
      success: false,
      message: "Solo las clientas pueden actualizar este perfil.",
    };
  }

  const { data: clientProfile, error: clientProfileLookupError } =
    await supabase
      .from("client_profiles")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();

  if (clientProfileLookupError) {
    return {
      success: false,
      message: `No se pudo verificar tu perfil de clienta: ${clientProfileLookupError.message}`,
    };
  }

  const { error: clientProfileError } = clientProfile
    ? await supabase
        .from("client_profiles")
        .update({
          beauty_preference: beautyPreference,
        })
        .eq("id", clientProfile.id)
    : await supabase.from("client_profiles").insert({
        profile_id: profile.id,
        beauty_preference: beautyPreference,
      });

  if (clientProfileError) {
    return {
      success: false,
      message: `No se pudo guardar tu preferencia: ${clientProfileError.message}`,
    };
  }

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({
      phone: phone || null,
    })
    .eq("id", profile.id);

  if (profileUpdateError) {
    return {
      success: false,
      message: `No se pudo actualizar tu WhatsApp: ${profileUpdateError.message}`,
    };
  }

  revalidatePath("/app/cliente");

  return {
    success: true,
    message: "Tu perfil fue actualizado correctamente.",
  };
}
