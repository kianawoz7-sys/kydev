import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/types/database";

export type DashboardOrder = Order & {
  services: { name: string } | null;
};

export type DashboardStats = {
  total: number;
  waiting: number;
  processing: number;
  completed: number;
};

export type DashboardData = {
  orders: DashboardOrder[];
  stats: DashboardStats;
};

const orderSelect = `
  id,
  order_code,
  service_id,
  full_name,
  whatsapp,
  faculty,
  major,
  group_name,
  nim,
  birth_place,
  birth_date,
  address,
  motto,
  customer_note,
  total_price,
  photo_path,
  payment_proof_path,
  payment_status,
  order_status,
  admin_note,
  terms_accepted,
  extra_data,
  created_at,
  updated_at,
  services ( name )
`;

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const [orders, total, waiting, processing, completed] = await Promise.all([
    supabase
      .from("orders")
      .select(orderSelect)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .neq("order_status", "dibatalkan"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "menunggu")
      .neq("order_status", "dibatalkan"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("order_status", "diproses"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("order_status", "selesai"),
  ]);

  const queryError = [orders, total, waiting, processing, completed].find(
    (result) => result.error,
  )?.error;

  if (queryError) {
    throw new Error("Data dashboard belum dapat dimuat.", {
      cause: queryError,
    });
  }

  return {
    orders: (orders.data ?? []) as DashboardOrder[],
    stats: {
      total: total.count ?? 0,
      waiting: waiting.count ?? 0,
      processing: processing.count ?? 0,
      completed: completed.count ?? 0,
    },
  };
}
