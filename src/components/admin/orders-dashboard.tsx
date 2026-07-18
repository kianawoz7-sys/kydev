/* eslint-disable @next/next/no-img-element */
"use client";

import {
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Clock3,
  Eye,
  FileImage,
  LoaderCircle,
  MessageCircle,
  PackageCheck,
  Search,
  Save,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  updateOrder,
  type UpdateOrderInput,
} from "@/app/admin/actions";
import { Button, buttonStyles } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "@/lib/constants/orders";
import { cn } from "@/lib/utils";
import type {
  DashboardOrder,
  DashboardStats,
} from "@/lib/admin/orders";
import type { OrderStatus, PaymentStatus } from "@/types/database";
import type { Json } from "@/types/database";

type OrdersDashboardProps = {
  initialOrders: DashboardOrder[];
  initialStats: DashboardStats;
};

type Feedback = {
  tone: "success" | "error";
  message: string;
} | null;

type FileResponse = {
  photoUrl: string | null;
  paymentProofUrl: string | null;
  hasPhoto: boolean;
  hasPaymentProof: boolean;
};

const paymentBadgeStyles: Record<PaymentStatus, string> = {
  menunggu: "bg-primary",
  lunas: "bg-emerald-300",
  ditolak: "bg-secondary/55",
};

const orderBadgeStyles: Record<OrderStatus, string> = {
  masuk: "bg-surface",
  diproses: "bg-tertiary/45",
  selesai: "bg-emerald-300",
  dibatalkan: "bg-secondary/55",
};

const statCards = [
  {
    key: "total" as const,
    title: "Total pesanan",
    caption: "Tidak termasuk pesanan dibatalkan",
    icon: ClipboardList,
    color: "bg-primary",
  },
  {
    key: "waiting" as const,
    title: "Menunggu verifikasi",
    caption: "Pembayaran perlu diperiksa",
    icon: Clock3,
    color: "bg-tertiary/45",
  },
  {
    key: "processing" as const,
    title: "Sedang dikerjakan",
    caption: "Pesanan berstatus diproses",
    icon: PackageCheck,
    color: "bg-surface",
  },
  {
    key: "completed" as const,
    title: "Pesanan selesai",
    caption: "Produksi telah diselesaikan",
    icon: CheckCircle2,
    color: "bg-emerald-300",
  },
];

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function formatBirthDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : shortDateFormatter.format(date);
}

function labelStatus(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getExtraDataItems(value: Json | null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  return Object.entries(value).flatMap(([key, item]) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const label = typeof item.label === "string" ? item.label.trim() : "";
    const itemValue =
      typeof item.value === "string" || typeof item.value === "number"
        ? String(item.value).trim()
        : "";

    return label && itemValue
      ? [{ key, label, value: itemValue }]
      : [];
  });
}

function StatusBadge({
  type,
  value,
}: {
  type: "payment" | "order";
  value: PaymentStatus | OrderStatus;
}) {
  const styles =
    type === "payment"
      ? paymentBadgeStyles[value as PaymentStatus]
      : orderBadgeStyles[value as OrderStatus];

  return (
    <span
      className={cn(
        "inline-flex rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-bold",
        styles,
      )}
    >
      {labelStatus(value)}
    </span>
  );
}

function normalizeWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

function calculateStats(orders: DashboardOrder[]): DashboardStats {
  return {
    total: orders.filter((order) => order.order_status !== "dibatalkan").length,
    waiting: orders.filter(
      (order) =>
        order.payment_status === "menunggu" &&
        order.order_status !== "dibatalkan",
    ).length,
    processing: orders.filter((order) => order.order_status === "diproses")
      .length,
    completed: orders.filter((order) => order.order_status === "selesai").length,
  };
}

function DetailItem({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cn("border-b-2 border-ink/15 pb-3", wide && "sm:col-span-2")}>
      <dt className="text-xs font-bold uppercase tracking-[0.1em] text-muted">
        {label}
      </dt>
      <dd className="mt-1 break-words font-semibold">{value || "—"}</dd>
    </div>
  );
}

function FilePreview({
  label,
  url,
  exists,
  loading,
  emptyMessage,
}: {
  label: string;
  url: string | null;
  exists: boolean;
  loading: boolean;
  emptyMessage?: string;
}) {
  return (
    <div className="rounded-lg border-2 border-ink bg-background p-3">
      <p className="flex items-center gap-2 text-sm font-bold">
        <FileImage aria-hidden="true" className="size-4" />
        {label}
      </p>
      {loading ? (
        <div className="mt-3 flex min-h-40 items-center justify-center rounded-md border-2 border-dashed border-ink/45 bg-surface text-sm font-semibold text-muted">
          <LoaderCircle aria-hidden="true" className="mr-2 size-5 animate-spin" />
          Membuat akses file...
        </div>
      ) : url ? (
        <div className="mt-3">
          <img
            alt={label}
            className="max-h-72 w-full rounded-md border-2 border-ink bg-surface object-contain"
            src={url}
          />
          <a
            className={buttonStyles({
              variant: "secondary",
              className: "mt-3 w-full text-sm",
            })}
            href={url}
            rel="noreferrer"
            target="_blank"
          >
            Buka file
          </a>
        </div>
      ) : (
        <div className="mt-3 flex min-h-40 items-center justify-center rounded-md border-2 border-dashed border-ink/45 bg-surface px-4 text-center text-sm font-semibold text-muted">
          {exists
            ? "File tersimpan, tetapi akses sementara belum dapat dibuat."
            : emptyMessage ?? `${label} belum tersedia.`}
        </div>
      )}
    </div>
  );
}

function OrderDetailPanel({
  order,
  onClose,
  onSaved,
}: {
  order: DashboardOrder;
  onClose: () => void;
  onSaved: (updated: DashboardOrder) => void;
}) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [orderStatus, setOrderStatus] = useState(order.order_status);
  const [adminNote, setAdminNote] = useState(order.admin_note ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [files, setFiles] = useState<FileResponse | null>(null);
  const [filesLoading, setFilesLoading] = useState(true);
  const [filesError, setFilesError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFiles() {
      setFilesLoading(true);
      setFilesError(false);

      try {
        const response = await fetch(`/admin/orders/${order.id}/files`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("File request failed");
        setFiles((await response.json()) as FileResponse);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setFilesError(true);
      } finally {
        if (!controller.signal.aborted) setFilesLoading(false);
      }
    }

    void loadFiles();
    return () => controller.abort();
  }, [order.id]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const whatsappNumber = normalizeWhatsapp(order.whatsapp);
  const whatsappMessage = encodeURIComponent(
    `Halo, kami menghubungi terkait pesanan MabaTag dengan kode ${order.order_code}.`,
  );
  const whatsappHref =
    whatsappNumber.length >= 10
      ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
      : null;
  const extraDataItems = getExtraDataItems(order.extra_data);

  async function handleSave() {
    if (
      orderStatus === "dibatalkan" &&
      order.order_status !== "dibatalkan" &&
      !window.confirm(
        `Batalkan pesanan ${order.order_code}? Perubahan ini akan memengaruhi statistik dashboard.`,
      )
    ) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const input: UpdateOrderInput = {
      id: order.id,
      paymentStatus,
      orderStatus,
      adminNote,
    };
    const result = await updateOrder(input);

    if (result.success) {
      const updatedOrder: DashboardOrder = {
        ...order,
        payment_status: paymentStatus,
        order_status: orderStatus,
        admin_note: adminNote.trim() || null,
      };
      onSaved(updatedOrder);
      setFeedback({ tone: "success", message: "Perubahan berhasil disimpan." });
      router.refresh();
    } else {
      setFeedback({ tone: "error", message: result.message });
    }

    setIsSaving(false);
  }

  return (
    <div
      aria-label={`Detail pesanan ${order.order_code}`}
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-ink/55 p-2 sm:p-4"
      role="dialog"
    >
      <div className="h-full w-full max-w-3xl overflow-y-auto rounded-lg border-3 border-ink bg-surface shadow-[-5px_5px_0_var(--ink)]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b-3 border-ink bg-primary p-4 sm:p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em]">
              Detail pesanan
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              {order.order_code}
            </h2>
          </div>
          <Button aria-label="Tutup detail pesanan" onClick={onClose} variant="secondary">
            <X aria-hidden="true" className="size-5" />
          </Button>
        </div>

        <div className="space-y-7 p-4 sm:p-6">
          <section>
            <h3 className="text-lg font-bold">Data pelanggan</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Kode pesanan" value={order.order_code} />
              <DetailItem label="Jasa" value={order.services?.name ?? "Jasa tidak ditemukan"} />
              <DetailItem label="Nama lengkap" value={order.full_name} />
              <DetailItem label="Nomor WhatsApp" value={order.whatsapp} />
              <DetailItem label="Fakultas" value={order.faculty} />
              <DetailItem label="Program Studi" value={order.major} />
              <DetailItem label="Kelompok" value={order.group_name} />
              {order.nim ? <DetailItem label="NIM" value={order.nim} /> : null}
              <DetailItem label="Tempat lahir" value={order.birth_place} />
              <DetailItem label="Tanggal lahir" value={formatBirthDate(order.birth_date)} />
              <DetailItem label="Harga" value={formatCurrency(order.total_price)} />
              <DetailItem
                label="Syarat disetujui"
                value={order.terms_accepted ? "Ya" : "Tidak"}
              />
              <DetailItem label="Alamat" value={order.address} wide />
              <DetailItem label="Motto hidup" value={order.motto} wide />
              <DetailItem label="Catatan pelanggan" value={order.customer_note} wide />
              <DetailItem label="Tanggal masuk" value={formatDate(order.created_at)} wide />
            </dl>
          </section>

          {extraDataItems.length > 0 ? (
            <section>
              <h3 className="text-lg font-bold">Data tambahan</h3>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {extraDataItems.map((item) => (
                  <DetailItem
                    key={item.key}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </dl>
            </section>
          ) : null}

          <section>
            <h3 className="text-lg font-bold">File pesanan</h3>
            {filesError ? (
              <p className="mt-3 rounded-lg border-2 border-ink bg-secondary/25 p-3 text-sm font-semibold">
                File belum dapat dimuat. Tutup detail lalu coba kembali.
              </p>
            ) : null}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FilePreview
                emptyMessage="Foto pelanggan tidak tersedia atau tidak dibutuhkan untuk jasa ini."
                exists={files?.hasPhoto ?? false}
                label="Foto pelanggan"
                loading={filesLoading}
                url={files?.photoUrl ?? null}
              />
              <FilePreview
                exists={files?.hasPaymentProof ?? false}
                label="Bukti pembayaran"
                loading={filesLoading}
                url={files?.paymentProofUrl ?? null}
              />
            </div>
          </section>

          <section className="rounded-lg border-3 border-ink bg-background p-4 sm:p-5">
            <h3 className="text-lg font-bold">Tindakan admin</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-bold" htmlFor="payment-status">
                  Status pembayaran
                </label>
                <select
                  className="input-base mt-2"
                  disabled={isSaving}
                  id="payment-status"
                  onChange={(event) =>
                    setPaymentStatus(event.target.value as PaymentStatus)
                  }
                  value={paymentStatus}
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {labelStatus(status)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold" htmlFor="order-status">
                  Status pesanan
                </label>
                <select
                  className="input-base mt-2"
                  disabled={isSaving}
                  id="order-status"
                  onChange={(event) =>
                    setOrderStatus(event.target.value as OrderStatus)
                  }
                  value={orderStatus}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {labelStatus(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-bold" htmlFor="admin-note">
                Catatan admin
              </label>
              <textarea
                className="input-base mt-2 min-h-28 resize-y"
                disabled={isSaving}
                id="admin-note"
                maxLength={1_000}
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="Tambahkan catatan internal untuk pesanan ini."
                value={adminNote}
              />
              <p className="mt-1 text-right text-xs font-semibold text-muted">
                {adminNote.length}/1.000
              </p>
            </div>

            {feedback ? (
              <p
                className={cn(
                  "mt-4 rounded-lg border-2 border-ink p-3 text-sm font-semibold",
                  feedback.tone === "success" ? "bg-emerald-300" : "bg-secondary/30",
                )}
                role="status"
              >
                {feedback.message}
              </p>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {whatsappHref ? (
                <a
                  className={buttonStyles({ variant: "secondary", className: "w-full" })}
                  href={whatsappHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircle aria-hidden="true" className="size-4" />
                  Buka WhatsApp
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  className={buttonStyles({ variant: "secondary", className: "w-full" })}
                >
                  Nomor WhatsApp tidak valid
                </span>
              )}
              <Button disabled={isSaving} onClick={handleSave}>
                {isSaving ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save aria-hidden="true" className="size-4" />
                    Simpan perubahan
                  </>
                )}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function OrdersDashboard({
  initialOrders,
  initialStats,
}: OrdersDashboardProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState("");
  const [major, setMajor] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);

  const faculties = useMemo(
    () =>
      [...new Set(orders.map((order) => order.faculty?.trim()).filter(Boolean))]
        .sort((a, b) => a!.localeCompare(b!, "id")) as string[],
    [orders],
  );
  const majors = useMemo(
    () =>
      [...new Set(orders.map((order) => order.major?.trim()).filter(Boolean))]
        .sort((a, b) => a!.localeCompare(b!, "id")) as string[],
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("id-ID");

    return orders.filter((order) => {
      const searchable = [order.order_code, order.full_name, order.whatsapp]
        .join(" ")
        .toLocaleLowerCase("id-ID");

      return (
        (!normalizedSearch || searchable.includes(normalizedSearch)) &&
        (!faculty || order.faculty === faculty) &&
        (!major || order.major === major) &&
        (!orderStatus || order.order_status === orderStatus) &&
        (!paymentStatus || order.payment_status === paymentStatus)
      );
    });
  }, [faculty, major, orderStatus, orders, paymentStatus, search]);

  const hasActiveFilters = Boolean(
    search || faculty || major || orderStatus || paymentStatus,
  );

  function resetFilters() {
    setSearch("");
    setFaculty("");
    setMajor("");
    setOrderStatus("");
    setPaymentStatus("");
  }

  function handleSaved(updatedOrder: DashboardOrder) {
    setOrders((current) => {
      const next = current.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order,
      );
      setStats(calculateStats(next));
      return next;
    });
    setSelectedOrder(updatedOrder);
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <article className={cn("brutal-card p-5", card.color)} key={card.key}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{card.title}</p>
                  <p className="mt-2 text-4xl font-black tracking-tight">
                    {stats[card.key]}
                  </p>
                </div>
                <span className="rounded-lg border-2 border-ink bg-surface p-2">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
              </div>
              <p className="mt-4 text-xs font-semibold text-muted">{card.caption}</p>
            </article>
          );
        })}
      </div>

      <section className="brutal-card mt-8 overflow-hidden bg-surface">
        <div className="border-b-3 border-ink bg-tertiary/35 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <SlidersHorizontal aria-hidden="true" className="mt-1 size-5 shrink-0" />
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Daftar pesanan</h2>
              <p className="mt-1 text-sm font-semibold text-muted">
                {filteredOrders.length} dari {orders.length} pesanan ditampilkan.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="relative md:col-span-2 xl:col-span-1">
              <span className="sr-only">Cari pesanan</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted"
              />
              <Input
                className="pl-9"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Kode, nama, WhatsApp"
                type="search"
                value={search}
              />
            </label>
            <select
              aria-label="Filter fakultas"
              className="input-base"
              onChange={(event) => setFaculty(event.target.value)}
              value={faculty}
            >
              <option value="">Semua fakultas</option>
              {faculties.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            <select
              aria-label="Filter jurusan"
              className="input-base"
              onChange={(event) => setMajor(event.target.value)}
              value={major}
            >
              <option value="">Semua jurusan</option>
              {majors.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            <select
              aria-label="Filter status pesanan"
              className="input-base"
              onChange={(event) => setOrderStatus(event.target.value)}
              value={orderStatus}
            >
              <option value="">Semua status pesanan</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>{labelStatus(status)}</option>
              ))}
            </select>
            <select
              aria-label="Filter status pembayaran"
              className="input-base"
              onChange={(event) => setPaymentStatus(event.target.value)}
              value={paymentStatus}
            >
              <option value="">Semua status pembayaran</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>{labelStatus(status)}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters ? (
            <button
              className="mt-3 text-sm font-bold underline decoration-2 underline-offset-4"
              onClick={resetFilters}
              type="button"
            >
              Reset filter
            </button>
          ) : null}
        </div>

        {orders.length === 0 ? (
          <div className="px-5 py-16 text-center sm:px-8">
            <ClipboardList aria-hidden="true" className="mx-auto size-12" />
            <h3 className="mt-4 text-2xl font-bold">Belum ada pesanan</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Pesanan baru dari Supabase akan tampil di sini tanpa perlu data dummy.
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="px-5 py-16 text-center sm:px-8">
            <Search aria-hidden="true" className="mx-auto size-12" />
            <h3 className="mt-4 text-2xl font-bold">Pesanan tidak ditemukan</h3>
            <p className="mt-2 text-sm text-muted">
              Ubah kata pencarian atau reset filter yang aktif.
            </p>
            <Button className="mt-5" onClick={resetFilters} variant="secondary">
              Reset filter
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                <thead className="bg-background">
                  <tr className="border-b-2 border-ink">
                    {[
                      "Kode pesanan",
                      "Nama pelanggan",
                      "Fakultas / Program Studi",
                      "Nama jasa",
                      "Total harga",
                      "Pembayaran",
                      "Pesanan",
                      "Tanggal masuk",
                      "Aksi",
                    ].map((heading) => (
                      <th className="px-4 py-3 font-bold" key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr className="border-b-2 border-ink/15 last:border-b-0" key={order.id}>
                      <td className="px-4 py-4 font-bold">{order.order_code}</td>
                      <td className="px-4 py-4">
                        <p className="font-semibold">{order.full_name}</p>
                        <p className="text-xs text-muted">{order.whatsapp}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-muted">
                          Fakultas
                        </p>
                        <p className="font-semibold">{order.faculty || "—"}</p>
                        <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-muted">
                          Program Studi
                        </p>
                        <p className="text-xs font-semibold">{order.major || "—"}</p>
                      </td>
                      <td className="px-4 py-4 font-semibold">
                        {order.services?.name ?? "Jasa tidak ditemukan"}
                      </td>
                      <td className="px-4 py-4 font-bold">{formatCurrency(order.total_price)}</td>
                      <td className="px-4 py-4">
                        <StatusBadge type="payment" value={order.payment_status} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge type="order" value={order.order_status} />
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <Button onClick={() => setSelectedOrder(order)} variant="secondary">
                          <Eye aria-hidden="true" className="size-4" />
                          Lihat
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 lg:hidden">
              {filteredOrders.map((order) => (
                <article className="rounded-lg border-2 border-ink bg-background p-4" key={order.id}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted">
                        {order.order_code}
                      </p>
                      <h3 className="mt-1 text-lg font-bold">{order.full_name}</h3>
                    </div>
                    <p className="font-black">{formatCurrency(order.total_price)}</p>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs font-bold text-muted">Jasa</dt>
                      <dd className="font-semibold">{order.services?.name ?? "—"}</dd>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-3 rounded-lg border-2 border-ink/15 bg-surface p-3">
                      <div>
                        <dt className="text-xs font-bold text-muted">Fakultas</dt>
                        <dd className="break-words font-semibold">
                          {order.faculty || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold text-muted">
                          Program Studi
                        </dt>
                        <dd className="break-words font-semibold">
                          {order.major || "—"}
                        </dd>
                      </div>
                    </div>
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusBadge type="payment" value={order.payment_status} />
                    <StatusBadge type="order" value={order.order_status} />
                  </div>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => setSelectedOrder(order)}
                    variant="secondary"
                  >
                    <Eye aria-hidden="true" className="size-4" />
                    Lihat detail
                  </Button>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {selectedOrder ? (
        <OrderDetailPanel
          key={selectedOrder.id}
          onClose={() => setSelectedOrder(null)}
          onSaved={handleSaved}
          order={selectedOrder}
        />
      ) : null}
    </>
  );
}

export function DashboardQueryError() {
  return (
    <div className="brutal-card bg-secondary/25 p-6 sm:p-8">
      <CircleAlert aria-hidden="true" className="size-10" />
      <h2 className="mt-4 text-2xl font-bold">Data dashboard belum dapat dimuat</h2>
      <p className="mt-2 max-w-xl text-sm font-semibold text-muted">
        Periksa koneksi Supabase dan kebijakan akses tabel, lalu muat ulang halaman.
      </p>
    </div>
  );
}
