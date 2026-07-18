import type { Metadata } from "next";
import { ArrowRight, CircleAlert, IdCard, Search, Wrench } from "lucide-react";
import Link from "next/link";

import { PlaceholderPanel } from "@/components/public/placeholder-panel";
import { ServiceCard } from "@/components/public/service-card";
import { buttonStyles } from "@/components/ui/button";
import { getFeaturedPublicServices } from "@/lib/public/services";

export const metadata: Metadata = {
  title: {
    absolute: "MabaTag",
  },
  description:
    "Temukan jasa pembuatan name tag untuk PKKMB, ospek fakultas, dan kegiatan mahasiswa baru.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featured;

  try {
    featured = await getFeaturedPublicServices();
  } catch {
    featured = null;
  }

  return (
    <>
      <section className="site-container grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
        <div>
          <span className="inline-flex rounded-full border-2 border-ink bg-primary px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">
            Jasa name tag mahasiswa
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Name tag mahasiswa baru, tanpa format chat yang berantakan.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted sm:text-lg">
            Pilih jasa sesuai kegiatan kampus, cek harga dan kuota, lalu siapkan
            data name tag-mu dengan lebih rapi.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className={buttonStyles()} href="/jasa">
              Lihat daftar jasa
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              className={buttonStyles({ variant: "secondary" })}
              href="/pesanan"
            >
              Cek pesanan
            </Link>
          </div>
        </div>

        <div className="brutal-card relative bg-tertiary p-5 sm:p-7">
          <div className="absolute -right-3 -top-3 size-8 rounded-full border-2 border-ink bg-secondary" />
          <div className="rounded-lg border-2 border-ink bg-surface p-5 sm:p-7">
            <IdCard aria-hidden="true" className="size-10" strokeWidth={2.4} />
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em]">
              Alur pemesanan MabaTag
            </p>
            <ol className="mt-4 space-y-4 text-sm font-semibold sm:text-base">
              <li className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-primary text-xs">
                  1
                </span>
                Pilih jasa yang sesuai kegiatan kampus
              </li>
              <li className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-primary text-xs">
                  2
                </span>
                Isi data dan bayar melalui QRIS manual
              </li>
              <li className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-primary text-xs">
                  3
                </span>
                Simpan kode untuk memantau pesanan
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="border-y-3 border-ink bg-primary py-14 sm:py-20">
        <div className="site-container">
          <div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em]">
                Pilihan terbaru
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Jasa yang sedang tersedia
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold text-muted sm:text-base">
                Hanya jasa aktif yang ditampilkan. Buka detail untuk melihat
                persyaratan dan sisa slot.
              </p>
            </div>
          </div>

          {featured === null ? (
            <div className="brutal-card mt-8 flex gap-4 bg-secondary/30 p-5 sm:p-6">
              <CircleAlert aria-hidden="true" className="size-7 shrink-0" />
              <div>
                <h3 className="text-xl font-bold">Jasa belum dapat dimuat</h3>
                <p className="mt-1 text-sm font-semibold text-muted">
                  Silakan muat ulang halaman beberapa saat lagi.
                </p>
              </div>
            </div>
          ) : featured.services.length === 0 ? (
            <div className="brutal-card mt-8 bg-surface p-8 text-center sm:p-10">
              <Wrench aria-hidden="true" className="mx-auto size-11" />
              <h3 className="mt-4 text-2xl font-bold">Belum ada jasa aktif</h3>
              <p className="mx-auto mt-2 max-w-md text-muted">
                Daftar jasa akan tampil di sini setelah layanan dibuka oleh admin.
              </p>
            </div>
          ) : (
            <div>
              <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain p-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:snap-none md:grid-cols-2 md:gap-6 md:overflow-visible md:p-0">
                {featured.services.map((service, index) => (
                  <div
                    className={[
                      "min-w-0 shrink-0 basis-[78%] snap-start md:basis-auto",
                      featured.services.length === 3 && index === 2
                        ? "md:col-span-2 md:mx-auto md:w-full md:max-w-2xl"
                        : "",
                    ].join(" ")}
                    key={service.id}
                  >
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
              <div className="mt-7 flex justify-center">
                <Link
                  className={buttonStyles({ variant: "secondary" })}
                  href="/jasa"
                >
                  Lihat semua jasa
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="site-container py-14 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <PlaceholderPanel
            accent="secondary"
            description="Pelanggan nantinya dapat memeriksa progres menggunakan kode pesanan dan nomor WhatsApp."
            href="/pesanan"
            icon={Search}
            linkLabel="Buka cek pesanan"
            title="Status pesanan"
          />
        </div>
      </section>
    </>
  );
}
