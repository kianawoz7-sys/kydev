"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { createClient } from "@/lib/supabase/server";
import { serializeFormConfig } from "@/lib/form-config";
import {
  serviceFormSchema,
  serviceIdSchema,
  toggleServiceSchema,
  type ServiceFormValues,
} from "@/lib/validations/services";
import type { Service } from "@/types/database";

export type ServiceMutationResult =
  | { success: true; message: string; service: Service }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<Record<keyof ServiceFormValues, string>>;
    };

export type ServiceDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };

function toServicePayload(values: ServiceFormValues) {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description.trim() || null,
    price: values.price,
    quota: values.quota,
    deadline: values.deadline
      ? new Date(values.deadline).toISOString()
      : null,
    image_url: values.imageUrl.trim() || null,
    requirements: values.requirements.trim() || null,
    is_active: values.isActive,
    form_config: serializeFormConfig(values.formConfig),
  };
}

function validationFailure(
  issues: ZodError<ServiceFormValues>,
): ServiceMutationResult {
  const fieldErrors: Partial<Record<keyof ServiceFormValues, string>> = {};

  for (const issue of issues.issues) {
    const field = issue.path[0] as keyof ServiceFormValues | undefined;
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }

  return {
    success: false,
    message: "Periksa kembali data jasa yang diisi.",
    fieldErrors,
  };
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  return {
    supabase,
    isAuthenticated: !error && Boolean(data?.claims?.sub),
  };
}

function databaseFailure(code?: string): ServiceMutationResult {
  if (code === "23505") {
    return {
      success: false,
      message: "Slug sudah digunakan oleh jasa lain.",
      fieldErrors: {
        slug: "Gunakan slug lain yang belum dipakai.",
      },
    };
  }

  return {
    success: false,
    message: "Data jasa belum dapat disimpan. Silakan coba kembali.",
  };
}

export async function createService(
  input: ServiceFormValues,
): Promise<ServiceMutationResult> {
  const parsed = serviceFormSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  const { supabase, isAuthenticated } = await getAuthenticatedClient();
  if (!isAuthenticated) {
    return {
      success: false,
      message: "Sesi admin berakhir. Silakan login kembali.",
    };
  }

  const { data, error } = await supabase
    .from("services")
    .insert(toServicePayload(parsed.data))
    .select("*")
    .single();

  if (error || !data) return databaseFailure(error?.code);

  revalidatePath("/admin/services");
  return {
    success: true,
    message: "Jasa berhasil ditambahkan.",
    service: data,
  };
}

export async function updateService(
  id: string,
  input: ServiceFormValues,
): Promise<ServiceMutationResult> {
  const parsedId = serviceIdSchema.safeParse(id);
  const parsed = serviceFormSchema.safeParse(input);

  if (!parsedId.success) {
    return { success: false, message: parsedId.error.issues[0].message };
  }
  if (!parsed.success) return validationFailure(parsed.error);

  const { supabase, isAuthenticated } = await getAuthenticatedClient();
  if (!isAuthenticated) {
    return {
      success: false,
      message: "Sesi admin berakhir. Silakan login kembali.",
    };
  }

  const { data, error } = await supabase
    .from("services")
    .update({
      ...toServicePayload(parsed.data),
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsedId.data)
    .select("*")
    .maybeSingle();

  if (error || !data) return databaseFailure(error?.code);

  revalidatePath("/admin/services");
  return {
    success: true,
    message: "Perubahan jasa berhasil disimpan.",
    service: data,
  };
}

export async function toggleService(
  input: { id: string; isActive: boolean },
): Promise<ServiceMutationResult> {
  const parsed = toggleServiceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { supabase, isAuthenticated } = await getAuthenticatedClient();
  if (!isAuthenticated) {
    return {
      success: false,
      message: "Sesi admin berakhir. Silakan login kembali.",
    };
  }

  const { data, error } = await supabase
    .from("services")
    .update({
      is_active: parsed.data.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .select("*")
    .maybeSingle();

  if (error || !data) return databaseFailure(error?.code);

  revalidatePath("/admin/services");
  return {
    success: true,
    message: parsed.data.isActive
      ? "Jasa berhasil diaktifkan."
      : "Jasa berhasil dinonaktifkan.",
    service: data,
  };
}

export async function deleteService(id: string): Promise<ServiceDeleteResult> {
  const parsedId = serviceIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { success: false, message: parsedId.error.issues[0].message };
  }

  const { supabase, isAuthenticated } = await getAuthenticatedClient();
  if (!isAuthenticated) {
    return {
      success: false,
      message: "Sesi admin berakhir. Silakan login kembali.",
    };
  }

  const { data, error } = await supabase
    .from("services")
    .delete()
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  if (error?.code === "23503") {
    return {
      success: false,
      message:
        "Jasa ini sudah memiliki pesanan dan tidak dapat dihapus. Nonaktifkan jasa sebagai gantinya.",
    };
  }

  if (error || !data) {
    return {
      success: false,
      message: "Jasa belum dapat dihapus. Silakan coba kembali.",
    };
  }

  revalidatePath("/admin/services");
  return { success: true, message: "Jasa berhasil dihapus." };
}
