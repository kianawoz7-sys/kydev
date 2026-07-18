import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CircleAlert,
  ListChecks,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AvailabilityBadge } from "@/components/public/service-card";
import { ServiceImage } from "@/components/public/service-image";
import { buttonStyles } from "@/components/ui/button";
import { getPublicServiceBySlug } from "@/lib/public/services";
import {
  availabilityLabels,
  formatDeadline,
  formatRupiah,
  truncateDescription,
} from "@/lib/services";

type ServiceDetailProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ServiceDetailProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const service = await getPublicServiceBySlug(slug);

    if (!service) return { title: "Jasa tidak ditemukan" };

    return {
      title: service.name,
      description: truncateDescription(service.description, 155),
    };
  } catch {
    return {
      title: "Detail Jasa",
      description: "Detail jasa name tag mahasiswa baru di MabaTag.",
    };
  }
}

export default async function ServiceDetailPage({ params }: ServiceDetailProps) {
  const { slug } = await params;
  let service;

  try {
    service = await getPublicServiceBySlug(slug);
  } catch {
    return (
      <section className="site-container py-14 sm:py-20">
        <div className="brutal-card mx-auto max-w-2xl bg-secondary/25 p-6 text-center sm:p-10">
          <CircleAlert aria-hidden="true" className="mx-auto size-12" />
          <h1 className="mt-5 text-3xl font-bold">Detail jasa belum dapat dimuat</h1>
          <p className="mt-2 text-muted">
            Silakan kembali ke daftar jasa dan coba beberapa saat lagi.
          </p>
          <Link
            className={buttonStyles({ variant: "secondary", className: "mt-7" })}
            href="/jasa"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Kembali ke daftar jasa
          </Link>
        </div>
      </section>
    );
  }

  if (!service) notFound();

  const actionLabel =
    service.availability === "full"
      ? "Kuota Penuh"
      : service.availability === "closed"
        ? "Pendaftaran Ditutup"
        : "Tidak Tersedia";

  return (
    <section className="site-container py-12 sm:py-16">
      <Link
        className="inline-flex items-center gap-2 font-bold underline decoration-2 underline-offset-4"
        href="/jasa"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Kembali ke daftar jasa
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:items-start lg:justify-center">
        <div>
          <div className="brutal-card overflow-hidden bg-surface">
            <ServiceImage
              eager
              imageUrl={service.image_url}
              name={service.name}
            />
          </div>

          <div className="mt-8">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">
              Tentang jasa
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Deskripsi lengkap</h2>
            <p className="mt-4 whitespace-pre-wrap text-muted">
              {service.description?.trim() || "Detail jasa akan segera tersedia"}
            </p>
          </div>

          <div className="brutal-card mt-8 bg-primary p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <ListChecks aria-hidden="true" className="size-7" />
              <h2 className="text-2xl font-bold">Persyaratan</h2>
            </div>
            <p className="mt-4 whitespace-pre-wrap font-semibold text-muted">
              {service.requirements?.trim() ||
                "Persyaratan jasa akan diinformasikan sebelum pemesanan dibuka."}
            </p>
          </div>
        </div>

        <aside className="brutal-card bg-surface p-5 sm:p-7 lg:sticky lg:top-28">
          <AvailabilityBadge availability={service.availability} />
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-[-0.035em]">
            {service.name}
          </h1>
          <p className="mt-5 text-4xl font-black tracking-tight">
            {formatRupiah(service.price)}
          </p>

          <dl className="mt-7 space-y-4">
            <div className="rounded-lg border-2 border-ink bg-background p-4">
              <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-muted">
                <Users aria-hidden="true" className="size-4" />
                Kuota
              </dt>
              <dd className="mt-2 font-bold">
                {service.quota === null
                  ? "Tanpa batas kuota"
                  : `${service.quota} slot total`}
              </dd>
              {service.quota !== null ? (
                <p className="mt-1 text-sm font-semibold text-muted">
                  {service.remainingQuota === null
                    ? "Sisa slot belum dapat dihitung"
                    : `${service.remainingQuota} slot tersisa`}
                </p>
              ) : null}
            </div>
            <div className="rounded-lg border-2 border-ink bg-background p-4">
              <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-muted">
                <CalendarClock aria-hidden="true" className="size-4" />
                Deadline
              </dt>
              <dd className="mt-2 font-bold">{formatDeadline(service.deadline)}</dd>
            </div>
          </dl>

          <p className="mt-5 text-sm font-semibold text-muted">
            Status pemesanan: {availabilityLabels[service.availability]}.
          </p>

          {service.availability === "available" ? (
            <Link
              className={buttonStyles({ className: "mt-6 w-full" })}
              href={`/jasa/${service.slug}/pesan`}
            >
              Pesan Sekarang
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className={buttonStyles({ className: "mt-6 w-full" })}
            >
              {actionLabel}
            </span>
          )}
        </aside>
      </div>
    </section>
  );
}
