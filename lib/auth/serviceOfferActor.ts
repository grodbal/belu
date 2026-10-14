import "server-only";

import type { User } from "@supabase/supabase-js";
import { getAdminAuthorizationFailure } from "@/lib/auth/adminAuthorization";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ServiceOfferActorError =
  | "UNAUTHORIZED"
  | "PROFILE_NOT_FOUND"
  | "BELUER_NOT_FOUND"
  | "BELUER_NOT_APPROVED";

type ActorBase = {
  userId: string;
  profileId: string;
  supabase: ReturnType<typeof createAdminClient>;
};

export type BeluerActorResult =
  | {
      ok: true;
      actor: ActorBase & {
        beluerProfileId: string;
        beluerStatus: string;
      };
    }
  | { ok: false; code: ServiceOfferActorError };

export type AdminActorResult =
  | { ok: true; actor: ActorBase & { user: User } }
  | { ok: false; code: "UNAUTHORIZED" | "PROFILE_NOT_FOUND" };

async function resolveProfile(expectedRole: "beluer" | "admin") {
  const authClient = await createClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return { ok: false as const, code: "UNAUTHORIZED" as const };
  }

  const supabase = createAdminClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileError) {
    return { ok: false as const, code: "PROFILE_NOT_FOUND" as const };
  }

  if (!profile || profile.role !== expectedRole) {
    return { ok: false as const, code: "UNAUTHORIZED" as const };
  }

  return {
    ok: true as const,
    actor: { userId: user.id, profileId: profile.id, supabase },
  };
}

export async function resolveBeluerActor(): Promise<BeluerActorResult> {
  const profileResult = await resolveProfile("beluer");
  if (!profileResult.ok) return profileResult;

  const { data: beluer, error } = await profileResult.actor.supabase
    .from("beluer_profiles")
    .select("id, status")
    .eq("profile_id", profileResult.actor.profileId)
    .maybeSingle();

  if (error || !beluer) {
    return { ok: false, code: "BELUER_NOT_FOUND" };
  }

  return {
    ok: true,
    actor: {
      ...profileResult.actor,
      beluerProfileId: beluer.id,
      beluerStatus: beluer.status,
    },
  };
}

export async function resolveApprovedBeluerActor(): Promise<BeluerActorResult> {
  const result = await resolveBeluerActor();
  if (!result.ok) return result;
  if (result.actor.beluerStatus !== "approved") {
    return { ok: false, code: "BELUER_NOT_APPROVED" };
  }
  return result;
}

export async function resolveAdminActor(): Promise<AdminActorResult> {
  const authClient = await createClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      code:
        getAdminAuthorizationFailure({
          authenticated: false,
          profileFound: false,
          profileError: false,
        }) ?? "UNAUTHORIZED",
    };
  }

  const supabase = createAdminClient();
  const {
    data: { user: freshUser },
    error: freshUserError,
  } = await supabase.auth.admin.getUserById(user.id);

  const appMetadataRole = freshUserError
    ? undefined
    : freshUser?.app_metadata?.role;
  if (appMetadataRole !== "admin") {
    return {
      ok: false,
      code:
        getAdminAuthorizationFailure({
          authenticated: true,
          appMetadataRole,
          profileFound: false,
          profileError: false,
        }) ?? "UNAUTHORIZED",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const authorizationFailure = getAdminAuthorizationFailure({
    authenticated: true,
    appMetadataRole,
    profileFound: Boolean(profile),
    profileRole: profile?.role,
    profileError: Boolean(profileError),
  });
  if (authorizationFailure) {
    return { ok: false, code: authorizationFailure };
  }

  if (!profile || !freshUser) {
    return { ok: false, code: "UNAUTHORIZED" };
  }

  return {
    ok: true,
    actor: {
      userId: user.id,
      profileId: profile.id,
      supabase,
      user: freshUser,
    },
  };
}
