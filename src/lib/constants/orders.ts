import type { OrderStatus, PaymentStatus } from "@/types/database";

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "menunggu",
  "lunas",
  "ditolak",
];

export const ORDER_STATUSES: OrderStatus[] = [
  "masuk",
  "diproses",
  "selesai",
  "dibatalkan",
];

export const ORDER_FILES_BUCKET = "order-files";
export const ORDER_FILE_MAX_BYTES = 5 * 1024 * 1024;
export const ORDER_FILE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
