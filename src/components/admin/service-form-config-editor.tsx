"use client";

import { Plus, Settings2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BUILT_IN_FIELD_KEYS,
  BUILT_IN_FIELD_NAMES,
  CUSTOM_FIELD_TYPES,
  FIELD_STATUSES,
  formConfigSchema,
  getFormConfigCounts,
  slugifyCustomFieldId,
  type BuiltInFieldKey,
  type CustomField,
  type CustomFieldType,
  type FieldStatus,
  type FormConfig,
} from "@/lib/form-config";
import { cn } from "@/lib/utils";

const statusLabels: Record<FieldStatus, string> = {
  required: "Wajib",
  optional: "Opsional",
  hidden: "Disembunyikan",
};

const typeLabels: Record<CustomFieldType, string> = {
  text: "Teks singkat",
  number: "Angka",
  textarea: "Teks panjang",
  select: "Pilihan",
};

const statusStyles: Record<FieldStatus, string> = {
  required: "bg-primary",
  optional: "bg-tertiary/25",
  hidden: "bg-secondary/25",
};

function uniqueCustomId(config: FormConfig, base: string) {
  const used = new Set([
    ...BUILT_IN_FIELD_KEYS,
    ...config.custom_fields.map((field) => field.id),
  ]);
  const fallback = base || "field_khusus";
  let candidate = fallback;
  let suffix = 2;

  while (used.has(candidate)) {
    candidate = `${fallback}_${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function StatusBadge({ status }: { status: FieldStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border-2 border-ink px-2 py-0.5 text-xs font-bold",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export function ServiceFormConfigEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: FormConfig;
  onChange: (config: FormConfig) => void;
  disabled?: boolean;
}) {
  const [editedCustomIds, setEditedCustomIds] = useState<Set<number>>(
    new Set(),
  );
  const counts = getFormConfigCounts(value);
  const validation = useMemo(
    () => formConfigSchema.safeParse(value),
    [value],
  );

  function updateBuiltIn(
    key: BuiltInFieldKey,
    property: "label" | "status",
    nextValue: string,
  ) {
    onChange({
      ...value,
      [key]: {
        ...value[key],
        [property]: nextValue,
      },
    });
  }

  function updateCustom(index: number, field: CustomField) {
    onChange({
      ...value,
      custom_fields: value.custom_fields.map((item, itemIndex) =>
        itemIndex === index ? field : item,
      ),
    });
  }

  function updateCustomType(index: number, type: CustomFieldType) {
    const current = value.custom_fields[index];
    const base = {
      id: current.id,
      label: current.label,
      status: current.status,
    };
    const next =
      type === "select"
        ? ({ ...base, type, options: ["Pilihan 1"] } as CustomField)
        : ({ ...base, type } as CustomField);
    updateCustom(index, next);
  }

  function addCustomField() {
    const number = value.custom_fields.length + 1;
    const label = `Field khusus ${number}`;
    const field: CustomField = {
      id: uniqueCustomId(value, slugifyCustomFieldId(label)),
      label,
      type: "text",
      status: "required",
    };
    onChange({ ...value, custom_fields: [...value.custom_fields, field] });
  }

  const validationMessage = validation.success
    ? null
    : validation.error.issues[0]?.message;

  return (
    <section className="rounded-lg border-3 border-ink bg-background p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings2 aria-hidden="true" className="size-5" />
            <h3 className="text-xl font-black">Pengaturan Form Pembeli</h3>
          </div>
          <p className="mt-2 max-w-xl text-sm font-semibold text-muted">
            Atur data yang harus diisi pembeli sesuai ketentuan kegiatan atau panitia.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="required" />
          <StatusBadge status="optional" />
          <StatusBadge status="hidden" />
        </div>
      </div>

      <p className="mt-4 rounded-lg border-2 border-ink bg-surface p-3 text-sm font-bold">
        Pembeli akan mengisi {counts.required} field wajib, {counts.optional} field
        opsional, dan {counts.hidden} field disembunyikan.
      </p>

      {validationMessage ? (
        <p className="mt-3 rounded-lg border-2 border-ink bg-secondary/25 p-3 text-sm font-bold" role="alert">
          {validationMessage}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        {BUILT_IN_FIELD_KEYS.map((key) => {
          const locked = key === "full_name" || key === "whatsapp";
          const field = value[key];
          return (
            <div
              className="grid gap-3 rounded-lg border-2 border-ink bg-surface p-3 sm:grid-cols-[0.7fr_1.4fr_0.8fr] sm:items-end"
              key={key}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">Field</p>
                <p className="mt-1 font-black">{BUILT_IN_FIELD_NAMES[key]}</p>
              </div>
              <label>
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted">
                  Label tampilan
                </span>
                <Input
                  className="mt-1"
                  disabled={disabled}
                  maxLength={80}
                  onChange={(event) =>
                    updateBuiltIn(key, "label", event.target.value)
                  }
                  value={field.label}
                />
              </label>
              <label>
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted">
                  Status
                </span>
                <select
                  className="input-base mt-1"
                  disabled={disabled || locked}
                  onChange={(event) =>
                    updateBuiltIn(key, "status", event.target.value)
                  }
                  value={field.status}
                >
                  {FIELD_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          );
        })}
      </div>

      <div className="mt-7 flex items-center justify-between gap-3">
        <div>
          <h4 className="font-black">Field khusus</h4>
          <p className="mt-1 text-sm font-semibold text-muted">
            Tambahkan data kegiatan yang tidak tersedia pada field bawaan.
          </p>
        </div>
        <Button disabled={disabled} onClick={addCustomField} variant="secondary">
          <Plus aria-hidden="true" className="size-4" />
          Tambah Field Khusus
        </Button>
      </div>

      {value.custom_fields.length === 0 ? (
        <p className="mt-4 rounded-lg border-2 border-dashed border-ink/50 bg-surface p-5 text-center text-sm font-semibold text-muted">
          Belum ada field khusus.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {value.custom_fields.map((field, index) => {
            const fieldIssues = validation.success
              ? []
              : validation.error.issues.filter(
                  (issue) =>
                    issue.path[0] === "custom_fields" && issue.path[1] === index,
                );
            return (
              <div className="rounded-lg border-2 border-ink bg-surface p-4" key={`${index}-${field.id}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black">Field khusus {index + 1}</p>
                  <Button
                    aria-label={`Hapus ${field.label}`}
                    disabled={disabled}
                    onClick={() =>
                      onChange({
                        ...value,
                        custom_fields: value.custom_fields.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      })
                    }
                    variant="secondary"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    Hapus
                  </Button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className="text-sm font-bold">Label</span>
                    <Input
                      className="mt-1"
                      disabled={disabled}
                      maxLength={80}
                      onChange={(event) => {
                        const label = event.target.value;
                        const nextId = editedCustomIds.has(index)
                          ? field.id
                          : uniqueCustomId(
                              {
                                ...value,
                                custom_fields: value.custom_fields.filter(
                                  (_, itemIndex) => itemIndex !== index,
                                ),
                              },
                              slugifyCustomFieldId(label),
                            );
                        updateCustom(index, { ...field, label, id: nextId });
                      }}
                      value={field.label}
                    />
                  </label>
                  <label>
                    <span className="text-sm font-bold">ID / key</span>
                    <Input
                      className="mt-1 font-mono"
                      disabled={disabled}
                      maxLength={60}
                      onChange={(event) => {
                        setEditedCustomIds((current) =>
                          new Set(current).add(index),
                        );
                        updateCustom(index, {
                          ...field,
                          id: event.target.value.toLowerCase().replace(/\s+/g, "_"),
                        });
                      }}
                      value={field.id}
                    />
                  </label>
                  <label>
                    <span className="text-sm font-bold">Jenis input</span>
                    <select
                      className="input-base mt-1"
                      disabled={disabled}
                      onChange={(event) =>
                        updateCustomType(index, event.target.value as CustomFieldType)
                      }
                      value={field.type}
                    >
                      {CUSTOM_FIELD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {typeLabels[type]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="text-sm font-bold">Status</span>
                    <select
                      className="input-base mt-1"
                      disabled={disabled}
                      onChange={(event) =>
                        updateCustom(index, {
                          ...field,
                          status: event.target.value as FieldStatus,
                        })
                      }
                      value={field.status}
                    >
                      {FIELD_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {field.type === "select" ? (
                  <label className="mt-3 block">
                    <span className="text-sm font-bold">Pilihan (satu per baris)</span>
                    <textarea
                      className="input-base mt-1 min-h-28 resize-y"
                      disabled={disabled}
                      onBlur={() =>
                        updateCustom(index, {
                          ...field,
                          options: field.options
                            .map((option) => option.trim())
                            .filter(Boolean),
                        })
                      }
                      onChange={(event) =>
                        updateCustom(index, {
                          ...field,
                          options: event.target.value.split("\n"),
                        })
                      }
                      placeholder={"Hitam\nMerah\nBiru"}
                      value={field.options.join("\n")}
                    />
                  </label>
                ) : null}

                {fieldIssues.length > 0 ? (
                  <ul className="mt-3 space-y-1 text-sm font-bold text-red-700">
                    {fieldIssues.map((issue, issueIndex) => (
                      <li key={`${issue.path.join(".")}-${issueIndex}`}>
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
