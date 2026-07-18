/* eslint-disable @next/next/no-img-element */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CircleAlert,
  CircleCheck,
  ExternalLink,
  ImageOff,
  LoaderCircle,
  QrCode,
  Save,
  Settings2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  updateSettings,
  type UpdateSettingsResult,
} from "@/app/admin/settings/actions";
import { Button, buttonStyles } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  normalizeSettingsWhatsappLocalPart,
  settingsFormSchema,
  validateQrisFile,
  type SettingsFormValues,
} from "@/lib/validations/settings";
import type { Settings } from "@/types/database";

type Feedback = {
  tone: "success" | "error";
  message: string;
} | null;

function toFormValues(settings: Settings): SettingsFormValues {
  return {
    websiteName: settings.website_name ?? "",
    whatsapp: normalizeSettingsWhatsappLocalPart(
      settings.whatsapp_number ?? "",
    ),
    qrisOwnerName: settings.qris_owner_name ?? "",
    paymentInstruction: settings.payment_instruction ?? "",
    termsAndConditions: settings.terms_and_conditions ?? "",
  };
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-2 text-sm font-semibold text-secondary" role="alert">
      {message}
    </p>
  ) : null;
}

function CharacterCount({ current, maximum }: { current: number; maximum: number }) {
  return (
    <p className="mt-2 text-right text-xs font-semibold text-muted">
      {current.toLocaleString("id-ID")} / {maximum.toLocaleString("id-ID")}
    </p>
  );
}

export function SettingsForm({ initialSettings }: { initialSettings: Settings }) {
  const router = useRouter();
  const [currentQrisUrl, setCurrentQrisUrl] = useState(
    initialSettings.qris_image_url?.trim() ?? "",
  );
  const [currentImageFailed, setCurrentImageFailed] = useState(false);
  const [selectedQris, setSelectedQris] = useState<File | null>(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(
    null,
  );
  const [selectedImageFailed, setSelectedImageFailed] = useState(false);
  const [qrisFileError, setQrisFileError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: toFormValues(initialSettings),
  });

  const paymentInstruction =
    useWatch({ control, name: "paymentInstruction" }) ?? "";
  const termsAndConditions =
    useWatch({ control, name: "termsAndConditions" }) ?? "";
  const whatsappField = register("whatsapp");

  useEffect(() => {
    if (!selectedPreviewUrl) return;
    return () => URL.revokeObjectURL(selectedPreviewUrl);
  }, [selectedPreviewUrl]);

  function clearSelectedQris() {
    setSelectedQris(null);
    setSelectedPreviewUrl(null);
    setSelectedImageFailed(false);
    setQrisFileError(null);
    setFileInputKey((current) => current + 1);
  }

  function selectQris(file: File | null) {
    if (!file) {
      clearSelectedQris();
      return;
    }

    const fileError = validateQrisFile(file);
    setQrisFileError(fileError);
    setSelectedQris(file);
    setSelectedImageFailed(false);

    if (fileError) {
      setSelectedPreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedPreviewUrl(previewUrl);
  }

  async function onSubmit(values: SettingsFormValues) {
    setFeedback(null);

    const fileError = validateQrisFile(selectedQris);
    setQrisFileError(fileError);
    if (fileError) return;

    const formData = new FormData();
    formData.set("websiteName", values.websiteName);
    formData.set("whatsapp", values.whatsapp);
    formData.set("qrisOwnerName", values.qrisOwnerName);
    formData.set("paymentInstruction", values.paymentInstruction);
    formData.set("termsAndConditions", values.termsAndConditions);
    if (selectedQris) formData.set("qrisFile", selectedQris);

    const result: UpdateSettingsResult = await updateSettings(formData);

    if (!result.success) {
      setFeedback({ tone: "error", message: result.message });

      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (!message) continue;
          if (field === "qrisFile") {
            setQrisFileError(message);
          } else {
            setError(field as keyof SettingsFormValues, { message });
          }
        }
      }
      return;
    }

    setCurrentQrisUrl(result.settings.qris_image_url?.trim() ?? "");
    setCurrentImageFailed(false);
    clearSelectedQris();
    reset(toFormValues(result.settings));
    setFeedback({ tone: "success", message: result.message });
    router.refresh();
  }

  const previewUrl = selectedPreviewUrl || currentQrisUrl;
  const previewFailed = selectedPreviewUrl
    ? selectedImageFailed
    : currentImageFailed;

  return (
    <form className="mt-8 space-y-8" noValidate onSubmit={handleSubmit(onSubmit)}>
      {feedback ? (
        <div
          className={cn(
            "flex gap-3 rounded-lg border-3 border-ink p-4 font-semibold shadow-[4px_4px_0_var(--ink)]",
            feedback.tone === "success" ? "bg-emerald-300" : "bg-secondary/30",
          )}
          role={feedback.tone === "success" ? "status" : "alert"}
        >
          {feedback.tone === "success" ? (
            <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          ) : (
            <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          )}
          <p>{feedback.message}</p>
        </div>
      ) : null}

      <section className="brutal-card overflow-hidden bg-surface">
        <header className="flex items-center gap-3 border-b-3 border-ink bg-primary p-5 sm:p-6">
          <Settings2 aria-hidden="true" className="size-7 shrink-0" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Identitas website</h2>
            <p className="mt-1 text-sm font-semibold text-muted">
              Nama publik dan kontak WhatsApp utama MabaTag.
            </p>
          </div>
        </header>

        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
          <div>
            <label className="text-sm font-bold" htmlFor="settings-website-name">
              Nama website
            </label>
            <Input
              {...register("websiteName")}
              aria-invalid={Boolean(errors.websiteName)}
              className="mt-2"
              disabled={isSubmitting}
              id="settings-website-name"
              maxLength={50}
              placeholder="MabaTag"
            />
            <FieldError message={errors.websiteName?.message} />
          </div>

          <div className="min-w-0">
            <label className="text-sm font-bold" htmlFor="settings-whatsapp">
              Nomor WhatsApp admin
            </label>
            <div
              className={cn(
                "mt-2 flex min-w-0 overflow-hidden rounded-lg border-2 border-ink bg-surface",
                "focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-tertiary",
              )}
            >
              <span
                aria-hidden="true"
                className="flex shrink-0 items-center border-r-2 border-ink bg-primary px-3 font-black"
              >
                +62
              </span>
              <input
                {...whatsappField}
                aria-describedby="settings-whatsapp-helper"
                aria-invalid={Boolean(errors.whatsapp)}
                autoComplete="tel-national"
                className="min-h-[2.875rem] min-w-0 flex-1 bg-surface px-3 py-2.5 text-ink outline-none"
                disabled={isSubmitting}
                id="settings-whatsapp"
                inputMode="numeric"
                maxLength={24}
                onChange={(event) => {
                  setValue(
                    "whatsapp",
                    normalizeSettingsWhatsappLocalPart(event.target.value),
                    { shouldDirty: true, shouldValidate: false },
                  );
                  clearErrors("whatsapp");
                }}
                placeholder="81234567890"
                type="tel"
              />
            </div>
            <p
              className="mt-2 text-xs font-semibold text-muted"
              id="settings-whatsapp-helper"
            >
              Masukkan nomor WhatsApp tanpa angka 0 di depan.
            </p>
            <FieldError message={errors.whatsapp?.message} />
          </div>
        </div>
      </section>

      <section className="brutal-card overflow-hidden bg-surface">
        <header className="flex items-center gap-3 border-b-3 border-ink bg-tertiary/35 p-5 sm:p-6">
          <QrCode aria-hidden="true" className="size-7 shrink-0" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Pembayaran QRIS</h2>
            <p className="mt-1 text-sm font-semibold text-muted">
              Atur penerima, gambar QRIS, dan instruksi pembayaran pelanggan.
            </p>
          </div>
        </header>

        <div className="grid min-w-0 gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.72fr)] lg:items-start">
          <div className="min-w-0 space-y-5">
            <div>
              <label className="text-sm font-bold" htmlFor="settings-qris-owner">
                Nama pemilik QRIS
              </label>
              <Input
                {...register("qrisOwnerName")}
                aria-invalid={Boolean(errors.qrisOwnerName)}
                className="mt-2"
                disabled={isSubmitting}
                id="settings-qris-owner"
                maxLength={100}
                placeholder="Nama penerima pembayaran"
              />
              <FieldError message={errors.qrisOwnerName?.message} />
            </div>

            <div>
              <label className="text-sm font-bold" htmlFor="settings-payment-instruction">
                Instruksi pembayaran
              </label>
              <textarea
                {...register("paymentInstruction")}
                aria-invalid={Boolean(errors.paymentInstruction)}
                className="input-base mt-2 min-h-36 resize-y"
                disabled={isSubmitting}
                id="settings-payment-instruction"
                maxLength={1_000}
                placeholder="Scan QRIS, lakukan pembayaran sesuai total pesanan, lalu unggah bukti pembayaran yang jelas."
              />
              <CharacterCount
                current={paymentInstruction.length}
                maximum={1_000}
              />
              <FieldError message={errors.paymentInstruction?.message} />
            </div>
          </div>

          <div className="min-w-0 rounded-lg border-2 border-ink bg-background p-4">
            <p className="text-sm font-bold">
              {selectedQris ? "Preview QRIS baru" : "Preview QRIS saat ini"}
            </p>

            {previewUrl && !previewFailed ? (
              <img
                alt={selectedQris ? "Preview QRIS baru" : "QRIS pembayaran saat ini"}
                className="mt-3 aspect-square w-full rounded-lg border-2 border-ink bg-white object-contain p-3"
                onError={() => {
                  if (selectedPreviewUrl) setSelectedImageFailed(true);
                  else setCurrentImageFailed(true);
                }}
                src={previewUrl}
              />
            ) : (
              <div className="mt-3 flex aspect-square w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink bg-surface p-5 text-center">
                <ImageOff aria-hidden="true" className="size-10" />
                <p className="mt-3 font-bold">QRIS belum dapat ditampilkan</p>
                <p className="mt-1 text-sm font-semibold text-muted">
                  Pilih gambar baru untuk digunakan pelanggan.
                </p>
              </div>
            )}

            <input
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="sr-only"
              disabled={isSubmitting}
              id="settings-qris-file"
              key={fileInputKey}
              onChange={(event) => selectQris(event.target.files?.[0] ?? null)}
              type="file"
            />

            <div className="mt-4 grid gap-3">
              <label
                className={buttonStyles({
                  className: cn("w-full cursor-pointer", isSubmitting && "pointer-events-none opacity-55"),
                })}
                htmlFor="settings-qris-file"
              >
                <Upload aria-hidden="true" className="size-4" />
                {currentQrisUrl && !currentImageFailed
                  ? "Ganti QRIS"
                  : "Upload QRIS"}
              </label>

              {selectedQris ? (
                <Button
                  className="w-full"
                  disabled={isSubmitting}
                  onClick={clearSelectedQris}
                  variant="secondary"
                >
                  <X aria-hidden="true" className="size-4" />
                  Batalkan pilihan
                </Button>
              ) : null}

              {currentQrisUrl && !currentImageFailed ? (
                <a
                  className={buttonStyles({ variant: "secondary", className: "w-full" })}
                  href={currentQrisUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink aria-hidden="true" className="size-4" />
                  Buka gambar
                </a>
              ) : null}
            </div>

            <p className="mt-3 text-xs font-semibold text-muted">
              JPG, PNG, atau WEBP. Maksimal 5 MB.
            </p>
            {selectedQris ? (
              <p className="mt-1 break-all text-xs font-semibold text-muted">
                {selectedQris.name} · {(selectedQris.size / 1024 / 1024).toFixed(2)} MB
              </p>
            ) : null}
            <FieldError message={qrisFileError ?? undefined} />
          </div>
        </div>
      </section>

      <section className="brutal-card overflow-hidden bg-surface">
        <header className="flex items-center gap-3 border-b-3 border-ink bg-emerald-300 p-5 sm:p-6">
          <CircleCheck aria-hidden="true" className="size-7 shrink-0" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Syarat dan ketentuan</h2>
            <p className="mt-1 text-sm font-semibold text-muted">
              Teks persetujuan yang dibaca pelanggan sebelum mengirim pesanan.
            </p>
          </div>
        </header>

        <div className="p-5 sm:p-6">
          <label className="text-sm font-bold" htmlFor="settings-terms">
            Syarat dan ketentuan pelanggan
          </label>
          <textarea
            {...register("termsAndConditions")}
            aria-invalid={Boolean(errors.termsAndConditions)}
            className="input-base mt-2 min-h-48 resize-y whitespace-pre-wrap"
            disabled={isSubmitting}
            id="settings-terms"
            maxLength={3_000}
            placeholder="Pastikan seluruh data yang dikirim sudah benar."
          />
          <CharacterCount current={termsAndConditions.length} maximum={3_000} />
          <FieldError message={errors.termsAndConditions?.message} />
        </div>
      </section>

      <div className="flex justify-end pb-2">
        <Button className="w-full sm:w-auto" disabled={isSubmitting} type="submit">
          {isSubmitting ? (
            <>
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save aria-hidden="true" className="size-4" />
              Simpan pengaturan
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
