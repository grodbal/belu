"use server";

import { createAdminClient } from "@/lib/supabase/admin";

type CreateClientProfileParams = {
  authUserId: string;
  fullName: string;
  email: string;
};

export async function createClientProfileAction({
  authUserId,
  fullName,
  email,
}: CreateClientProfileParams) {
  if (!authUserId) {
    return {
      success: false,
      message: "No se encontró el usuario creado.",
    };
  }

  if (!fullName || !email) {
    return {
      success: false,
      message: "Faltan datos para crear el perfil de clienta.",
    };
  }

  const supabase = createAdminClient();

  const { error: metadataError } =
    await supabase.auth.admin.updateUserById(authUserId, {
      app_metadata: {
        role: "cliente",
      },
    });

  if (metadataError) {
    return {
      success: false,
      message: `No se pudo asignar el rol de clienta: ${metadataError.message}`,
    };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    auth_user_id: authUserId,
    role: "cliente",
    full_name: fullName,
    email,
  });

  if (profileError) {
    return {
      success: false,
      message: `No se pudo crear el perfil de clienta: ${profileError.message}`,
    };
  }

  return {
    success: true,
    message: "Perfil de clienta creado correctamente.",
  };
}