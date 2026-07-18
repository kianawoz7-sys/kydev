"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  CircleAlert,
  Clipboard,
  ClipboardCheck,
  Clock3,
  LoaderCircle,
  MessageCircle,
  PackageCheck,
  RefreshCcw,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, buttonStyles } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getActiveTimelineStep,
  ORDER_STATUS_PRESENTATION,
  ORDER_TIMELINE,
  type OrderTrackingSuccess,
  PAYMENT_STATUS_PRESENTATION,
  type PublicTrackedOrder,
} from "@/lib/order-tracking";
import { cn } from "@/lib/utils";
import {
  normalizeOrderCode,
  orderTrackingSchema,
  type OrderTrackingInput,
} from "@/lib/validations/order-tracking";
import type { OrderStatus, PaymentStatus } from "@/types/database";

type TrackingFailure = {
  success: false;
  message: string;
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Waktu tidak tersedia" : dateFormatter.format(date);
}

function StatusBadge({
  type,
  value,
}: {
  type: "payment" | "order";
  value: PaymentStatus | OrderStatus;
}) {
  const presentation =
    type === "payment"
      ? PAYMENT_STATUS_PRESENTATION[value as PaymentStatus]
      : ORDER_STATUS_PRESENTATION[value as OrderStatus];

  return (
    <span
      className={cn(
        "inline-flex rounded-full border-2 border-ink px-3 py-1 text-xs font-black",
        presentation.className,
      )}
    >
      {presentation.label}
    </span>
  );
}

function Timeline({ status }: { status: OrderStatus }) {
  const activeStep = getActiveTimelineStep(status);

  return (
    <ol aria-label="Progres pengerjaan pesanan" className="grid grid-cols-3 gap-2 sm:gap-4">
      {ORDER_TIMELINE.map((step, index) => {
        const active = index < activeStep;

        return (
          <li className="min-w-0 text-center" key={step.status}>
            <span
              className={cn(
                "mx-auto flex size-9 items-center justify-center rounded-full border-2 border-ink font-black shadow-[2px_2px_0_var(--ink)] sm:size-11",
                active ? "bg-emerald-300" : "bg-background text-muted",
              )}
            >
              {active ? (
                <Check aria-hidden="true" className="size-4 sm:size-5" />
              ) : (
                index + 1
              )}
            </span>
            <span className="mt-2 block text-xs font-bold leading-tight sm:text-sm">
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function LoadingResult() {
  return (
    <div aria-label="Memuat status pesanan" className="brutal-card mt-8 overflow-hidden bg-surface">
      <div className="animate-pulse border-b-3 border-ink bg-primary/55 p-6">
        <div className="h-4 w-32 rounded bg-ink/20" />
        <div className="mt-3 h-8 w-52 max-w-full rounded bg-ink/25" />
      </div>
      <div className="grid gap-4 p-6 sm:grid-cols-2">
        <div className="h-28 rounded-lg border-2 border-ink bg-background" />
        <div className="h-28 rounded-lg border-2 border-ink bg-background" />
      </div>
    </div>
  );
}

function TrackingResult({
  order,
  whatsappUrl,
  onReset,
}: {
  order: PublicTrackedOrder;
  whatsappUrl: string | null;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const payment = PAYMENT_STATUS_PRESENTATION[order.paymentStatus];
  const progress = ORDER_STATUS_PRESENTATION[order.orderStatus];

  async function copyOrderCode() {
    try {
      await navigator.clipboard.writeText(order.orderCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="brutal-card mt-8 overflow-hidden bg-surface" id="hasil-pesanan">
      <header className="border-b-3 border-ink bg-primary p-5 sm:p-7">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em]">
          <ShieldCheck aria-hidden="true" className="size-4" />
          Pesanan ditemukan
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold text-muted">Kode pesanan</p>
            <h2 className="break-all text-3xl font-black tracking-tight sm:text-4xl">
              {order.orderCode}
            </h2>
          </div>
          <Button className="shrink-0" onClick={copyOrderCode} variant="secondary">
            {copied ? (
              <ClipboardCheck aria-hidden="true" className="size-4" />
            ) : (
              <Clipboard aria-hidden="true" className="size-4" />
            )}
            {copied ? "Kode tersalin" : "Salin kode"}
          </Button>
        </div>
      </header>

      <div className="space-y-7 p-5 sm:p-7">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-ink bg-background p-4">
            <dt className="text-sm font-bold text-muted">Nama pelanggan</dt>
            <dd className="mt-1 break-words text-lg font-black">{order.fullName}</dd>
          </div>
          <div className="rounded-lg border-2 border-ink bg-background p-4">
            <dt className="text-sm font-bold text-muted">Nama jasa</dt>
            <dd className="mt-1 break-words text-lg font-black">{order.serviceName}</dd>
          </div>
          <div className="rounded-lg border-2 border-ink bg-background p-4">
            <dt className="text-sm font-bold text-muted">Total pembayaran</dt>
            <dd className="mt-1 text-lg font-black">
              {currencyFormatter.format(order.totalPrice)}
            </dd>
          </div>
          <div className="rounded-lg border-2 border-ink bg-background p-4">
            <dt className="flex items-center gap-2 text-sm font-bold text-muted">
              <Clock3 aria-hidden="true" className="size-4" />
              Terakhir diperbarui
            </dt>
            <dd className="mt-1 font-bold">{formatDate(order.updatedAt)}</dd>
          </div>
        </dl>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-ink bg-primary/20 p-4 sm:p-5">
            <p className="flex items-center gap-2 text-sm font-black">
              <WalletCards aria-hidden="true" className="size-5" />
              Status pembayaran
            </p>
            <div className="mt-3">
              <StatusBadge type="payment" value={order.paymentStatus} />
            </div>
            <p className="mt-3 text-sm font-semibold text-muted">{payment.description}</p>
          </div>
          <div className="rounded-lg border-2 border-ink bg-tertiary/15 p-4 sm:p-5">
            <p className="flex items-center gap-2 text-sm font-black">
              <PackageCheck aria-hidden="true" className="size-5" />
              Status pengerjaan
            </p>
            <div className="mt-3">
              <StatusBadge type="order" value={order.orderStatus} />
            </div>
            <p className="mt-3 text-sm font-semibold text-muted">{progress.description}</p>
          </div>
        </section>

        {order.orderStatus === "dibatalkan" ? (
          <section className="rounded-lg border-3 border-ink bg-secondary/55 p-5" role="status">
            <p className="flex items-center gap-2 text-lg font-black">
              <CircleAlert aria-hidden="true" className="size-5" />
              Pesanan tidak dilanjutkan
            </p>
            <p className="mt-2 font-semibold">
              Hubungi admin bila Anda memerlukan informasi lebih lanjut.
            </p>
          </section>
        ) : (
          <section className="rounded-lg border-2 border-ink bg-background p-5">
            <h3 className="text-lg font-black">Progres pengerjaan</h3>
            <div className="mt-5">
              <Timeline status={order.orderStatus} />
            </div>
          </section>
        )}

        <div className="rounded-lg border-2 border-ink bg-background p-4">
          <p className="text-sm font-bold text-muted">Pesanan dibuat</p>
          <p className="mt-1 font-bold">{formatDate(order.createdAt)}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button className="w-full" onClick={onReset} variant="secondary">
            <RefreshCcw aria-hidden="true" className="size-4" />
            Cek pesanan lain
          </Button>
          {whatsappUrl ? (
            <a
              className={buttonStyles({ className: "w-full" })}
              href={whatsappUrl}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              Hubungi admin
            </a>
          ) : (
            <span aria-disabled="true" className={buttonStyles({ className: "w-full" })}>
              WhatsApp admin belum tersedia
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function OrderTrackingForm() {
  const [result, setResult] = useState<OrderTrackingSuccess | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestLocked, setRequestLocked] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderTrackingInput>({
    resolver: zodResolver(orderTrackingSchema),
    defaultValues: { orderCode: "" },
  });

  const submitTracking = handleSubmit(async (values) => {
    if (requestLocked) return;
    setRequestLocked(true);
    setResult(null);
    setRequestError(null);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderCode: normalizeOrderCode(values.orderCode),
        }),
      });
      const payload = (await response.json()) as OrderTrackingSuccess | TrackingFailure;

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.success ? "Pesanan belum dapat diperiksa." : payload.message,
        );
      }

      setResult(payload);
      window.setTimeout(() => {
        document.getElementById("hasil-pesanan")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "Pesanan belum dapat diperiksa. Silakan coba kembali.",
      );
    } finally {
      setRequestLocked(false);
    }
  });

  const isChecking = isSubmitting || requestLocked;

  function resetTracking() {
    reset();
    setResult(null);
    setRequestError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <form
        className="brutal-card mt-8 bg-primary p-4 sm:p-7"
        noValidate
        onSubmit={submitTracking}
      >
        <div className="rounded-lg border-2 border-ink bg-surface p-4 sm:p-6">
          <div className="max-w-xl">
            <label className="block" htmlFor="tracking-order-code">
              <span className="text-sm font-black">Kode pesanan</span>
              <Input
                aria-describedby={errors.orderCode ? "tracking-order-code-error" : undefined}
                aria-invalid={Boolean(errors.orderCode)}
                autoComplete="off"
                className="mt-2 uppercase"
                id="tracking-order-code"
                maxLength={32}
                placeholder="Contoh: NT-260718-A3F7"
                {...register("orderCode")}
              />
              {errors.orderCode ? (
                <span className="mt-1 block text-sm font-bold text-red-700" id="tracking-order-code-error">
                  {errors.orderCode.message}
                </span>
              ) : null}
            </label>
          </div>

          {requestError ? (
            <div
              className="mt-5 flex items-start gap-3 rounded-lg border-2 border-ink bg-secondary/35 p-4 font-bold"
              role="alert"
            >
              <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <p>{requestError}</p>
            </div>
          ) : null}

          <Button className="mt-6 w-full sm:w-auto" disabled={isChecking} type="submit">
            {isChecking ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Search aria-hidden="true" className="size-4" />
            )}
            {isChecking ? "Memeriksa pesanan..." : "Cek Pesanan"}
          </Button>
        </div>
      </form>

      <div aria-live="polite">
        {isChecking ? <LoadingResult /> : null}
        {!isChecking && result ? (
          <TrackingResult
            onReset={resetTracking}
            order={result.order}
            whatsappUrl={result.whatsappUrl}
          />
        ) : null}
        {!isChecking && !result && !requestError ? (
          <div className="mt-8 rounded-lg border-2 border-dashed border-ink bg-surface p-6 text-center sm:p-8">
            <Search aria-hidden="true" className="mx-auto size-9 text-muted" />
            <p className="mt-3 font-black">Status pesanan akan tampil di sini</p>
            <p className="mt-1 text-sm font-semibold text-muted">
              Data pribadi selain ringkasan status tidak akan ditampilkan.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
