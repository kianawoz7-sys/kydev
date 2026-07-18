import type { OrderStatus, PaymentStatus } from "@/types/database";

export type PublicTrackedOrder = {
  orderCode: string;
  fullName: string;
  serviceName: string;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type OrderTrackingSuccess = {
  success: true;
  order: PublicTrackedOrder;
  whatsappUrl: string | null;
};

type StatusPresentation = {
  label: string;
  description: string;
  className: string;
};

export const PAYMENT_STATUS_PRESENTATION: Record<
  PaymentStatus,
  StatusPresentation
> = {
  menunggu: {
    label: "Menunggu verifikasi",
    description: "Bukti pembayaran sudah diterima dan sedang diperiksa admin.",
    className: "bg-primary",
  },
  lunas: {
    label: "Pembayaran terverifikasi",
    description: "Pembayaran sudah dikonfirmasi oleh admin.",
    className: "bg-emerald-300",
  },
  ditolak: {
    label: "Bukti pembayaran ditolak",
    description:
      "Bukti pembayaran belum dapat diverifikasi. Silakan hubungi admin.",
    className: "bg-secondary/55",
  },
};

export const ORDER_STATUS_PRESENTATION: Record<
  OrderStatus,
  StatusPresentation
> = {
  masuk: {
    label: "Pesanan masuk",
    description: "Pesanan sudah tersimpan dan menunggu pemeriksaan admin.",
    className: "bg-primary",
  },
  diproses: {
    label: "Sedang dikerjakan",
    description: "Data sudah diperiksa dan name tag sedang dibuat.",
    className: "bg-tertiary/45",
  },
  selesai: {
    label: "Pesanan selesai",
    description:
      "Name tag sudah selesai dibuat. Hubungi admin untuk informasi pengambilan.",
    className: "bg-emerald-300",
  },
  dibatalkan: {
    label: "Pesanan dibatalkan",
    description:
      "Pesanan ini tidak dilanjutkan. Hubungi admin untuk informasi lebih lanjut.",
    className: "bg-secondary/55",
  },
};

export const ORDER_TIMELINE = [
  { status: "masuk", label: "Pesanan masuk" },
  { status: "diproses", label: "Sedang dikerjakan" },
  { status: "selesai", label: "Selesai" },
] as const;

export function getActiveTimelineStep(status: OrderStatus) {
  if (status === "selesai") return 3;
  if (status === "diproses") return 2;
  if (status === "masuk") return 1;
  return 0;
}
