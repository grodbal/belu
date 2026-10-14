import assert from "node:assert/strict";
import test from "node:test";

const { getAdminAuthorizationFailure } = await import("../adminAuthorization.ts");

const authorized = {
  authenticated: true,
  appMetadataRole: "admin",
  profileFound: true,
  profileRole: "admin",
  profileError: false,
};

test("admin legítimo satisface ambas comprobaciones de rol", () => {
  assert.equal(getAdminAuthorizationFailure(authorized), null);
});

test("usuario no autenticado es denegado", () => {
  assert.equal(
    getAdminAuthorizationFailure({ ...authorized, authenticated: false }),
    "UNAUTHORIZED",
  );
});

test("clienta es denegada", () => {
  assert.equal(
    getAdminAuthorizationFailure({
      ...authorized,
      appMetadataRole: "cliente",
      profileRole: "cliente",
    }),
    "UNAUTHORIZED",
  );
});

test("Beluer es denegada", () => {
  assert.equal(
    getAdminAuthorizationFailure({
      ...authorized,
      appMetadataRole: "beluer",
      profileRole: "beluer",
    }),
    "UNAUTHORIZED",
  );
});

test("profiles admin sin app_metadata admin es denegado", () => {
  assert.equal(
    getAdminAuthorizationFailure({ ...authorized, appMetadataRole: "cliente" }),
    "UNAUTHORIZED",
  );
});

test("app_metadata admin con perfil distinto es denegado", () => {
  assert.equal(
    getAdminAuthorizationFailure({ ...authorized, profileRole: "beluer" }),
    "UNAUTHORIZED",
  );
});

test("perfil inexistente es denegado", () => {
  assert.equal(
    getAdminAuthorizationFailure({ ...authorized, profileFound: false }),
    "UNAUTHORIZED",
  );
});

test("error al consultar el perfil falla de forma cerrada", () => {
  assert.equal(
    getAdminAuthorizationFailure({ ...authorized, profileError: true }),
    "PROFILE_NOT_FOUND",
  );
});
