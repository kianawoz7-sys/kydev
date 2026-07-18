import { z } from "zod";

import type { Json } from "@/types/database";

export const BUILT_IN_FIELD_KEYS = [
  "full_name",
  "whatsapp",
  "faculty",
  "major",
  "nim",
  "group_name",
  "birth_place",
  "birth_date",
  "address",
  "motto",
  "customer_photo",
] as const;

export type BuiltInFieldKey = (typeof BUILT_IN_FIELD_KEYS)[number];

export const FIELD_STATUSES = ["required", "optional", "hidden"] as const;
export type FieldStatus = (typeof FIELD_STATUSES)[number];

export const CUSTOM_FIELD_TYPES = [
  "text",
  "number",
  "textarea",
  "select",
] as const;
export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number];

const fieldStatusSchema = z.enum(FIELD_STATUSES);
const fieldConfigSchema = z.object({
  label: z.string().trim().min(1, "Label field wajib diisi.").max(80),
  status: fieldStatusSchema,
});

const customFieldBase = {
  id: z
    .string()
    .trim()
    .min(1, "ID field wajib diisi.")
    .max(60, "ID field maksimal 60 karakter.")
    .regex(
      /^[a-z][a-z0-9_]*$/,
      "ID harus diawali huruf kecil dan hanya berisi huruf, angka, atau underscore.",
    ),
  label: z.string().trim().min(1, "Label field wajib diisi.").max(80),
  status: fieldStatusSchema,
};

export const customFieldSchema = z.discriminatedUnion("type", [
  z.object({ ...customFieldBase, type: z.literal("text") }),
  z.object({ ...customFieldBase, type: z.literal("number") }),
  z.object({ ...customFieldBase, type: z.literal("textarea") }),
  z.object({
    ...customFieldBase,
    type: z.literal("select"),
    options: z
      .array(z.string().trim().min(1, "Pilihan tidak boleh kosong.").max(100))
      .min(1, "Field select minimal memiliki satu pilihan.")
      .max(50, "Maksimal 50 pilihan."),
  }),
]);

export const formConfigSchema = z
  .object({
    full_name: fieldConfigSchema.extend({ status: z.literal("required") }),
    whatsapp: fieldConfigSchema.extend({ status: z.literal("required") }),
    faculty: fieldConfigSchema,
    major: fieldConfigSchema,
    nim: fieldConfigSchema,
    group_name: fieldConfigSchema,
    birth_place: fieldConfigSchema,
    birth_date: fieldConfigSchema,
    address: fieldConfigSchema,
    motto: fieldConfigSchema,
    customer_photo: fieldConfigSchema,
    custom_fields: z.array(customFieldSchema).max(30, "Maksimal 30 field khusus."),
  })
  .superRefine((config, context) => {
    const builtInIds = new Set<string>(BUILT_IN_FIELD_KEYS);
    const usedCustomIds = new Set<string>();
    const unsafeIds = new Set(["custom_fields", "__proto__", "prototype", "constructor"]);

    for (const [index, field] of config.custom_fields.entries()) {
      if (builtInIds.has(field.id) || unsafeIds.has(field.id)) {
        context.addIssue({
          code: "custom",
          message: builtInIds.has(field.id)
            ? "ID field khusus tidak boleh sama dengan field bawaan."
            : "ID field khusus tidak dapat digunakan.",
          path: ["custom_fields", index, "id"],
        });
      } else if (usedCustomIds.has(field.id)) {
        context.addIssue({
          code: "custom",
          message: "ID field khusus tidak boleh duplikat.",
          path: ["custom_fields", index, "id"],
        });
      }
      usedCustomIds.add(field.id);

      if (field.type === "select") {
        const normalizedOptions = field.options.map((option) =>
          option.toLocaleLowerCase("id-ID"),
        );
        if (new Set(normalizedOptions).size !== normalizedOptions.length) {
          context.addIssue({
            code: "custom",
            message: "Pilihan select tidak boleh duplikat.",
            path: ["custom_fields", index, "options"],
          });
        }
      }
    }
  });

export type FormConfig = z.infer<typeof formConfigSchema>;
export type CustomField = z.infer<typeof customFieldSchema>;

const defaultFormConfig: FormConfig = {
  full_name: { label: "Nama lengkap", status: "required" },
  whatsapp: { label: "Nomor WhatsApp", status: "required" },
  faculty: { label: "Fakultas", status: "required" },
  major: { label: "Jurusan / Program Studi", status: "required" },
  nim: { label: "NIM", status: "hidden" },
  group_name: { label: "Kelompok", status: "required" },
  birth_place: { label: "Tempat lahir", status: "optional" },
  birth_date: { label: "Tanggal lahir", status: "optional" },
  address: { label: "Alamat", status: "optional" },
  motto: { label: "Motto hidup", status: "optional" },
  customer_photo: { label: "Foto", status: "optional" },
  custom_fields: [],
};

export const BUILT_IN_FIELD_NAMES: Record<BuiltInFieldKey, string> = {
  full_name: "Nama",
  whatsapp: "WhatsApp",
  faculty: "Fakultas",
  major: "Jurusan / Program Studi",
  nim: "NIM",
  group_name: "Kelompok",
  birth_place: "Tempat lahir",
  birth_date: "Tanggal lahir",
  address: "Alamat",
  motto: "Motto hidup",
  customer_photo: "Upload foto",
};

export function getDefaultFormConfig(): FormConfig {
  return structuredClone(defaultFormConfig);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizeFormConfig(value: unknown): FormConfig {
  if (!isRecord(value)) return getDefaultFormConfig();

  const config = getDefaultFormConfig();
  const mutableFields = config as unknown as Record<
    BuiltInFieldKey,
    { label: string; status: FieldStatus }
  >;

  for (const key of BUILT_IN_FIELD_KEYS) {
    const parsed = fieldConfigSchema.safeParse(value[key]);
    if (parsed.success) mutableFields[key] = parsed.data;
  }

  config.full_name.status = "required";
  config.whatsapp.status = "required";

  if (Array.isArray(value.custom_fields)) {
    const customFields: CustomField[] = [];
    const usedIds = new Set<string>([
      ...BUILT_IN_FIELD_KEYS,
      "custom_fields",
      "__proto__",
      "prototype",
      "constructor",
    ]);

    for (const candidate of value.custom_fields) {
      const parsed = customFieldSchema.safeParse(candidate);
      if (!parsed.success || usedIds.has(parsed.data.id)) continue;

      if (
        parsed.data.type === "select" &&
        new Set(
          parsed.data.options.map((option) =>
            option.toLocaleLowerCase("id-ID"),
          ),
        ).size !== parsed.data.options.length
      ) {
        continue;
      }

      customFields.push(parsed.data);
      usedIds.add(parsed.data.id);
    }

    config.custom_fields = customFields;
  }

  return config;
}

export function serializeFormConfig(config: FormConfig): Json {
  return formConfigSchema.parse(config) as Json;
}

export function slugifyCustomFieldId(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^[^a-z]+/, "");
}

export function getFormConfigCounts(config: FormConfig) {
  const fields = [
    ...BUILT_IN_FIELD_KEYS.map((key) => config[key]),
    ...config.custom_fields,
  ];

  return {
    required: fields.filter((field) => field.status === "required").length,
    optional: fields.filter((field) => field.status === "optional").length,
    hidden: fields.filter((field) => field.status === "hidden").length,
  };
}
