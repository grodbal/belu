"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type CancelBookingState = {
  success: boolean;
  message: string;
};

export async function cancelBookingAction(
  bookingId: string
): Promise<CancelBookingState> {
  if (!bookingId) {
    return {
      success: false,
      message: "No se encontró la reserva a cancelar.",
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
      message: "Debes iniciar sesión para cancelar una reserva.",
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
      message: "No se encontró tu perfil de clienta.",
    };
  }

  if (profile.role !== "cliente") {
    return {
      success: false,
      message: "Solo las clientas pueden cancelar sus reservas.",
    };
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, client_profile_id, status")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return {
      success: false,
      message: "No se encontró la reserva.",
    };
  }

  if (booking.client_profile_id !== profile.id) {
    return {
      success: false,
      message: "No puedes cancelar una reserva que no pertenece a tu cuenta.",
    };
  }

  if (booking.status === "cancelled") {
    return {
      success: true,
      message: "Esta reserva ya estaba cancelada.",
    };
  }

  if (booking.status === "completed") {
    return {
      success: false,
      message: "No puedes cancelar una reserva ya completada.",
    };
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (updateError) {
    return {
      success: false,
      message: `No se pudo cancelar la reserva: ${updateError.message}`,
    };
  }

  revalidatePath("/app/cliente");
  revalidatePath("/app/admin");
  revalidatePath("/app/beluer");

  return {
    success: true,
    message: "Tu reserva ha sido cancelada correctamente.",
  };
}