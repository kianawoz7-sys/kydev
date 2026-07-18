import { ArrowLeft, CircleAlert, ClipboardList } from "lucide-react";
import Link from "next/link";

import { ServiceCard } from "@/components/public/service-card";
import { buttonStyles } from "@/components/ui/button";
import { getAllPublicServices } from "@/lib/public/services";

export const metadata = {
  title: "Daftar Jasa",
  description: "Daftar jasa name tag mahasiswa baru yang sedang aktif di MabaTag.",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  let services;

  try {
    services = await getAllPublicServices();
  } catch {
    services = null;
  }

  return (
    <section className="site-container py-14 sm:py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">
          Daftar jasa
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Pilihan Jasa Kami
        </h1>
        <p className="mt-4 text-muted">
          Silahkan pilih jasa yang sesuai dengan kebutuhan Anda.
        </p>
      </div>

      {services === null ? (
        <div className="brutal-card mt-10 flex min-h-64 flex-col items-center justify-center bg-secondary/25 p-6 text-center sm:p-10">
          <CircleAlert aria-hidden="true" className="size-12" />
          <h2 className="mt-5 text-2xl font-bold">Daftar jasa belum dapat dimuat</h2>
          <p className="mt-2 max-w-lg text-muted">
            Silakan muat ulang halaman atau coba kembali beberapa saat lagi.
          </p>
        </div>
      ) : services.length === 0 ? (
        <div className="brutal-card mt-10 flex min-h-72 flex-col items-center justify-center bg-surface p-6 text-center sm:p-10">
          <ClipboardList aria-hidden="true" className="size-12" />
          <h2 className="mt-5 text-2xl font-bold">Belum ada jasa aktif</h2>
          <p className="mt-2 max-w-lg text-muted">
            Admin belum membuka layanan untuk pemesanan saat ini.
          </p>
          <Link
            className={buttonStyles({ variant: "secondary", className: "mt-7" })}
            href="/"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Kembali ke beranda
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </section>
  );
}
