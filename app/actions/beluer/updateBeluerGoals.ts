"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type UpdateBeluerGoalsState = {
  success: boolean;
  message: string;
};

export async function updateBeluerGoalsAction(
  formData: FormData
): Promise<UpdateBeluerGoalsState> {
  const weeklyIncomeGoal = Number(formData.get("weeklyIncomeGoal") || 0);
  const monthlyIncomeGoal = Number(formData.get("monthlyIncomeGoal") || 0);

  if (!weeklyIncomeGoal || weeklyIncomeGoal <= 0) {
    return {
      success: false,
      message: "Ingresa una meta semanal válida.",
    };
  }

  if (!monthlyIncomeGoal || monthlyIncomeGoal <= 0) {
    return {
      success: false,
      message: "Ingresa una meta mensual válida.",
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
      message: "Debes iniciar sesión para actualizar tus metas.",
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
      message: "Solo las Beluers pueden actualizar sus metas.",
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
      weekly_income_goal: weeklyIncomeGoal,
      monthly_income_goal: monthlyIncomeGoal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", beluer.id);

  if (updateError) {
    return {
      success: false,
      message: `No se pudieron actualizar tus metas: ${updateError.message}`,
    };
  }

  revalidatePath("/app/beluer");

  return {
    success: true,
    message: "Tus metas fueron actualizadas correctamente.",
  };
}