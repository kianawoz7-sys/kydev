import { z } from "zod";

export const updateOrderSchema = z.object({
  id: z.uuid(),
  paymentStatus: z.enum(["menunggu", "lunas", "ditolak"]),
  orderStatus: z.enum(["masuk", "diproses", "selesai", "dibatalkan"]),
  adminNote: z.string().trim().max(1_000, "Catatan maksimal 1.000 karakter."),
});

export const orderIdSchema = z.uuid();
