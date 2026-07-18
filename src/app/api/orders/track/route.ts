import { NextResponse } from "next/server";

import type { OrderTrackingSuccess } from "@/lib/order-tracking";
import { createTrackingClient } from "@/lib/supabase/service-role";
import {
  normalizeOrderCode,
  ORDER_TRACKING_NOT_FOUND_MESSAGE,
  orderTrackingSchema,
} from "@/lib/validations/order-tracking";
import { buildTrackingWhatsappUrl } from "@/lib/whatsapp";
import type { Order } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const trackingOrderSelect = `
  id,
  order_code,
  full_name,
  service_id,
  total_price,
  payment_status,
  order_status,
  created_at,
  updated_at,
  services ( name )
`;

type TrackingOrderRecord = Pick<
  Order,
  | "id"
  | "order_code"
  | "full_name"
  | "service_id"
  | "total_price"
  | "payment_status"
  | "order_status"
  | "created_at"
  | "updated_at"
> & {
  services: { name: string } | null;
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, private",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function notFound() {
  return jsonResponse(
    { success: false, message: ORDER_TRACKING_NOT_FOUND_MESSAGE },
    404,
  );
}

export async function POST(request: Request) {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return notFound();
  }

  const parsed = orderTrackingSchema.safeParse(input);
  if (!parsed.success) return notFound();

  let supabase;

  try {
    supabase = createTrackingClient();
  } catch {
    return jsonResponse(
      {
        success: false,
        message: "Layanan cek pesanan belum dikonfigurasi. Hubungi admin.",
      },
      503,
    );
  }

  const orderCode = normalizeOrderCode(parsed.data.orderCode);
  const { data, error } = await supabase
    .from("orders")
    .select(trackingOrderSelect)
    .eq("order_code", orderCode)
    .limit(1)
    .maybeSingle();

  if (error) {
    return jsonResponse(
      {
        success: false,
        message: "Pesanan belum dapat diperiksa. Silakan coba kembali.",
      },
      503,
    );
  }

  const order = data as TrackingOrderRecord | null;
  if (!order) return notFound();

  const { data: settings } = await supabase
    .from("settings")
    .select("whatsapp_number")
    .eq("id", 1)
    .maybeSingle();
  const serviceName = order.services?.name ?? "Jasa tidak tersedia";

  const response: OrderTrackingSuccess = {
    success: true,
    order: {
      orderCode: order.order_code,
      fullName: order.full_name,
      serviceName,
      totalPrice: order.total_price,
      paymentStatus: order.payment_status,
      orderStatus: order.order_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    },
    whatsappUrl: buildTrackingWhatsappUrl({
      whatsappNumber: settings?.whatsapp_number,
      orderCode: order.order_code,
      fullName: order.full_name,
      serviceName,
    }),
  };

  return jsonResponse(response);
}
