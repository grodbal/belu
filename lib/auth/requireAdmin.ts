import "server-only";

import { redirect } from "next/navigation";
import { resolveAdminActor } from "@/lib/auth/serviceOfferActor";

export async function requireAdmin() {
  const actorResult = await resolveAdminActor();

  if (!actorResult.ok) {
    redirect("/login?redirectTo=/app/admin");
  }

  return actorResult.actor.user;
}
