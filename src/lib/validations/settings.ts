import { z } from "zod";

import {
  QRIS_FILE_MAX_BYTES,
  QRIS_FILE_MIME_TYPES,
} from "@/lib/constants/settings";

export function normalizeSettingsWhatsappLocalPart(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("62")) return digits.slice(2);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function toCanonicalSettingsWhatsapp(value: string) {
  const localPart = normalizeSettingsWhatsappLocalPart(value);
  return localPart ? `62${localPart}` : "";
}

export const settingsFormSchema = z.object({
  websiteName: z
    .string()
    .trim()
    .min(1, "Nama website wajib diisi.")
    .min(2, "Nama website minimal 2 karakter.")
    .max(50, "Nama website maksimal 50 karakter."),
  whatsapp: z
    .string()
    .trim()
    .regex(/^8[1-9][0-9]{7,10}$/, "Nomor WhatsApp tidak valid."),
  qrisOwnerName: z
    .string()
    .trim()
    .min(1, "Nama pemilik QRIS wajib diisi.")
    .min(2, "Nama pemilik QRIS minimal 2 karakter.")
    .max(100, "Nama pemilik QRIS maksimal 100 karakter."),
  paymentInstruction: z
    .string()
    .trim()
    .min(1, "Instruksi pembayaran wajib diisi.")
    .min(10, "Instruksi pembayaran minimal 10 karakter.")
    .max(1_000, "Instruksi pembayaran maksimal 1.000 karakter."),
  termsAndConditions: z
    .string()
    .trim()
    .min(1, "Syarat dan ketentuan wajib diisi.")
    .min(10, "Syarat dan ketentuan minimal 10 karakter.")
    .max(3_000, "Syarat dan ketentuan maksimal 3.000 karakter."),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function validateQrisFile(
  file: { size: number; type: string } | null,
) {
  if (!file) return null;

  if (!QRIS_FILE_MIME_TYPES.includes(file.type as never)) {
    return "File QRIS harus berupa JPG, PNG, atau WEBP.";
  }

  if (file.size > QRIS_FILE_MAX_BYTES) {
    return "Ukuran QRIS maksimal 5 MB.";
  }

  return null;
}
