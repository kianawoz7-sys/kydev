/* eslint-disable @next/next/no-img-element */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  Download,
  ImagePlus,
  LoaderCircle,
  LockKeyhole,
  QrCode,
  ReceiptText,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useForm,
  useWatch,
  type FieldPath,
  type Resolver,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type AcademicOptions,
  formatFacultyOption,
  formatStudyProgramOption,
} from "@/lib/academic-options";
import {
  ORDER_FILE_MAX_BYTES,
  ORDER_FILE_MIME_TYPES,
} from "@/lib/constants/orders";
import {
  type BuiltInFieldKey,
  type CustomField,
  type FieldStatus,
  type FormConfig,
} from "@/lib/form-config";
import { cn } from "@/lib/utils";
import {
  BUILT_IN_CLIENT_FIELDS,
  createCustomerOrderClientSchema,
  formatWhatsappForReview,
  normalizeWhatsappLocalPart,
  toCanonicalWhatsapp,
  type CustomerOrderClientData,
} from "@/lib/validations/customer-order";

type CustomerOrderFormProps = {
  academicOptions: AcademicOptions;
  service: {
    id: string;
    name: string;
    priceLabel: string;
    requirements: string | null;
    formConfig: FormConfig;
  };
  settings: {
    qrisOwnerName: string | null;
    qrisImageUrl: string | null;
    paymentInstruction: string | null;
    termsAndConditions: string | null;
  };
};

type UploadState = {
  file: File | null;
  previewUrl: string | null;
};

type QrisDownloadFeedback = {
  tone: "success" | "error";
  message: string;
} | null;

type BuiltInInputKey = Exclude<BuiltInFieldKey, "customer_photo">;

const builtInInputs: Array<{
  key: BuiltInInputKey;
  type: "text" | "tel" | "date" | "textarea";
  placeholder?: string;
  autoComplete?: string;
  maximum?: number;
}> = [
  { key: "full_name", type: "text", placeholder: "Nama sesuai identitas", autoComplete: "name" },
  { key: "whatsapp", type: "tel", placeholder: "81234567890", autoComplete: "tel" },
  { key: "faculty", type: "text", placeholder: "Nama fakultas" },
  { key: "major", type: "text", placeholder: "Nama jurusan atau program studi" },
  { key: "nim", type: "text", placeholder: "Nomor induk mahasiswa" },
  { key: "group_name", type: "text", placeholder: "Nama kelompok kegiatan" },
  { key: "birth_place", type: "text", placeholder: "Kota kelahiran" },
  { key: "birth_date", type: "date" },
  { key: "address", type: "textarea", placeholder: "Alamat lengkap", maximum: 1_000 },
  { key: "motto", type: "textarea", placeholder: "Motto yang akan dicantumkan", maximum: 500 },
];

function useUploadPreview() {
  const [state, setState] = useState<UploadState>({ file: null, previewUrl: null });
  const previewRef = useRef<string | null>(null);

  const selectFile = useCallback((file: File | null) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const previewUrl = file ? URL.createObjectURL(file) : null;
    previewRef.current = previewUrl;
    setState({ file, previewUrl });
  }, []);

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  return { ...state, selectFile };
}

function validateSelectedImage(file: File | null, required: boolean) {
  if (!file) return required ? "File gambar wajib dipilih." : null;
  if (!ORDER_FILE_MIME_TYPES.includes(file.type as never)) {
    return "Gunakan gambar JPEG, PNG, atau WebP.";
  }
  if (file.size > ORDER_FILE_MAX_BYTES) return "Ukuran gambar maksimal 5 MB.";
  return null;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm font-bold text-red-700">{message}</p>;
}

function FieldLabel({ label, status }: { label: string; status: FieldStatus }) {
  return (
    <span className="text-sm font-bold">
      {label}
      {status === "optional" ? (
        <span className="ml-1 font-semibold text-muted">(opsional)</span>
      ) : null}
    </span>
  );
}

function ImageUpload({
  id,
  label,
  status,
  helper,
  state,
  error,
  onChange,
}: {
  id: string;
  label: string;
  status: FieldStatus;
  helper: string;
  state: UploadState;
  error: string | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <label htmlFor={id}>
        <FieldLabel label={label} status={status} />
      </label>
      <div className="mt-2 rounded-lg border-2 border-dashed border-ink bg-background p-4">
        {state.previewUrl ? (
          <img
            alt={`Pratinjau ${label.toLowerCase()}`}
            className="mx-auto max-h-72 w-full rounded-md border-2 border-ink bg-surface object-contain"
            src={state.previewUrl}
          />
        ) : (
          <div className="flex min-h-36 flex-col items-center justify-center text-center">
            <ImagePlus aria-hidden="true" className="size-9" />
            <p className="mt-2 text-sm font-semibold text-muted">{helper}</p>
          </div>
        )}
        <label className="button-base button-secondary mt-3 w-full cursor-pointer" htmlFor={id}>
          <Upload aria-hidden="true" className="size-4" />
          {state.file ? "Ganti gambar" : "Pilih gambar"}
        </label>
        <input
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="sr-only"
          id={id}
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          type="file"
        />
        {state.file ? (
          <p className="mt-2 break-all text-xs font-semibold text-muted">
            {state.file.name} · {(state.file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        ) : null}
      </div>
      <FieldError message={error ?? undefined} />
    </div>
  );
}

function Progress({ current }: { current: 1 | 2 }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Tahap pemesanan">
      {["Isi data", "Pembayaran", "Selesai"].map((label, index) => {
        const number = index + 1;
        const active = number <= current;
        return (
          <li className="min-w-0 text-center" key={label}>
            <span
              className={cn(
                "mx-auto flex size-9 items-center justify-center rounded-full border-2 border-ink font-black",
                active ? "bg-primary shadow-[2px_2px_0_var(--ink)]" : "bg-surface",
              )}
            >
              {number < current ? <Check aria-hidden="true" className="size-4" /> : number}
            </span>
            <span className="mt-2 block truncate text-xs font-bold sm:text-sm">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function customInputType(field: CustomField) {
  return field.type === "number" ? "number" : "text";
}

function qrisFileExtension(blob: Blob, imageUrl: string) {
  const mimeExtensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const mimeExtension = mimeExtensions[blob.type.toLowerCase()];
  if (mimeExtension) return mimeExtension;

  try {
    const extension = new URL(imageUrl).pathname.match(/\.(jpe?g|png|webp)$/i)?.[1];
    if (extension) return extension.toLowerCase() === "jpeg" ? "jpg" : extension.toLowerCase();
  } catch {
    // The image URL is already validated by the browser when rendered.
  }

  return "jpg";
}

export function CustomerOrderForm({
  academicOptions,
  service,
  settings,
}: CustomerOrderFormProps) {
  const router = useRouter();
  const config = service.formConfig;
  const schema = useMemo(
    () => createCustomerOrderClientSchema(config, academicOptions),
    [academicOptions, config],
  );
  const [phase, setPhase] = useState<"details" | "review" | "payment">("details");
  const photo = useUploadPreview();
  const proof = useUploadPreview();
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [qrisFailed, setQrisFailed] = useState(false);
  const [isDownloadingQris, setIsDownloadingQris] = useState(false);
  const [qrisDownloadFeedback, setQrisDownloadFeedback] =
    useState<QrisDownloadFeedback>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const qrisAvailable = Boolean(settings.qrisImageUrl?.trim()) && !qrisFailed;
  const photoConfig = config.customer_photo;

  const defaultExtraData = Object.fromEntries(
    config.custom_fields
      .filter((field) => field.status !== "hidden")
      .map((field) => [field.id, ""]),
  );

  const {
    register,
    trigger,
    getValues,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CustomerOrderClientData>({
    resolver: zodResolver(schema) as Resolver<CustomerOrderClientData>,
    defaultValues: {
      serviceId: service.id,
      fullName: "",
      whatsapp: "",
      faculty: "",
      major: "",
      nim: "",
      groupName: "",
      birthPlace: "",
      birthDate: "",
      address: "",
      motto: "",
      termsAccepted: false,
      extraData: defaultExtraData,
    },
  });

  const selectedFacultyId = useWatch({ control, name: "faculty" });
  const filteredStudyPrograms = useMemo(
    () =>
      academicOptions.studyPrograms.filter(
        (program) => String(program.faculty_id) === selectedFacultyId,
      ),
    [academicOptions.studyPrograms, selectedFacultyId],
  );

  const detailFieldPaths = useMemo(() => {
    const paths: FieldPath<CustomerOrderClientData>[] = ["serviceId"];
    for (const input of builtInInputs) {
      if (config[input.key].status !== "hidden") {
        paths.push(BUILT_IN_CLIENT_FIELDS[input.key]);
      }
    }
    for (const field of config.custom_fields) {
      if (field.status !== "hidden") {
        paths.push(`extraData.${field.id}` as FieldPath<CustomerOrderClientData>);
      }
    }
    return paths;
  }, [config]);

  useEffect(() => {
    const protectForm = (event: BeforeUnloadEvent) => {
      if ((isDirty || photo.file || proof.file) && !isSubmitting) event.preventDefault();
    };
    window.addEventListener("beforeunload", protectForm);
    return () => window.removeEventListener("beforeunload", protectForm);
  }, [isDirty, isSubmitting, photo.file, proof.file]);

  async function showReview() {
    const validFields = await trigger(detailFieldPaths);
    const imageError =
      photoConfig.status === "hidden"
        ? null
        : validateSelectedImage(photo.file, photoConfig.status === "required");
    setPhotoError(imageError);

    if (validFields && !imageError) {
      setPhase("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function selectPhoto(file: File | null) {
    photo.selectFile(file);
    setPhotoError(
      validateSelectedImage(file, photoConfig.status === "required"),
    );
  }

  function selectProof(file: File | null) {
    proof.selectFile(file);
    setProofError(validateSelectedImage(file, true));
  }

  async function downloadQris() {
    const imageUrl = settings.qrisImageUrl?.trim();
    if (!imageUrl || isDownloadingQris) return;

    setIsDownloadingQris(true);
    setQrisDownloadFeedback(null);

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("QRIS download failed");

      const blob = await response.blob();
      if (blob.size === 0) throw new Error("QRIS image is empty");

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `QRIS-MabaTag.${qrisFileExtension(blob, imageUrl)}`;
      document.body.append(anchor);
      try {
        anchor.click();
      } finally {
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
      }
      setQrisDownloadFeedback({
        tone: "success",
        message: "QRIS berhasil diunduh.",
      });
    } catch {
      const fallbackLink = document.createElement("a");
      fallbackLink.href = imageUrl;
      fallbackLink.target = "_blank";
      fallbackLink.rel = "noopener noreferrer";
      document.body.append(fallbackLink);
      try {
        fallbackLink.click();
      } finally {
        fallbackLink.remove();
      }
      setQrisDownloadFeedback({
        tone: "error",
        message:
          "Unduhan otomatis gagal. Gambar QRIS dibuka di tab baru agar dapat disimpan.",
      });
    } finally {
      setIsDownloadingQris(false);
    }
  }

  const submitOrder = handleSubmit(async (values) => {
    const paymentFileError = validateSelectedImage(proof.file, true);
    const customerPhotoError =
      photoConfig.status === "hidden"
        ? null
        : validateSelectedImage(photo.file, photoConfig.status === "required");
    setProofError(paymentFileError);
    setPhotoError(customerPhotoError);
    setSubmitError(null);

    if (!proof.file || paymentFileError || customerPhotoError || !qrisAvailable) return;

    const formData = new FormData();
    formData.set("serviceId", values.serviceId);
    formData.set("fullName", values.fullName);
    formData.set("whatsapp", toCanonicalWhatsapp(values.whatsapp));
    for (const input of builtInInputs) {
      if (input.key === "full_name" || input.key === "whatsapp") continue;
      if (config[input.key].status === "hidden") continue;
      formData.set(BUILT_IN_CLIENT_FIELDS[input.key], String(values[BUILT_IN_CLIENT_FIELDS[input.key]] ?? ""));
    }
    const visibleExtraValues = Object.fromEntries(
      config.custom_fields
        .filter((field) => field.status !== "hidden")
        .map((field) => [field.id, values.extraData[field.id] ?? ""]),
    );
    formData.set("extraData", JSON.stringify(visibleExtraValues));
    formData.set("termsAccepted", String(values.termsAccepted));
    if (photoConfig.status !== "hidden" && photo.file) {
      formData.set("customerPhoto", photo.file);
    }
    formData.set("paymentProof", proof.file);

    const timers = [
      window.setTimeout(() => setSubmissionMessage("Mengunggah bukti pembayaran..."), 900),
      window.setTimeout(() => setSubmissionMessage("Menyimpan pesanan..."), 1_800),
    ];
    setSubmissionMessage(
      photo.file ? "Mengunggah foto pelanggan..." : "Menyiapkan pesanan...",
    );

    try {
      const response = await fetch("/api/orders", { method: "POST", body: formData });
      const result = (await response.json()) as {
        success: boolean;
        message?: string;
        orderCode?: string;
      };
      if (!response.ok || !result.success || !result.orderCode) {
        throw new Error(result.message || "Pesanan belum dapat dikirim.");
      }
      setSubmissionMessage("Pesanan berhasil disimpan.");
      router.push(`/pesanan/berhasil?kode=${encodeURIComponent(result.orderCode)}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Pesanan belum dapat dikirim. Silakan coba kembali.",
      );
      setSubmissionMessage("");
    } finally {
      timers.forEach(window.clearTimeout);
    }
  });

  const values = getValues();
  const reviewProgram = academicOptions.studyPrograms.find(
    (program) => String(program.id) === values.major,
  );
  const reviewFaculty = academicOptions.faculties.find(
    (faculty) =>
      String(faculty.id) === values.faculty ||
      faculty.id === reviewProgram?.faculty_id,
  );
  const academicReviewItems = [
    config.faculty.status !== "hidden" ||
    (config.major.status !== "hidden" && reviewProgram)
      ? {
          label: config.faculty.label,
          value: reviewFaculty ? formatFacultyOption(reviewFaculty) : "",
        }
      : null,
    config.major.status !== "hidden"
      ? {
          label: config.major.label,
          value: reviewProgram ? formatStudyProgramOption(reviewProgram) : "",
        }
      : null,
  ].filter((item): item is { label: string; value: string } =>
    Boolean(item?.value),
  );
  const reviewItems = [
    { label: "Jasa", value: service.name },
    { label: "Total pembayaran", value: service.priceLabel },
    ...builtInInputs
      .filter(
        (input) =>
          input.key !== "faculty" &&
          input.key !== "major" &&
          config[input.key].status !== "hidden",
      )
      .map((input) => ({
        label: config[input.key].label,
        value:
          input.key === "whatsapp"
            ? formatWhatsappForReview(values.whatsapp)
            : String(values[BUILT_IN_CLIENT_FIELDS[input.key]] ?? "").trim(),
      }))
      .filter((item) => item.value),
    ...academicReviewItems,
    ...config.custom_fields
      .filter((field) => field.status !== "hidden")
      .map((field) => ({ label: field.label, value: values.extraData[field.id]?.trim() ?? "" }))
      .filter((item) => item.value),
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mx-auto max-w-xl">
        <Progress current={phase === "payment" ? 2 : 1} />
      </div>

      <div className="brutal-card mt-8 overflow-hidden bg-surface">
        <header className="border-b-3 border-ink bg-primary p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.14em]">Pesan {service.name}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            {phase === "payment"
              ? "Pembayaran QRIS"
              : phase === "review"
                ? "Periksa data pesanan"
                : "Isi data pemesan"}
          </h1>
          <p className="mt-2 font-semibold text-muted">Total pembayaran: {service.priceLabel}</p>
        </header>

        <form className="p-5 sm:p-7" onSubmit={submitOrder}>
          {phase === "details" ? (
            <div className="space-y-7">
              <input type="hidden" {...register("serviceId")} />
              <div className="grid gap-5 sm:grid-cols-2">
                {builtInInputs.map((input) => {
                  const fieldConfig = config[input.key];
                  if (fieldConfig.status === "hidden") return null;
                  const formName = BUILT_IN_CLIENT_FIELDS[input.key];
                  const error = errors[formName]?.message;

                  if (input.type === "textarea") {
                    return (
                      <label className="block sm:col-span-2" key={input.key}>
                        <FieldLabel label={fieldConfig.label} status={fieldConfig.status} />
                        <textarea
                          className="input-base mt-2 min-h-28 resize-y"
                          maxLength={input.maximum}
                          placeholder={input.placeholder}
                          {...register(formName)}
                        />
                        <FieldError message={error} />
                      </label>
                    );
                  }

                  if (input.key === "faculty") {
                    const facultyField = register("faculty");

                    return (
                      <label className="block" key={input.key}>
                        <FieldLabel label={fieldConfig.label} status={fieldConfig.status} />
                        <select
                          {...facultyField}
                          aria-invalid={Boolean(error)}
                          className="input-base mt-2"
                          onChange={(event) => {
                            facultyField.onChange(event);
                            setValue("major", "", {
                              shouldDirty: true,
                              shouldValidate: false,
                            });
                          }}
                        >
                          <option value="">
                            {fieldConfig.status === "optional"
                              ? "Pilih fakultas (opsional)"
                              : "Pilih fakultas"}
                          </option>
                          {academicOptions.faculties.map((faculty) => (
                            <option key={faculty.id} value={String(faculty.id)}>
                              {formatFacultyOption(faculty)}
                            </option>
                          ))}
                        </select>
                        <FieldError message={error} />
                      </label>
                    );
                  }

                  if (input.key === "major") {
                    const majorField = register("major");
                    const facultyVisible = config.faculty.status !== "hidden";
                    const majorDisabled = facultyVisible && !selectedFacultyId;

                    return (
                      <label className="block" key={input.key}>
                        <FieldLabel label={fieldConfig.label} status={fieldConfig.status} />
                        <select
                          {...majorField}
                          aria-invalid={Boolean(error)}
                          className="input-base mt-2 disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-muted"
                          disabled={majorDisabled}
                          onChange={(event) => {
                            majorField.onChange(event);

                            if (!facultyVisible) {
                              const program = academicOptions.studyPrograms.find(
                                (item) => String(item.id) === event.target.value,
                              );
                              setValue(
                                "faculty",
                                program ? String(program.faculty_id) : "",
                                {
                                  shouldDirty: true,
                                  shouldValidate: false,
                                },
                              );
                            }
                          }}
                        >
                          <option value="">
                            {majorDisabled
                              ? "Pilih fakultas terlebih dahulu"
                              : fieldConfig.status === "optional"
                                ? "Pilih program studi (opsional)"
                                : "Pilih program studi"}
                          </option>
                          {facultyVisible
                            ? filteredStudyPrograms.map((program) => (
                                <option
                                  key={program.id}
                                  value={String(program.id)}
                                >
                                  {formatStudyProgramOption(program)}
                                </option>
                              ))
                            : academicOptions.faculties.map((faculty) => {
                                const programs = academicOptions.studyPrograms.filter(
                                  (program) => program.faculty_id === faculty.id,
                                );
                                if (programs.length === 0) return null;

                                return (
                                  <optgroup key={faculty.id} label={faculty.name}>
                                    {programs.map((program) => (
                                      <option
                                        key={program.id}
                                        value={String(program.id)}
                                      >
                                        {formatStudyProgramOption(program)}
                                      </option>
                                    ))}
                                  </optgroup>
                                );
                              })}
                        </select>
                        <FieldError message={error} />
                      </label>
                    );
                  }

                  if (input.key === "whatsapp") {
                    const whatsappField = register("whatsapp");

                    return (
                      <label className="block" key={input.key}>
                        <FieldLabel label={fieldConfig.label} status={fieldConfig.status} />
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
                            aria-describedby={
                              error
                                ? "order-whatsapp-helper order-whatsapp-error"
                                : "order-whatsapp-helper"
                            }
                            aria-invalid={Boolean(error)}
                            aria-label="Nomor WhatsApp setelah kode negara +62"
                            autoComplete="tel-national"
                            className="min-h-[2.875rem] min-w-0 flex-1 bg-surface px-3 py-2.5 text-ink outline-none"
                            inputMode="numeric"
                            maxLength={24}
                            onChange={(event) => {
                              event.target.value = normalizeWhatsappLocalPart(
                                event.target.value,
                              ).slice(0, 12);
                              whatsappField.onChange(event);
                            }}
                            pattern="[0-9]*"
                            placeholder="81234567890"
                            type="tel"
                          />
                        </div>
                        <p
                          className="mt-1 text-xs font-semibold text-muted"
                          id="order-whatsapp-helper"
                        >
                          Masukkan nomor WhatsApp tanpa angka 0 di depan.
                        </p>
                        {error ? (
                          <p
                            className="mt-1 text-sm font-bold text-red-700"
                            id="order-whatsapp-error"
                          >
                            {error}
                          </p>
                        ) : null}
                      </label>
                    );
                  }

                  return (
                    <label className="block" key={input.key}>
                      <FieldLabel label={fieldConfig.label} status={fieldConfig.status} />
                      <Input
                        aria-invalid={Boolean(error)}
                        autoComplete={input.autoComplete}
                        className="mt-2"
                        inputMode={input.type === "tel" ? "tel" : undefined}
                        placeholder={input.placeholder}
                        type={input.type}
                        {...register(formName)}
                      />
                      <FieldError message={error} />
                    </label>
                  );
                })}
              </div>

              {config.custom_fields.some((field) => field.status !== "hidden") ? (
                <section className="rounded-lg border-2 border-ink bg-tertiary/15 p-4 sm:p-5">
                  <h2 className="text-xl font-black">Data tambahan</h2>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    {config.custom_fields.map((field) => {
                      if (field.status === "hidden") return null;
                      const path = `extraData.${field.id}` as const;
                      const error = errors.extraData?.[field.id]?.message;

                      if (field.type === "textarea") {
                        return (
                          <label className="block sm:col-span-2" key={field.id}>
                            <FieldLabel label={field.label} status={field.status} />
                            <textarea
                              className="input-base mt-2 min-h-28 resize-y"
                              maxLength={2_000}
                              {...register(path)}
                            />
                            <FieldError message={error} />
                          </label>
                        );
                      }

                      if (field.type === "select") {
                        return (
                          <label className="block" key={field.id}>
                            <FieldLabel label={field.label} status={field.status} />
                            <select className="input-base mt-2" {...register(path)}>
                              <option value="">Pilih {field.label.toLowerCase()}</option>
                              {field.options.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            <FieldError message={error} />
                          </label>
                        );
                      }

                      return (
                        <label className="block" key={field.id}>
                          <FieldLabel label={field.label} status={field.status} />
                          <Input
                            className="mt-2"
                            inputMode={field.type === "number" ? "decimal" : undefined}
                            type={customInputType(field)}
                            {...register(path)}
                          />
                          <FieldError message={error} />
                        </label>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {photoConfig.status !== "hidden" ? (
                <div className="space-y-4">
                  <div className="rounded-lg border-2 border-ink bg-tertiary/20 p-4">
                    <p className="font-bold">Persyaratan foto</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-semibold text-muted">
                      {service.requirements?.trim() ||
                        "Gunakan foto yang jelas dan sesuai kebutuhan name tag."}
                    </p>
                  </div>
                  <ImageUpload
                    error={photoError}
                    helper="JPEG, PNG, atau WebP · maksimal 5 MB"
                    id="customer-photo"
                    label={photoConfig.label}
                    onChange={selectPhoto}
                    state={photo}
                    status={photoConfig.status}
                  />
                </div>
              ) : null}

              <Button className="w-full sm:w-auto" onClick={showReview}>
                Periksa data
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            </div>
          ) : null}

          {phase === "review" ? (
            <div>
              <div className="grid gap-4 sm:grid-cols-2">
                {reviewItems.map((item) => (
                  <dl className="rounded-lg border-2 border-ink bg-background p-4" key={item.label}>
                    <dt className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{item.label}</dt>
                    <dd className="mt-1 break-words font-bold">{item.value}</dd>
                  </dl>
                ))}
              </div>
              {photo.previewUrl ? (
                <div className="mt-4 rounded-lg border-2 border-ink bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{photoConfig.label}</p>
                  <img
                    alt={`Pratinjau ${photoConfig.label.toLowerCase()}`}
                    className="mt-3 max-h-72 w-full rounded-md border-2 border-ink bg-surface object-contain"
                    src={photo.previewUrl}
                  />
                </div>
              ) : null}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button onClick={() => setPhase("details")} variant="secondary">
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  Edit data
                </Button>
                <Button onClick={() => setPhase("payment")}>
                  Lanjut ke pembayaran
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}

          {phase === "payment" ? (
            <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <section className="rounded-lg border-3 border-ink bg-background p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <QrCode aria-hidden="true" className="size-6" />
                  <h2 className="text-xl font-black">Pindai QRIS</h2>
                </div>
                {settings.qrisImageUrl?.trim() && !qrisFailed ? (
                  <div>
                    <img
                      alt="QRIS pembayaran MabaTag"
                      className="mt-4 aspect-square w-full rounded-lg border-2 border-ink bg-white object-contain p-2"
                      onError={() => setQrisFailed(true)}
                      src={settings.qrisImageUrl}
                    />
                    <Button
                      className="mt-3 w-full"
                      disabled={isDownloadingQris}
                      onClick={() => void downloadQris()}
                      variant="secondary"
                    >
                      {isDownloadingQris ? (
                        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                      ) : (
                        <Download aria-hidden="true" className="size-4" />
                      )}
                      {isDownloadingQris ? "Mengunduh QRIS..." : "Unduh QRIS"}
                    </Button>
                    {qrisDownloadFeedback ? (
                      <p
                        className={cn(
                          "mt-3 rounded-lg border-2 border-ink p-3 text-sm font-bold",
                          qrisDownloadFeedback.tone === "success"
                            ? "bg-emerald-300/60"
                            : "bg-secondary/30",
                        )}
                        role={
                          qrisDownloadFeedback.tone === "error"
                            ? "alert"
                            : "status"
                        }
                      >
                        {qrisDownloadFeedback.message}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-4 flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-ink bg-secondary/20 p-5 text-center">
                    <div>
                      <CircleAlert aria-hidden="true" className="mx-auto size-9" />
                      <p className="mt-3 font-bold">QRIS belum tersedia</p>
                      <p className="mt-1 text-sm text-muted">Hubungi admin sebelum melanjutkan pembayaran.</p>
                    </div>
                  </div>
                )}
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="font-semibold text-muted">Pemilik QRIS</dt>
                    <dd className="font-black">{settings.qrisOwnerName?.trim() || "Belum dicantumkan"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-muted">Total pembayaran</dt>
                    <dd className="text-2xl font-black">{service.priceLabel}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-muted">Jasa</dt>
                    <dd className="font-black">{service.name}</dd>
                  </div>
                </dl>
                <p className="mt-4 whitespace-pre-wrap rounded-lg border-2 border-ink bg-primary p-3 text-sm font-semibold">
                  {settings.paymentInstruction?.trim() ||
                    "Bayar sesuai total, lalu unggah bukti pembayaran yang jelas."}
                </p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <ReceiptText aria-hidden="true" className="size-6" />
                  <h2 className="text-xl font-black">Konfirmasi pembayaran</h2>
                </div>
                <p className="rounded-lg border-2 border-ink bg-secondary/20 p-3 text-sm font-bold">
                  Pastikan nominal dan penerima QRIS sudah benar sebelum mengunggah bukti.
                </p>
                <ImageUpload
                  error={proofError}
                  helper="Unggah tangkapan layar pembayaran · maksimal 5 MB"
                  id="payment-proof"
                  label="Bukti pembayaran"
                  onChange={selectProof}
                  state={proof}
                  status="required"
                />

                <div>
                  <p className="text-sm font-bold">Syarat dan ketentuan</p>
                  <div className="mt-2 max-h-44 overflow-y-auto whitespace-pre-wrap rounded-lg border-2 border-ink bg-background p-3 text-sm text-muted">
                    {settings.termsAndConditions?.trim() ||
                      "Data yang dikirim akan digunakan untuk memproses pesanan MabaTag. Pastikan seluruh data dan pembayaran sudah benar."}
                  </div>
                  <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-lg border-2 border-ink bg-primary/45 p-3 font-semibold">
                    <input
                      className="mt-1 size-5 shrink-0 accent-black"
                      type="checkbox"
                      {...register("termsAccepted")}
                    />
                    <span>Saya menyetujui syarat dan ketentuan di atas.</span>
                  </label>
                  <FieldError message={errors.termsAccepted?.message} />
                </div>

                {submitError ? (
                  <p className="rounded-lg border-2 border-ink bg-secondary/30 p-3 text-sm font-bold" role="alert">
                    {submitError}
                  </p>
                ) : null}
                {isSubmitting ? (
                  <p className="flex items-center gap-2 rounded-lg border-2 border-ink bg-tertiary/25 p-3 text-sm font-bold" role="status">
                    <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
                    {submissionMessage || "Memproses pesanan..."}
                  </p>
                ) : null}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button disabled={isSubmitting} onClick={() => setPhase("review")} variant="secondary">
                    <ArrowLeft aria-hidden="true" className="size-4" />
                    Kembali
                  </Button>
                  <Button disabled={!qrisAvailable || isSubmitting} type="submit">
                    {isSubmitting ? (
                      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                    ) : (
                      <LockKeyhole aria-hidden="true" className="size-4" />
                    )}
                    {isSubmitting ? "Mengirim..." : "Kirim pesanan"}
                  </Button>
                </div>
              </section>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
