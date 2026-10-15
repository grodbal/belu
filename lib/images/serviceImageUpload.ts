export const MAX_SERVICE_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

const serviceImageExtensions: Readonly<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function getServiceImageExtension(mimeType: string): string | null {
  return serviceImageExtensions[mimeType] ?? null;
}

export function isServiceImageSizeAllowed(sizeBytes: number): boolean {
  return Number.isInteger(sizeBytes) &&
    sizeBytes > 0 &&
    sizeBytes <= MAX_SERVICE_IMAGE_SIZE_BYTES;
}
