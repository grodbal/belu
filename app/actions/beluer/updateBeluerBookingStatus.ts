"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type UpdateBeluerBookingStatusResult = {
  success: boolean;
  message: string;
};

type BeluerBookingAction = "accept" | "reject";

export async function updateBeluerBookingStatusAction({
  bookingId,
  action,
}: {
  bookingId: string;
  action: BeluerBookingAction;
}): Promise<UpdateBeluerBookingStatusResult> {
  if (!bookingId) {
    return {
      success: false,
      message: "No se encontró la reserva.",
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
      message: "Debes iniciar sesión como Beluer.",
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
      message: "Solo las Beluers pueden gestionar reservas asignadas.",
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

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, beluer_profile_id, status")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return {
      success: false,
      message: "No se encontró la reserva.",
    };
  }

  if (booking.beluer_profile_id !== beluer.id) {
    return {
      success: false,
      message: "No puedes gestionar una reserva que no está asignada a ti.",
    };
  }

  if (booking.status === "cancelled") {
    return {
      success: false,
      message: "Esta reserva ya fue cancelada.",
    };
  }

  if (booking.status === "completed") {
    return {
      success: false,
      message: "Esta reserva ya fue completada.",
    };
  }

  const nextStatus = action === "accept" ? "confirmed" : "cancelled";

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (updateError) {
    return {
      success: false,
      message: `No se pudo actualizar la reserva: ${updateError.message}`,
    };
  }

  revalidatePath("/app/beluer");
  revalidatePath("/app/cliente");
  revalidatePath("/app/admin");

  return {
    success: true,
    message:
      action === "accept"
        ? "Reserva aceptada correctamente."
        : "Reserva rechazada correctamente.",
  };
}