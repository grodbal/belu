import "server-only";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const authClient = await createClient();

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();

  if (userError || !user) {
    redirect("/login?redirectTo=/app/admin");
  }

  const supabase = createAdminClient();

  const {
    data: { user: freshUser },
    error: freshUserError,
  } = await supabase.auth.admin.getUserById(user.id);

  if (freshUserError || freshUser?.app_metadata?.role !== "admin") {
    redirect("/login?redirectTo=/app/admin");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/login?redirectTo=/app/admin");
  }

  return user;
}
