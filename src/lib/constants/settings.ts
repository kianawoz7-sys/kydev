export const SETTINGS_ID = 1;
export const PUBLIC_ASSETS_BUCKET = "public-assets";
export const QRIS_FILE_MAX_BYTES = 5 * 1024 * 1024;
export const QRIS_FILE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const QRIS_PUBLIC_URL_PATH =
  `/storage/v1/object/public/${PUBLIC_ASSETS_BUCKET}/`;
