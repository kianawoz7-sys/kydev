"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { updateOrderSchema } from "@/lib/validations/orders";
import type { OrderStatus, PaymentStatus } from "@/types/database";

export type UpdateOrderInput = {
  id: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  adminNote: string;
};

export type UpdateOrderResult =
  | { success: true }
  | { success: false; message: string };

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}

export async function updateOrder(
  input: UpdateOrderInput,
): Promise<UpdateOrderResult> {
  const parsed = updateOrderSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Data perubahan tidak valid.",
    };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return {
      success: false,
      message: "Sesi admin berakhir. Silakan login kembali.",
    };
  }

  const { data: updatedOrder, error } = await supabase
    .from("orders")
    .update({
      payment_status: parsed.data.paymentStatus,
      order_status: parsed.data.orderStatus,
      admin_note: parsed.data.adminNote || null,
    })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error || !updatedOrder) {
    return {
      success: false,
      message: "Perubahan belum dapat disimpan. Silakan coba kembali.",
    };
  }

  revalidatePath("/admin");
  return { success: true };
}
