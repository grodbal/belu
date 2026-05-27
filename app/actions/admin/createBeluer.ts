"use server";

import { createAdminClient } from "@/lib/supabase/admin";

type CreateBeluerState = {
  success: boolean;
  message: string;
};

export async function createBeluerAction(
  _previousState: CreateBeluerState,
  formData: FormData
): Promise<CreateBeluerState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  if (!fullName) {
    return {
      success: false,
      message: "Ingresa el nombre completo de la Beluer.",
    };
  }

  if (!email) {
    return {
      success: false,
      message: "Ingresa el correo de la Beluer.",
    };
  }

  if (!password || password.length < 6) {
    return {
      success: false,
      message: "La contraseña temporal debe tener al menos 6 caracteres.",
    };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
    app_metadata: {
      role: "beluer",
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Beluer creada correctamente. Ya puede iniciar sesión.",
  };
}