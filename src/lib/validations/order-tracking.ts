import { z } from "zod";

export const ORDER_TRACKING_NOT_FOUND_MESSAGE =
  "Pesanan tidak ditemukan. Periksa kembali kode pesanan yang kamu masukkan.";

export function normalizeOrderCode(value: string) {
  return value.trim().toUpperCase();
}

export const orderTrackingSchema = z.object({
  orderCode: z
    .string()
    .trim()
    .min(1, "Kode pesanan wajib diisi.")
    .max(32, "Kode pesanan maksimal 32 karakter.")
    .regex(
      /^[a-z0-9-]+$/i,
      "Kode pesanan hanya boleh berisi huruf, angka, dan tanda strip.",
    ),
});

export type OrderTrackingInput = z.infer<typeof orderTrackingSchema>;
