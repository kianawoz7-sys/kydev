"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarClock,
  CircleAlert,
  CircleCheck,
  Edit3,
  LoaderCircle,
  Plus,
  Power,
  Save,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  createService,
  deleteService,
  toggleService,
  updateService,
} from "@/app/admin/services/actions";
import { ServiceFormConfigEditor } from "@/components/admin/service-form-config-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeFormConfig } from "@/lib/form-config";
import { cn } from "@/lib/utils";
import {
  serviceFormSchema,
  type ServiceFormValues,
} from "@/lib/validations/services";
import type { Service } from "@/types/database";

type ServicesManagerProps = {
  initialServices: Service[];
};

type FormState =
  | { mode: "create"; service: null }
  | { mode: "edit"; service: Service }
  | null;

type Feedback = {
  tone: "success" | "error";
  message: string;
} | null;

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
});

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string, withTime = false) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";
  return withTime ? dateTimeFormatter.format(date) : dateFormatter.format(date);
}

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const pad = (part: number) => part.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getDefaultValues(service: Service | null): ServiceFormValues {
  return {
    name: service?.name ?? "",
    slug: service?.slug ?? "",
    description: service?.description ?? "",
    price: service?.price ?? 0,
    quota: service?.quota ?? null,
    deadline: toDateTimeLocal(service?.deadline ?? null),
    imageUrl: service?.image_url ?? "",
    requirements: service?.requirements ?? "",
    isActive: service?.is_active ?? true,
    formConfig: normalizeFormConfig(service?.form_config),
  };
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-2 text-sm font-semibold text-secondary" role="alert">
      {message}
    </p>
  ) : null;
}

function ServiceFormPanel({
  mode,
  service,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  service: Service | null;
  onClose: () => void;
  onSaved: (service: Service, message: string) => void;
}) {
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [formConfig, setFormConfig] = useState(() =>
    normalizeFormConfig(service?.form_config),
  );
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: getDefaultValues(service),
  });

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) onClose();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isSubmitting, onClose]);

  const nameRegistration = register("name");
  const slugRegistration = register("slug");

  async function onSubmit(values: ServiceFormValues) {
    setFormFeedback(null);
    const validated = serviceFormSchema.safeParse({
      ...values,
      formConfig,
    });

    if (!validated.success) {
      setFormFeedback(
        validated.error.issues[0]?.message ??
          "Periksa kembali pengaturan form pembeli.",
      );
      return;
    }

    const result =
      mode === "create"
        ? await createService(validated.data)
        : await updateService(service!.id, validated.data);

    if (!result.success) {
      setFormFeedback(result.message);

      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(
          result.fieldErrors,
        ) as [keyof ServiceFormValues, string][]) {
          setError(field, { message });
        }
      }
      return;
    }

    onSaved(result.service, result.message);
  }

  return (
    <div
      aria-label={mode === "create" ? "Tambah jasa" : `Edit jasa ${service?.name}`}
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-ink/55 p-2 sm:p-4"
      role="dialog"
    >
      <div className="h-full w-full max-w-2xl overflow-y-auto rounded-lg border-3 border-ink bg-surface shadow-[-5px_5px_0_var(--ink)]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b-3 border-ink bg-primary p-4 sm:p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em]">
              Pengelolaan jasa
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              {mode === "create" ? "Tambah Jasa" : "Edit Jasa"}
            </h2>
          </div>
          <Button
            aria-label="Tutup form jasa"
            disabled={isSubmitting}
            onClick={onClose}
            variant="secondary"
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
        </div>

        <form
          className="space-y-5 p-4 sm:p-6"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {formFeedback ? (
            <div
              className="flex gap-3 rounded-lg border-2 border-ink bg-secondary/25 p-3 text-sm font-semibold"
              role="alert"
            >
              <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <p>{formFeedback}</p>
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-bold" htmlFor="service-name">
                Nama jasa
              </label>
              <Input
                {...nameRegistration}
                aria-invalid={Boolean(errors.name)}
                className="mt-2"
                disabled={isSubmitting}
                id="service-name"
                onChange={(event) => {
                  void nameRegistration.onChange(event);
                  if (!slugEdited) {
                    setValue("slug", slugify(event.target.value), {
                      shouldDirty: true,
                      shouldValidate: Boolean(errors.slug),
                    });
                  }
                }}
                placeholder="Name Tag PKKMB 2026"
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div>
              <label className="text-sm font-bold" htmlFor="service-slug">
                Slug
              </label>
              <Input
                {...slugRegistration}
                aria-invalid={Boolean(errors.slug)}
                className="mt-2"
                disabled={isSubmitting}
                id="service-slug"
                onChange={(event) => {
                  setSlugEdited(true);
                  void slugRegistration.onChange(event);
                }}
                placeholder="name-tag-pkkmb-2026"
              />
              <FieldError message={errors.slug?.message} />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="service-description">
              Deskripsi <span className="font-normal text-muted">(opsional)</span>
            </label>
            <textarea
              {...register("description")}
              className="input-base mt-2 min-h-28 resize-y"
              disabled={isSubmitting}
              id="service-description"
              placeholder="Jelaskan layanan secara singkat."
            />
            <FieldError message={errors.description?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-bold" htmlFor="service-price">
                Harga
              </label>
              <Input
                {...register("price", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.price)}
                className="mt-2"
                disabled={isSubmitting}
                id="service-price"
                min="0"
                placeholder="25000"
                step="1"
                type="number"
              />
              <FieldError message={errors.price?.message} />
            </div>

            <div>
              <label className="text-sm font-bold" htmlFor="service-quota">
                Kuota <span className="font-normal text-muted">(opsional)</span>
              </label>
              <Input
                {...register("quota", {
                  setValueAs: (value) =>
                    value === "" || value == null ? null : Number(value),
                })}
                aria-invalid={Boolean(errors.quota)}
                className="mt-2"
                disabled={isSubmitting}
                id="service-quota"
                min="1"
                placeholder="Tanpa batas"
                step="1"
                type="number"
              />
              <FieldError message={errors.quota?.message} />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="service-deadline">
              Deadline <span className="font-normal text-muted">(opsional)</span>
            </label>
            <Input
              {...register("deadline")}
              aria-invalid={Boolean(errors.deadline)}
              className="mt-2"
              disabled={isSubmitting}
              id="service-deadline"
              type="datetime-local"
            />
            <FieldError message={errors.deadline?.message} />
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="service-image-url">
              Image URL <span className="font-normal text-muted">(opsional)</span>
            </label>
            <Input
              {...register("imageUrl")}
              aria-invalid={Boolean(errors.imageUrl)}
              className="mt-2"
              disabled={isSubmitting}
              id="service-image-url"
              placeholder="https://contoh.id/gambar.jpg"
              type="text"
            />
            <FieldError message={errors.imageUrl?.message} />
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="service-requirements">
              Persyaratan <span className="font-normal text-muted">(opsional)</span>
            </label>
            <textarea
              {...register("requirements")}
              className="input-base mt-2 min-h-32 resize-y"
              disabled={isSubmitting}
              id="service-requirements"
              placeholder="Tuliskan ketentuan data dan foto."
            />
            <FieldError message={errors.requirements?.message} />
          </div>

          <ServiceFormConfigEditor
            disabled={isSubmitting}
            onChange={setFormConfig}
            value={formConfig}
          />

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-ink bg-background p-4">
            <input
              {...register("isActive")}
              className="mt-1 size-5 accent-[var(--primary)]"
              disabled={isSubmitting}
              type="checkbox"
            />
            <span>
              <span className="block font-bold">Jasa aktif</span>
              <span className="mt-1 block text-sm text-muted">
                Jasa aktif dapat ditampilkan pada halaman publik pada tahap berikutnya.
              </span>
            </span>
          </label>

          <div className="grid gap-3 border-t-2 border-ink/15 pt-5 sm:grid-cols-2">
            <Button disabled={isSubmitting} onClick={onClose} variant="secondary">
              Batal
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save aria-hidden="true" className="size-4" />
                  Simpan jasa
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-bold",
        isActive ? "bg-emerald-300" : "bg-secondary/45",
      )}
    >
      {isActive ? (
        <CircleCheck aria-hidden="true" className="size-3.5" />
      ) : (
        <Power aria-hidden="true" className="size-3.5" />
      )}
      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}

export function ServicesManager({ initialServices }: ServicesManagerProps) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [formState, setFormState] = useState<FormState>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 4_500);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  function handleSaved(service: Service, message: string) {
    setServices((current) => {
      const exists = current.some((item) => item.id === service.id);
      return exists
        ? current.map((item) => (item.id === service.id ? service : item))
        : [service, ...current];
    });
    setFormState(null);
    setFeedback({ tone: "success", message });
    router.refresh();
  }

  async function handleToggle(service: Service) {
    const nextActive = !service.is_active;

    if (
      !nextActive &&
      !window.confirm(
        `Nonaktifkan jasa “${service.name}”? Jasa tetap tersimpan di dashboard.`,
      )
    ) {
      return;
    }

    setBusyAction(`toggle:${service.id}`);
    setFeedback(null);
    const result = await toggleService({ id: service.id, isActive: nextActive });

    if (result.success) {
      setServices((current) =>
        current.map((item) => (item.id === result.service.id ? result.service : item)),
      );
      setFeedback({ tone: "success", message: result.message });
      router.refresh();
    } else {
      setFeedback({ tone: "error", message: result.message });
    }

    setBusyAction(null);
  }

  async function handleDelete(service: Service) {
    if (
      !window.confirm(
        `Hapus jasa “${service.name}”? Jasa yang sudah memiliki pesanan tidak akan dapat dihapus.`,
      )
    ) {
      return;
    }

    setBusyAction(`delete:${service.id}`);
    setFeedback(null);
    const result = await deleteService(service.id);

    if (result.success) {
      setServices((current) => current.filter((item) => item.id !== service.id));
      setFeedback({ tone: "success", message: result.message });
      router.refresh();
    } else {
      setFeedback({ tone: "error", message: result.message });
    }

    setBusyAction(null);
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">
            Area kerja
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Kelola Jasa
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            Atur layanan, harga, kuota, deadline, dan ketersediaan jasa MabaTag.
          </p>
        </div>
        <Button onClick={() => setFormState({ mode: "create", service: null })}>
          <Plus aria-hidden="true" className="size-4" />
          Tambah Jasa
        </Button>
      </div>

      {feedback ? (
        <div
          className={cn(
            "fixed bottom-5 right-5 z-50 flex max-w-sm gap-3 rounded-lg border-3 border-ink p-4 font-semibold shadow-[4px_4px_0_var(--ink)]",
            feedback.tone === "success" ? "bg-emerald-300" : "bg-secondary/35",
          )}
          role="status"
        >
          {feedback.tone === "success" ? (
            <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          ) : (
            <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          )}
          <p>{feedback.message}</p>
        </div>
      ) : null}

      <section className="brutal-card mt-8 overflow-hidden bg-surface">
        <div className="flex items-center justify-between gap-3 border-b-3 border-ink bg-tertiary/35 p-5 sm:p-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Daftar jasa</h2>
            <p className="mt-1 text-sm font-semibold text-muted">
              {services.length} jasa tersimpan, termasuk jasa nonaktif.
            </p>
          </div>
          <Wrench aria-hidden="true" className="size-7 shrink-0" />
        </div>

        {services.length === 0 ? (
          <div className="px-5 py-16 text-center sm:px-8">
            <Wrench aria-hidden="true" className="mx-auto size-12" />
            <h3 className="mt-4 text-2xl font-bold">Belum ada jasa</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Tambahkan jasa pertama untuk mulai menyiapkan katalog MabaTag.
            </p>
            <Button
              className="mt-5"
              onClick={() => setFormState({ mode: "create", service: null })}
            >
              <Plus aria-hidden="true" className="size-4" />
              Tambah Jasa
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                <thead className="bg-background">
                  <tr className="border-b-2 border-ink">
                    {[
                      "Nama jasa",
                      "Harga",
                      "Kuota",
                      "Deadline",
                      "Status",
                      "Tanggal dibuat",
                      "Aksi",
                    ].map((heading) => (
                      <th className="px-4 py-3 font-bold" key={heading}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => {
                    const isBusy = busyAction?.endsWith(service.id);
                    return (
                      <tr
                        className="border-b-2 border-ink/15 last:border-b-0"
                        key={service.id}
                      >
                        <td className="px-4 py-4">
                          <p className="font-bold">{service.name}</p>
                          <p className="mt-0.5 text-xs text-muted">/{service.slug}</p>
                        </td>
                        <td className="px-4 py-4 font-bold">
                          {currencyFormatter.format(service.price)}
                        </td>
                        <td className="px-4 py-4 font-semibold">
                          {service.quota ?? "Tanpa batas"}
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold">
                          {service.deadline
                            ? formatDate(service.deadline, true)
                            : "Tanpa deadline"}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge isActive={service.is_active} />
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold">
                          {formatDate(service.created_at)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              disabled={isBusy}
                              onClick={() => setFormState({ mode: "edit", service })}
                              variant="secondary"
                            >
                              <Edit3 aria-hidden="true" className="size-4" />
                              Edit
                            </Button>
                            <Button
                              disabled={isBusy}
                              onClick={() => void handleToggle(service)}
                              variant="secondary"
                            >
                              <Power aria-hidden="true" className="size-4" />
                              {service.is_active ? "Nonaktifkan" : "Aktifkan"}
                            </Button>
                            <Button
                              className="bg-secondary/35"
                              disabled={isBusy}
                              onClick={() => void handleDelete(service)}
                              variant="secondary"
                            >
                              <Trash2 aria-hidden="true" className="size-4" />
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 lg:hidden">
              {services.map((service) => {
                const isBusy = busyAction?.endsWith(service.id);
                return (
                  <article
                    className="rounded-lg border-2 border-ink bg-background p-4"
                    key={service.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold">{service.name}</h3>
                        <p className="text-xs font-semibold text-muted">/{service.slug}</p>
                      </div>
                      <StatusBadge isActive={service.is_active} />
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs font-bold text-muted">Harga</dt>
                        <dd className="font-bold">
                          {currencyFormatter.format(service.price)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold text-muted">Kuota</dt>
                        <dd className="font-semibold">
                          {service.quota ?? "Tanpa batas"}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="flex items-center gap-1.5 text-xs font-bold text-muted">
                          <CalendarClock aria-hidden="true" className="size-3.5" />
                          Deadline
                        </dt>
                        <dd className="font-semibold">
                          {service.deadline
                            ? formatDate(service.deadline, true)
                            : "Tanpa deadline"}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <Button
                        disabled={isBusy}
                        onClick={() => setFormState({ mode: "edit", service })}
                        variant="secondary"
                      >
                        <Edit3 aria-hidden="true" className="size-4" />
                        Edit
                      </Button>
                      <Button
                        disabled={isBusy}
                        onClick={() => void handleToggle(service)}
                        variant="secondary"
                      >
                        <Power aria-hidden="true" className="size-4" />
                        {service.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                      <Button
                        className="bg-secondary/35"
                        disabled={isBusy}
                        onClick={() => void handleDelete(service)}
                        variant="secondary"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                        Hapus
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {formState ? (
        <ServiceFormPanel
          key={`${formState.mode}-${formState.service?.id ?? "new"}`}
          mode={formState.mode}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
          service={formState.service}
        />
      ) : null}
    </>
  );
}

export function ServicesQueryError() {
  return (
    <div className="pt-10 sm:pt-14">
      <div className="brutal-card bg-secondary/25 p-6 sm:p-8">
        <CircleAlert aria-hidden="true" className="size-10" />
        <h1 className="mt-4 text-3xl font-bold">Data jasa belum dapat dimuat</h1>
        <p className="mt-2 max-w-xl font-semibold text-muted">
          Periksa koneksi Supabase dan kebijakan akses tabel, lalu muat ulang halaman.
        </p>
      </div>
    </div>
  );
}
