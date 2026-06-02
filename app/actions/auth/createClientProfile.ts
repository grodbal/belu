"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type CreateClientProfileParams = {
  fullName: string;
};

export async function createClientProfileAction({
  fullName,
}: CreateClientProfileParams) {
  const normalizedFullName = fullName.trim();

  if (!normalizedFullName) {
    return {
      success: false,
      message: "Faltan datos para crear el perfil de clienta.",
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
      message: "Debes iniciar sesión para crear tu perfil de clienta.",
    };
  }

  const email = user.email?.trim().toLowerCase();

  if (!email) {
    return {
      success: false,
      message: "No se pudo obtener el correo de tu cuenta.",
    };
  }

  const supabase = createAdminClient();

  const { data: existingProfile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileLookupError) {
    return {
      success: false,
      message: `No se pudo verificar tu perfil: ${profileLookupError.message}`,
    };
  }

  const existingMetadataRole = user.app_metadata?.role;

  if (
    (existingMetadataRole && existingMetadataRole !== "cliente") ||
    (existingProfile && existingProfile.role !== "cliente")
  ) {
    return {
      success: false,
      message: "Esta acción solo está disponible para cuentas de clienta.",
    };
  }

  const { error: metadataError } =
    await supabase.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...user.app_metadata,
        role: "cliente",
      },
    });

  if (metadataError) {
    return {
      success: false,
      message: `No se pudo asignar el rol de clienta: ${metadataError.message}`,
    };
  }

  let profileId = existingProfile?.id;

  if (!profileId) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        auth_user_id: user.id,
        role: "cliente",
        full_name: normalizedFullName,
        email,
      })
      .select("id")
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        message: `No se pudo guardar el perfil de clienta: ${
          profileError?.message || "No se obtuvo el perfil creado."
        }`,
      };
    }

    profileId = profile.id;
  }

  const { error: clientProfileError } = await supabase
    .from("client_profiles")
    .upsert(
      {
        profile_id: profileId,
      },
      {
        onConflict: "profile_id",
        ignoreDuplicates: true,
      }
    );

  if (clientProfileError) {
    return {
      success: false,
      message: `No se pudo guardar el perfil complementario de clienta: ${clientProfileError.message}`,
    };
  }

  return {
    success: true,
    message: "Perfil de clienta guardado correctamente.",
  };
}
