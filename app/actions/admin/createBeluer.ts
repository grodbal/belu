"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type CreateBeluerState = {
  success: boolean;
  message: string;
};

export async function createBeluerAction(
  _previousState: CreateBeluerState,
  formData: FormData
): Promise<CreateBeluerState> {
  await requireAdmin();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const instagram = String(formData.get("instagram") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const districtsRaw = String(formData.get("districts") ?? "").trim();
  const experienceYearsRaw = String(formData.get("experienceYears") ?? "0").trim();

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

  const experienceYears = Number(experienceYearsRaw);

  if (Number.isNaN(experienceYears) || experienceYears < 0) {
    return {
      success: false,
      message: "Ingresa años de experiencia válidos.",
    };
  }

  const districts = districtsRaw
    ? districtsRaw
        .split(",")
        .map((district) => district.trim())
        .filter(Boolean)
    : [];

  const supabase = createAdminClient();

  const { data: createdUserData, error: authError } =
    await supabase.auth.admin.createUser({
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

  if (authError) {
    return {
      success: false,
      message: authError.message,
    };
  }

  const authUser = createdUserData.user;

  if (!authUser) {
    return {
      success: false,
      message: "No se pudo crear el usuario Auth de la Beluer.",
    };
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .insert({
      auth_user_id: authUser.id,
      role: "beluer",
      full_name: fullName,
      email,
      phone: phone || null,
    })
    .select("id")
    .single();

  if (profileError) {
    await supabase.auth.admin.deleteUser(authUser.id);

    return {
      success: false,
      message: `No se pudo crear el perfil base: ${profileError.message}`,
    };
  }

  const { error: beluerProfileError } = await supabase
    .from("beluer_profiles")
    .insert({
      profile_id: profileData.id,
      public_name: fullName,
      bio: bio || null,
      instagram: instagram || null,
      phone: phone || null,
      districts,
      experience_years: experienceYears,
      level: "nueva",
      status: "approved",
      rating_average: 0,
      total_bookings: 0,
      is_available: true,
      review_notes: null,
    });

  if (beluerProfileError) {
    await supabase.from("profiles").delete().eq("id", profileData.id);
    await supabase.auth.admin.deleteUser(authUser.id);

    return {
      success: false,
      message: `No se pudo crear el perfil Beluer: ${beluerProfileError.message}`,
    };
  }

  return {
    success: true,
    message: "Beluer creada correctamente con usuario y perfil operativo.",
  };
}
