import { NextResponse } from "next/server";

import {
  ORDER_FILE_MAX_BYTES,
  ORDER_FILE_MIME_TYPES,
  ORDER_FILES_BUCKET,
} from "@/lib/constants/orders";
import {
  encodeOrderSuccess,
  ORDER_SUCCESS_COOKIE,
} from "@/lib/order-success";
import { normalizeFormConfig } from "@/lib/form-config";
import { formatRupiah, hasDeadlinePassed } from "@/lib/services";
import { resolveOrderAcademicSelection } from "@/lib/public/academic-options";
import { createClient } from "@/lib/supabase/server";
import {
  customerOrderSubmissionSchema,
  toCanonicalWhatsapp,
  validateConfiguredOrderData,
} from "@/lib/validations/customer-order";

export const runtime = "nodejs";

const fileExtensions: Record<(typeof ORDER_FILE_MIME_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const scalarFields = [
  "serviceId",
  "fullName",
  "whatsapp",
  "faculty",
  "major",
  "nim",
  "groupName",
  "birthPlace",
  "birthDate",
  "address",
  "motto",
  "termsAccepted",
] as const;

function failure(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function readScalarFields(formData: FormData) {
  return Object.fromEntries(
    scalarFields.map((field) => {
      const value = formData.get(field);
      return [field, typeof value === "string" ? value : ""];
    }),
  );
}

function validateImage(
  value: FormDataEntryValue | null,
  label: string,
  required = true,
) {
  if (!(value instanceof File) || value.size === 0) {
    return required
      ? ({ error: `${label} wajib diunggah.` } as const)
      : ({ file: null, extension: null } as const);
  }

  if (
    !ORDER_FILE_MIME_TYPES.includes(
      value.type as (typeof ORDER_FILE_MIME_TYPES)[number],
    )
  ) {
    return {
      error: `${label} harus berformat JPEG, PNG, atau WebP.`,
    } as const;
  }

  if (value.size > ORDER_FILE_MAX_BYTES) {
    return { error: `${label} maksimal berukuran 5 MB.` } as const;
  }

  return {
    file: value,
    extension:
      fileExtensions[value.type as (typeof ORDER_FILE_MIME_TYPES)[number]],
  } as const;
}

function readExtraValues(formData: FormData) {
  const raw = formData.get("extraData");
  if (typeof raw !== "string" || raw.length > 50_000) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    const entries = Object.entries(parsed);
    if (entries.length > 30) return null;
    if (entries.some(([, value]) => typeof value !== "string")) return null;
    return Object.fromEntries(entries) as Record<string, string>;
  } catch {
    return null;
  }
}

function jakartaDateCode(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return `${value("year")}${value("month")}${value("day")}`;
}

function generateOrderCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const random = crypto.getRandomValues(new Uint8Array(4));
  const suffix = Array.from(random, (value) => alphabet[value % alphabet.length])
    .join("");

  return `NT-${jakartaDateCode()}-${suffix}`;
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return failure("Data pesanan tidak dapat dibaca. Silakan coba kembali.");
  }

  const scalarValues = readScalarFields(formData);
  const parsed = customerOrderSubmissionSchema.safeParse({
    ...scalarValues,
    whatsapp: toCanonicalWhatsapp(scalarValues.whatsapp),
  });

  if (!parsed.success) {
    return failure(
      parsed.error.issues[0]?.message ?? "Data pesanan belum lengkap.",
    );
  }

  const paymentProof = validateImage(
    formData.get("paymentProof"),
    "Bukti pembayaran",
  );
  if ("error" in paymentProof && paymentProof.error) {
    return failure(paymentProof.error);
  }
  if (!paymentProof.file || !paymentProof.extension) {
    return failure("Bukti pembayaran wajib diunggah.");
  }

  const supabase = await createClient();
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, name, price, quota, deadline, is_active, form_config")
    .eq("id", parsed.data.serviceId)
    .maybeSingle();

  if (serviceError) {
    return failure("Jasa belum dapat diperiksa. Silakan coba kembali.", 503);
  }

  if (!service || !service.is_active) {
    return failure("Jasa ini sudah tidak tersedia.", 409);
  }

  if (hasDeadlinePassed(service.deadline)) {
    return failure("Pendaftaran jasa ini sudah ditutup.", 409);
  }

  const formConfig = normalizeFormConfig(service.form_config);
  const academicSelection = await resolveOrderAcademicSelection(
    supabase,
    formConfig,
    {
      facultyId: parsed.data.faculty,
      studyProgramId: parsed.data.major,
    },
  );
  if (!academicSelection.success) {
    return failure(academicSelection.message);
  }

  const extraValues = readExtraValues(formData);
  if (!extraValues) {
    return failure("Data field khusus tidak valid.");
  }

  const configuredValidation = validateConfiguredOrderData(
    formConfig,
    parsed.data,
    extraValues,
  );
  if (!configuredValidation.success) {
    return failure(configuredValidation.message);
  }

  const photoStatus = formConfig.customer_photo.status;
  const customerPhoto = validateImage(
    photoStatus === "hidden" ? null : formData.get("customerPhoto"),
    formConfig.customer_photo.label,
    photoStatus === "required",
  );
  if ("error" in customerPhoto && customerPhoto.error) {
    return failure(customerPhoto.error);
  }

  const { count, error: countError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("service_id", service.id)
    .neq("order_status", "dibatalkan");

  if (countError) {
    return failure("Ketersediaan kuota belum dapat diperiksa.", 503);
  }

  if (service.quota !== null && (count ?? 0) >= service.quota) {
    return failure("Maaf, kuota jasa ini sudah penuh.", 409);
  }

  const { data: settings, error: settingsError } = await supabase
    .from("settings")
    .select("whatsapp_number, qris_image_url")
    .eq("id", 1)
    .maybeSingle();

  if (settingsError) {
    return failure("Pengaturan pembayaran belum dapat dimuat.", 503);
  }

  if (!settings?.qris_image_url?.trim()) {
    return failure(
      "QRIS belum tersedia. Hubungi admin sebelum mengirim pesanan.",
      409,
    );
  }

  const cleanup = async (paths: string[]) => {
    if (paths.length > 0) {
      await supabase.storage.from(ORDER_FILES_BUCKET).remove(paths);
    }
  };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const orderCode = generateOrderCode();
    const photoPath = customerPhoto.file
      ? `orders/${orderCode}/customer-photo.${customerPhoto.extension}`
      : null;
    const paymentPath = `orders/${orderCode}/payment-proof.${paymentProof.extension}`;
    const uploadedPaths: string[] = [];

    if (customerPhoto.file && photoPath) {
      const { error: photoError } = await supabase.storage
        .from(ORDER_FILES_BUCKET)
        .upload(photoPath, customerPhoto.file, {
          cacheControl: "3600",
          contentType: customerPhoto.file.type,
          upsert: false,
        });

      if (photoError) {
        return failure(
          "Foto belum dapat diunggah. Periksa koneksi lalu coba kembali.",
          503,
        );
      }
      uploadedPaths.push(photoPath);
    }

    const { error: paymentError } = await supabase.storage
      .from(ORDER_FILES_BUCKET)
      .upload(paymentPath, paymentProof.file, {
        cacheControl: "3600",
        contentType: paymentProof.file.type,
        upsert: false,
      });

    if (paymentError) {
      await cleanup(uploadedPaths);
      return failure(
        "Bukti pembayaran belum dapat diunggah. Silakan coba kembali.",
        503,
      );
    }
    uploadedPaths.push(paymentPath);

    const { error: insertError } = await supabase.from("orders").insert({
      order_code: orderCode,
      service_id: service.id,
      full_name: parsed.data.fullName,
      whatsapp: parsed.data.whatsapp,
      faculty: academicSelection.faculty,
      major: academicSelection.major,
      nim: formConfig.nim.status === "hidden" ? null : nullable(parsed.data.nim),
      group_name:
        formConfig.group_name.status === "hidden"
          ? null
          : nullable(parsed.data.groupName),
      birth_place:
        formConfig.birth_place.status === "hidden"
          ? null
          : nullable(parsed.data.birthPlace),
      birth_date:
        formConfig.birth_date.status === "hidden"
          ? null
          : nullable(parsed.data.birthDate),
      address:
        formConfig.address.status === "hidden"
          ? null
          : nullable(parsed.data.address),
      motto:
        formConfig.motto.status === "hidden"
          ? null
          : nullable(parsed.data.motto),
      photo_path: photoPath,
      payment_proof_path: paymentPath,
      terms_accepted: true,
      extra_data: configuredValidation.extraData,
    });

    if (insertError) {
      await cleanup(uploadedPaths);

      if (insertError.code === "23505") continue;

      return failure(
        "Pesanan belum dapat disimpan. Data Anda tetap ada di formulir; silakan coba kembali.",
        503,
      );
    }

    const response = NextResponse.json({ success: true, orderCode });
    response.cookies.set(
      ORDER_SUCCESS_COOKIE,
      encodeOrderSuccess({
        orderCode,
        fullName: parsed.data.fullName,
        serviceName: service.name,
        formattedPrice: formatRupiah(service.price),
        whatsappNumber: settings.whatsapp_number?.trim() ?? "",
      }),
      {
        httpOnly: true,
        maxAge: 15 * 60,
        path: "/pesanan/berhasil",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    );

    return response;
  }

  return failure(
    "Kode pesanan belum dapat dibuat. Silakan kirim ulang formulir.",
    503,
  );
}
