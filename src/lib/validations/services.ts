import { z } from "zod";

import { formConfigSchema } from "@/lib/form-config";

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum, `Maksimal ${maximum} karakter.`);

export const serviceFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama jasa minimal 3 karakter.")
    .max(120, "Nama jasa maksimal 120 karakter."),
  slug: z
    .string()
    .trim()
    .min(3, "Slug minimal 3 karakter.")
    .max(140, "Slug maksimal 140 karakter.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Gunakan huruf kecil, angka, dan tanda strip tanpa spasi.",
    ),
  description: optionalText(5_000),
  price: z
    .number({ error: "Harga wajib diisi dengan angka." })
    .finite("Harga tidak valid.")
    .int("Harga harus berupa bilangan bulat.")
    .min(0, "Harga minimal 0."),
  quota: z
    .number({ error: "Kuota harus berupa angka." })
    .finite("Kuota tidak valid.")
    .int("Kuota harus berupa bilangan bulat.")
    .min(1, "Kuota minimal 1.")
    .nullable(),
  deadline: z
    .string()
    .refine(
      (value) => value === "" || !Number.isNaN(new Date(value).getTime()),
      "Deadline tidak valid.",
    ),
  imageUrl: z
    .string()
    .trim()
    .max(2_000, "URL gambar terlalu panjang.")
    .refine(
      (value) =>
        value === "" ||
        (value.startsWith("/") && !value.startsWith("//")) ||
        z.url().safeParse(value).success,
      "Masukkan URL lengkap atau path lokal yang valid.",
    ),
  requirements: optionalText(10_000),
  isActive: z.boolean(),
  formConfig: formConfigSchema,
});

export const serviceIdSchema = z.uuid("ID jasa tidak valid.");

export const toggleServiceSchema = z.object({
  id: serviceIdSchema,
  isActive: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
