import type { Metadata } from "next";
import { ArrowLeft, CircleAlert, Clock3, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CustomerOrderForm } from "@/components/public/customer-order-form";
import { buttonStyles } from "@/components/ui/button";
import { normalizeFormConfig } from "@/lib/form-config";
import { getPublicAcademicOptions } from "@/lib/public/academic-options";
import { getPublicServiceBySlug } from "@/lib/public/services";
import { getPublicSettings } from "@/lib/public/settings";
import { availabilityLabels, formatRupiah } from "@/lib/services";

type OrderPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublicServiceBySlug(slug).catch(() => null);

  return {
    title: service ? `Pesan ${service.name}` : "Pemesanan Jasa",
    description: service
      ? `Isi data dan kirim pesanan ${service.name} melalui MabaTag.`
      : "Form pemesanan jasa MabaTag.",
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { slug } = await params;
  const [serviceResult, settingsResult, academicResult] =
    await Promise.allSettled([
      getPublicServiceBySlug(slug),
      getPublicSettings(),
      getPublicAcademicOptions(),
    ]);

  if (serviceResult.status === "rejected") {
    return (
      <section className="site-container py-14 sm:py-20">
        <div className="brutal-card mx-auto max-w-2xl bg-secondary/25 p-6 text-center sm:p-10">
          <CircleAlert aria-hidden="true" className="mx-auto size-12" />
          <h1 className="mt-4 text-3xl font-black">Form belum dapat dimuat</h1>
          <p className="mt-2 font-semibold text-muted">
            Koneksi ke data jasa sedang bermasalah. Silakan coba beberapa saat lagi.
          </p>
          <Link
            className={buttonStyles({ variant: "secondary", className: "mt-6" })}
            href={`/jasa/${slug}`}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Kembali
          </Link>
        </div>
      </section>
    );
  }

  const service = serviceResult.value;
  if (!service) notFound();

  if (service.availability !== "available") {
    const Icon = service.availability === "full" ? Users : Clock3;
    return (
      <section className="site-container py-14 sm:py-20">
        <div className="brutal-card mx-auto max-w-2xl bg-primary p-6 text-center sm:p-10">
          <Icon aria-hidden="true" className="mx-auto size-12" />
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em]">
            {service.name}
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            {availabilityLabels[service.availability]}
          </h1>
          <p className="mt-3 font-semibold text-muted">
            Form tidak dapat diisi karena pemesanan jasa ini sedang tidak tersedia.
          </p>
          <Link
            className={buttonStyles({ variant: "secondary", className: "mt-7" })}
            href={`/jasa/${service.slug}`}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Kembali ke detail jasa
          </Link>
        </div>
      </section>
    );
  }

  if (settingsResult.status === "rejected") {
    return (
      <section className="site-container py-14 sm:py-20">
        <div className="brutal-card mx-auto max-w-2xl bg-secondary/25 p-6 text-center sm:p-10">
          <CircleAlert aria-hidden="true" className="mx-auto size-12" />
          <h1 className="mt-4 text-3xl font-black">Pembayaran belum dapat dimuat</h1>
          <p className="mt-2 font-semibold text-muted">
            Pengaturan QRIS sedang tidak tersedia. Tidak ada pesanan yang dikirim.
          </p>
          <Link
            className={buttonStyles({ variant: "secondary", className: "mt-6" })}
            href={`/jasa/${service.slug}`}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Kembali ke detail jasa
          </Link>
        </div>
      </section>
    );
  }

  const settings = settingsResult.value;
  const formConfig = normalizeFormConfig(service.form_config);
  const academicOptionsRequired =
    formConfig.faculty.status !== "hidden" ||
    formConfig.major.status !== "hidden";

  if (academicResult.status === "rejected" && academicOptionsRequired) {
    return (
      <section className="site-container py-14 sm:py-20">
        <div className="brutal-card mx-auto max-w-2xl bg-secondary/25 p-6 text-center sm:p-10">
          <CircleAlert aria-hidden="true" className="mx-auto size-12" />
          <h1 className="mt-4 text-3xl font-black">
            Pilihan akademik belum dapat dimuat
          </h1>
          <p className="mt-2 font-semibold text-muted">
            Daftar fakultas dan program studi sedang tidak tersedia. Silakan
            coba beberapa saat lagi.
          </p>
          <Link
            className={buttonStyles({ variant: "secondary", className: "mt-6" })}
            href={`/jasa/${service.slug}`}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Kembali ke detail jasa
          </Link>
        </div>
      </section>
    );
  }

  const academicOptions =
    academicResult.status === "fulfilled"
      ? academicResult.value
      : { faculties: [], studyPrograms: [] };

  return (
    <section className="site-container py-10 sm:py-14">
      <CustomerOrderForm
        academicOptions={academicOptions}
        service={{
          id: service.id,
          name: service.name,
          priceLabel: formatRupiah(service.price),
          requirements: service.requirements,
          formConfig,
        }}
        settings={{
          qrisOwnerName: settings?.qris_owner_name ?? null,
          qrisImageUrl: settings?.qris_image_url ?? null,
          paymentInstruction: settings?.payment_instruction ?? null,
          termsAndConditions: settings?.terms_and_conditions ?? null,
        }}
      />
    </section>
  );
}
