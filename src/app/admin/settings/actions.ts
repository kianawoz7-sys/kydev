"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { adminSettingsSelect } from "@/lib/admin/settings";
import {
  PUBLIC_ASSETS_BUCKET,
  QRIS_PUBLIC_URL_PATH,
  SETTINGS_ID,
} from "@/lib/constants/settings";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeSettingsWhatsappLocalPart,
  settingsFormSchema,
  toCanonicalSettingsWhatsapp,
  validateQrisFile,
  type SettingsFormValues,
} from "@/lib/validations/settings";
import type { Settings } from "@/types/database";

type SettingsField = keyof SettingsFormValues | "qrisFile";

export type UpdateSettingsResult =
  | { success: true; message: string; settings: Settings }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<Record<SettingsField, string>>;
    };

const fileExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function textEntry(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function validationFailure(
  error: ZodError<SettingsFormValues>,
): UpdateSettingsResult {
  const fieldErrors: Partial<Record<SettingsField, string>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0] as keyof SettingsFormValues | undefined;
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }

  return {
    success: false,
    message: "Periksa kembali pengaturan yang diisi.",
    fieldErrors,
  };
}

function isExpectedPublicUrl(value: string, objectPath: string) {
  try {
    const url = new URL(value);
    return (
      url.pathname === `${QRIS_PUBLIC_URL_PATH}${objectPath}` &&
      !url.pathname.includes("/storage/v1/object/sign/")
    );
  } catch {
    return false;
  }
}

export async function updateSettings(
  formData: FormData,
): Promise<UpdateSettingsResult> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return {
      success: false,
      message: "Sesi admin berakhir. Silakan login kembali.",
    };
  }

  const parsed = settingsFormSchema.safeParse({
    websiteName: textEntry(formData, "websiteName"),
    whatsapp: normalizeSettingsWhatsappLocalPart(
      textEntry(formData, "whatsapp"),
    ),
    qrisOwnerName: textEntry(formData, "qrisOwnerName"),
    paymentInstruction: textEntry(formData, "paymentInstruction"),
    termsAndConditions: textEntry(formData, "termsAndConditions"),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const fileEntry = formData.get("qrisFile");
  const qrisFile = fileEntry instanceof File && fileEntry.size > 0
    ? fileEntry
    : null;
  const qrisFileError = validateQrisFile(qrisFile);

  if (qrisFileError) {
    return {
      success: false,
      message: qrisFileError,
      fieldErrors: { qrisFile: qrisFileError },
    };
  }

  const { data: existingSettings, error: existingError } = await supabase
    .from("settings")
    .select("id, qris_image_url")
    .eq("id", SETTINGS_ID)
    .maybeSingle();

  if (existingError || !existingSettings) {
    return {
      success: false,
      message: "Pengaturan gagal disimpan. Silakan coba lagi.",
    };
  }

  let uploadedObjectPath: string | null = null;
  let nextQrisImageUrl = existingSettings.qris_image_url;

  if (qrisFile) {
    const extension = fileExtensions[qrisFile.type];
    if (!extension) {
      return {
        success: false,
        message: "File QRIS harus berupa JPG, PNG, atau WEBP.",
        fieldErrors: {
          qrisFile: "File QRIS harus berupa JPG, PNG, atau WEBP.",
        },
      };
    }

    uploadedObjectPath =
      `qris/qris-${Date.now()}-${randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(PUBLIC_ASSETS_BUCKET)
      .upload(uploadedObjectPath, qrisFile, {
        cacheControl: "3600",
        contentType: qrisFile.type,
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        message: "QRIS gagal diunggah. Silakan coba lagi.",
        fieldErrors: {
          qrisFile: "QRIS gagal diunggah. Silakan coba lagi.",
        },
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(PUBLIC_ASSETS_BUCKET)
      .getPublicUrl(uploadedObjectPath);

    if (!isExpectedPublicUrl(publicUrlData.publicUrl, uploadedObjectPath)) {
      await supabase.storage
        .from(PUBLIC_ASSETS_BUCKET)
        .remove([uploadedObjectPath]);

      return {
        success: false,
        message: "QRIS gagal diunggah. Silakan coba lagi.",
      };
    }

    nextQrisImageUrl = publicUrlData.publicUrl;
  }

  const { data: updatedSettings, error: updateError } = await supabase
    .from("settings")
    .update({
      website_name: parsed.data.websiteName,
      whatsapp_number: toCanonicalSettingsWhatsapp(parsed.data.whatsapp),
      qris_owner_name: parsed.data.qrisOwnerName,
      qris_image_url: nextQrisImageUrl,
      payment_instruction: parsed.data.paymentInstruction,
      terms_and_conditions: parsed.data.termsAndConditions,
    })
    .eq("id", SETTINGS_ID)
    .select(adminSettingsSelect)
    .maybeSingle();

  if (updateError || !updatedSettings) {
    if (uploadedObjectPath) {
      await supabase.storage
        .from(PUBLIC_ASSETS_BUCKET)
        .remove([uploadedObjectPath]);
    }

    return {
      success: false,
      message: "Pengaturan gagal disimpan. Silakan coba lagi.",
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return {
    success: true,
    message: "Pengaturan berhasil disimpan.",
    settings: updatedSettings,
  };
}
