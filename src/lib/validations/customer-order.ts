import { z } from "zod";

import type { AcademicOptions } from "@/lib/academic-options";
import {
  BUILT_IN_FIELD_KEYS,
  type BuiltInFieldKey,
  type FormConfig,
} from "@/lib/form-config";
import type { Json } from "@/types/database";

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum, `Maksimal ${maximum} karakter.`);

export function normalizeWhatsappLocalPart(value: string) {
  const digits = value.replace(/\D/g, "");
  const localPart = digits.startsWith("62")
    ? digits.slice(2)
    : digits.startsWith("0")
      ? digits.slice(1)
      : digits;

  return localPart;
}

export function toCanonicalWhatsapp(value: string) {
  const localPart = normalizeWhatsappLocalPart(value);
  return localPart ? `62${localPart}` : "";
}

export function formatWhatsappForReview(value: string) {
  const localPart = normalizeWhatsappLocalPart(value);
  return localPart ? `+62 ${localPart}` : "";
}

const whatsappLocalPartSchema = z
  .string()
  .trim()
  .min(1, "Nomor WhatsApp wajib diisi.")
  .refine(
    (value) => /^8[1-9][0-9]{7,10}$/.test(value),
    "Nomor WhatsApp tidak valid.",
  );

const canonicalWhatsappSchema = z
  .string()
  .trim()
  .refine(
    (value) => /^628[1-9][0-9]{7,10}$/.test(value),
    "Nomor WhatsApp tidak valid.",
  );

const sharedOrderDataShape = {
  serviceId: z.string().uuid("Jasa tidak valid."),
  fullName: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter.")
    .max(120, "Nama lengkap maksimal 120 karakter."),
  faculty: optionalText(120),
  major: optionalText(120),
  nim: optionalText(80),
  groupName: optionalText(120),
  birthPlace: optionalText(120),
  birthDate: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Tanggal lahir tidak valid.",
    ),
  address: optionalText(1_000),
  motto: optionalText(500),
};

export const customerOrderSubmissionSchema = z.object({
  ...sharedOrderDataShape,
  whatsapp: canonicalWhatsappSchema,
  termsAccepted: z.literal("true", {
    error: "Syarat dan ketentuan wajib disetujui.",
  }),
});

export type CustomerOrderFields = z.output<
  typeof customerOrderSubmissionSchema
>;

export type CustomerOrderClientData = Omit<
  CustomerOrderFields,
  "termsAccepted"
> & {
  termsAccepted: boolean;
  extraData: Record<string, string>;
};

export type BuiltInClientFieldName =
  | "fullName"
  | "whatsapp"
  | "faculty"
  | "major"
  | "nim"
  | "groupName"
  | "birthPlace"
  | "birthDate"
  | "address"
  | "motto";

export const BUILT_IN_CLIENT_FIELDS: Record<
  Exclude<BuiltInFieldKey, "customer_photo">,
  BuiltInClientFieldName
> = {
  full_name: "fullName",
  whatsapp: "whatsapp",
  faculty: "faculty",
  major: "major",
  nim: "nim",
  group_name: "groupName",
  birth_place: "birthPlace",
  birth_date: "birthDate",
  address: "address",
  motto: "motto",
};

type ConfiguredValidationResult =
  | { success: true; extraData: Json }
  | {
      success: false;
      message: string;
      path?: string[];
      issues: Array<{ message: string; path: string[] }>;
    };

export function validateConfiguredOrderData(
  config: FormConfig,
  data: Omit<CustomerOrderClientData, "termsAccepted" | "extraData">,
  extraValues: Record<string, string>,
): ConfiguredValidationResult {
  const issues: Array<{ message: string; path: string[] }> = [];

  for (const key of BUILT_IN_FIELD_KEYS) {
    if (
      key === "customer_photo" ||
      key === "faculty" ||
      key === "major"
    ) {
      continue;
    }
    const field = config[key];
    const clientKey = BUILT_IN_CLIENT_FIELDS[key];
    const value = String(data[clientKey] ?? "").trim();

    if (field.status === "required" && !value) {
      issues.push({
        message: `${field.label} wajib diisi.`,
        path: [String(clientKey)],
      });
    }
  }

  const configuredCustomFields = new Map(
    config.custom_fields.map((field) => [field.id, field]),
  );
  for (const key of Object.keys(extraValues)) {
    const field = configuredCustomFields.get(key);
    if (!field || field.status === "hidden") {
      issues.push({
        message: "Data field khusus tidak valid.",
        path: ["extraData", key],
      });
    }
  }

  const extraData: Record<string, Json> = {};
  for (const field of config.custom_fields) {
    if (field.status === "hidden") continue;
    const value = String(extraValues[field.id] ?? "").trim();

    if (field.status === "required" && !value) {
      issues.push({
        message: `${field.label} wajib diisi.`,
        path: ["extraData", field.id],
      });
      continue;
    }
    if (!value) continue;
    if (value.length > 2_000) {
      issues.push({
        message: `${field.label} maksimal 2.000 karakter.`,
        path: ["extraData", field.id],
      });
      continue;
    }
    if (field.type === "number" && !Number.isFinite(Number(value))) {
      issues.push({
        message: `${field.label} harus berupa angka.`,
        path: ["extraData", field.id],
      });
      continue;
    }
    if (field.type === "select" && !field.options.includes(value)) {
      issues.push({
        message: `Pilihan ${field.label} tidak valid.`,
        path: ["extraData", field.id],
      });
      continue;
    }

    extraData[field.id] = {
      label: field.label,
      value,
    };
  }

  if (issues.length > 0) {
    return {
      success: false,
      message: issues[0].message,
      path: issues[0].path,
      issues,
    };
  }

  return { success: true, extraData };
}

export function createCustomerOrderClientSchema(
  config: FormConfig,
  academicOptions: AcademicOptions,
) {
  const facultyIds = new Set(
    academicOptions.faculties.map((faculty) => String(faculty.id)),
  );
  const studyPrograms = new Map(
    academicOptions.studyPrograms.map((program) => [String(program.id), program]),
  );

  return z
    .object({
      ...sharedOrderDataShape,
      whatsapp: whatsappLocalPartSchema,
      termsAccepted: z
        .boolean()
        .refine(Boolean, "Syarat dan ketentuan wajib disetujui."),
      extraData: z.record(z.string(), z.string().max(2_000)),
    })
    .superRefine((values, context) => {
      const result = validateConfiguredOrderData(
        config,
        values,
        values.extraData,
      );

      if (!result.success) {
        for (const issue of result.issues) {
          context.addIssue({
            code: "custom",
            message: issue.message,
            path: issue.path,
          });
        }
      }

      const facultyVisible = config.faculty.status !== "hidden";
      const majorVisible = config.major.status !== "hidden";
      const facultyId = facultyVisible ? values.faculty.trim() : "";
      const studyProgramId = majorVisible ? values.major.trim() : "";
      const selectedProgram = studyPrograms.get(studyProgramId);
      const facultyRequiredAndMissing =
        facultyVisible &&
        config.faculty.status === "required" &&
        !facultyId;

      if (facultyRequiredAndMissing) {
        context.addIssue({
          code: "custom",
          message: "Pilih fakultas terlebih dahulu.",
          path: ["faculty"],
        });
      } else if (facultyId && !facultyIds.has(facultyId)) {
        context.addIssue({
          code: "custom",
          message: "Pilihan fakultas atau program studi tidak tersedia.",
          path: ["faculty"],
        });
      }

      if (
        majorVisible &&
        config.major.status === "required" &&
        !studyProgramId
      ) {
        if (!facultyRequiredAndMissing) {
          context.addIssue({
            code: "custom",
            message:
              facultyVisible && !facultyId
                ? "Pilih fakultas terlebih dahulu."
                : "Pilih program studi.",
            path: facultyVisible && !facultyId ? ["faculty"] : ["major"],
          });
        }
      } else if (studyProgramId && !selectedProgram) {
        context.addIssue({
          code: "custom",
          message: "Pilihan fakultas atau program studi tidak tersedia.",
          path: ["major"],
        });
      } else if (
        selectedProgram &&
        facultyVisible &&
        (!facultyId || String(selectedProgram.faculty_id) !== facultyId)
      ) {
        if (!facultyRequiredAndMissing) {
          context.addIssue({
            code: "custom",
            message: facultyId
              ? "Program studi tidak sesuai dengan fakultas yang dipilih."
              : "Pilih fakultas terlebih dahulu.",
            path: facultyId ? ["major"] : ["faculty"],
          });
        }
      } else if (
        selectedProgram &&
        !facultyVisible &&
        !facultyIds.has(String(selectedProgram.faculty_id))
      ) {
        context.addIssue({
          code: "custom",
          message: "Pilihan fakultas atau program studi tidak tersedia.",
          path: ["major"],
        });
      }
    });
}
