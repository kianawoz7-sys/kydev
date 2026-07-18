import {
  ArrowRight,
  Check,
  CircleAlert,
  Clock3,
  MessageCircle,
  Search,
} from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import { CopyOrderCode } from "@/components/public/copy-order-code";
import { buttonStyles } from "@/components/ui/button";
import {
  decodeOrderSuccess,
  ORDER_SUCCESS_COOKIE,
} from "@/lib/order-success";
import { buildOrderWhatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Pesanan Berhasil",
  description: "Pesanan MabaTag berhasil dikirim untuk diperiksa admin.",
};

type SuccessPageProps = {
  searchParams: Promise<{ kode?: string | string[] }>;
};

export default async function OrderSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;
  const candidate = Array.isArray(params.kode) ? params.kode[0] : params.kode;
  const orderCode =
    candidate && /^NT-\d{6}-[A-Z0-9]{4}$/.test(candidate)
      ? candidate
      : null;
  const cookieStore = await cookies();
  const payload = decodeOrderSuccess(
    cookieStore.get(ORDER_SUCCESS_COOKIE)?.value,
  );
  const matchingPayload =
    payload && payload.orderCode === orderCode ? payload : null;
  const whatsappUrl = matchingPayload
    ? buildOrderWhatsappUrl({
        whatsappNumber: matchingPayload.whatsappNumber,
        orderCode: matchingPayload.orderCode,
        fullName: matchingPayload.fullName,
        serviceName: matchingPayload.serviceName,
        formattedPrice: matchingPayload.formattedPrice,
      })
    : null;

  if (!orderCode) {
    return (
      <section className="site-container py-14 sm:py-20">
        <div className="brutal-card mx-auto max-w-xl bg-secondary/25 p-6 text-center sm:p-9">
          <CircleAlert aria-hidden="true" className="mx-auto size-11" />
          <h1 className="mt-4 text-3xl font-black">Kode pesanan tidak ditemukan</h1>
          <p className="mt-2 font-semibold text-muted">
            Halaman berhasil hanya tersedia setelah pesanan selesai dikirim.
          </p>
          <Link className={buttonStyles({ className: "mt-6" })} href="/jasa">
            Lihat daftar jasa
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="site-container py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <ol className="grid grid-cols-3 gap-2" aria-label="Tahap pemesanan">
          {["Isi data", "Pembayaran", "Selesai"].map((label) => (
            <li className="text-center" key={label}>
              <span className="mx-auto flex size-9 items-center justify-center rounded-full border-2 border-ink bg-primary shadow-[2px_2px_0_var(--ink)]">
                <Check aria-hidden="true" className="size-4" />
              </span>
              <span className="mt-2 block text-xs font-bold sm:text-sm">{label}</span>
            </li>
          ))}
        </ol>

        <div className="brutal-card mt-8 overflow-hidden bg-surface text-center">
          <header className="border-b-3 border-ink bg-emerald-300 p-6 sm:p-9">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full border-3 border-ink bg-surface">
              <Check aria-hidden="true" className="size-8" />
            </span>
            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
              Pesanan berhasil dikirim
            </h1>
            <p className="mx-auto mt-3 max-w-xl font-semibold text-muted">
              Simpan kode berikut. Admin akan memeriksa data dan bukti pembayaran Anda.
            </p>
          </header>

          <div className="p-5 sm:p-8">
            <div className="rounded-lg border-3 border-ink bg-primary p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em]">Kode pesanan</p>
              <p className="mt-2 break-all text-3xl font-black tracking-tight sm:text-4xl">
                {orderCode}
              </p>
              <div className="mt-4 flex justify-center">
                <CopyOrderCode code={orderCode} />
              </div>
            </div>

            <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
              <div className="rounded-lg border-2 border-ink bg-background p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-muted">
                  <Clock3 aria-hidden="true" className="size-4" />
                  Status pembayaran
                </p>
                <p className="mt-2 text-xl font-black">Menunggu verifikasi</p>
              </div>
              <div className="rounded-lg border-2 border-ink bg-background p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-muted">
                  <Search aria-hidden="true" className="size-4" />
                  Status pesanan
                </p>
                <p className="mt-2 text-xl font-black">Masuk</p>
              </div>
            </div>

            <p className="mt-6 font-semibold text-muted">
              Pemeriksaan dilakukan manual. Kirim kode pesanan ke admin melalui WhatsApp agar mudah dicocokkan.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link
                className={buttonStyles({ variant: "secondary", className: "w-full" })}
                href="/pesanan"
              >
                <Search aria-hidden="true" className="size-4" />
                Cek pesanan
              </Link>
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
                <span
                  aria-disabled="true"
                  className={buttonStyles({ className: "w-full" })}
                >
                  WhatsApp admin belum tersedia
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
