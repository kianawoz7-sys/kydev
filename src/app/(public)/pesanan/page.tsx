import type { Metadata } from "next";

import { OrderTrackingForm } from "@/components/public/order-tracking-form";

export const metadata: Metadata = {
  title: "Cek Status Pesanan",
  description:
    "Periksa status pembayaran dan pengerjaan pesanan MabaTag secara aman.",
};

export default function OrderStatusPage() {
  return (
    <section className="site-container py-12 sm:py-18">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">
          Tracking pesanan
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
          Cek Status Pesanan
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Masukkan kode pesanan yang kamu dapatkan setelah melakukan pemesanan.
        </p>

        <OrderTrackingForm />
      </div>
    </section>
  );
}
