export type AdminAuthorizationFailure = "UNAUTHORIZED" | "PROFILE_NOT_FOUND";

export function getAdminAuthorizationFailure(input: {
  authenticated: boolean;
  appMetadataRole?: unknown;
  profileFound: boolean;
  profileRole?: unknown;
  profileError: boolean;
}): AdminAuthorizationFailure | null {
  if (!input.authenticated || input.appMetadataRole !== "admin") {
    return "UNAUTHORIZED";
  }

  if (input.profileError) {
    return "PROFILE_NOT_FOUND";
  }

  if (!input.profileFound || input.profileRole !== "admin") {
    return "UNAUTHORIZED";
  }

  return null;
}
