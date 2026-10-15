import assert from "node:assert/strict";
import test from "node:test";
import {
  getServiceImageExtension,
  isServiceImageSizeAllowed,
  MAX_SERVICE_IMAGE_SIZE_BYTES,
} from "../serviceImageUpload.ts";

test("accepts image sizes below and exactly at 3 MiB", () => {
  assert.equal(MAX_SERVICE_IMAGE_SIZE_BYTES, 3 * 1024 * 1024);
  assert.equal(isServiceImageSizeAllowed(1), true);
  assert.equal(isServiceImageSizeAllowed(MAX_SERVICE_IMAGE_SIZE_BYTES - 1), true);
  assert.equal(isServiceImageSizeAllowed(MAX_SERVICE_IMAGE_SIZE_BYTES), true);
});

test("rejects image sizes above 3 MiB and invalid sizes", () => {
  assert.equal(isServiceImageSizeAllowed(MAX_SERVICE_IMAGE_SIZE_BYTES + 1), false);
  assert.equal(isServiceImageSizeAllowed(0), false);
  assert.equal(isServiceImageSizeAllowed(-1), false);
  assert.equal(isServiceImageSizeAllowed(1.5), false);
});

test("allows only JPEG, PNG, and WebP MIME types", () => {
  assert.equal(getServiceImageExtension("image/jpeg"), "jpg");
  assert.equal(getServiceImageExtension("image/png"), "png");
  assert.equal(getServiceImageExtension("image/webp"), "webp");
  assert.equal(getServiceImageExtension("image/gif"), null);
  assert.equal(getServiceImageExtension("application/pdf"), null);
});
