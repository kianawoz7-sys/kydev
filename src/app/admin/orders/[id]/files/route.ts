import { createOrderFileSignedUrl } from "@/lib/admin/storage";
import { createClient } from "@/lib/supabase/server";
import { orderIdSchema } from "@/lib/validations/orders";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const privateHeaders = {
  "Cache-Control": "private, no-store",
};

export async function GET(_request: Request, context: RouteContext) {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return Response.json(
      { message: "Unauthorized" },
      { status: 401, headers: privateHeaders },
    );
  }

  const { id } = await context.params;
  const parsedId = orderIdSchema.safeParse(id);

  if (!parsedId.success) {
    return Response.json(
      { message: "Pesanan tidak valid." },
      { status: 400, headers: privateHeaders },
    );
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("photo_path, payment_proof_path")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (error) {
    return Response.json(
      { message: "File belum dapat dimuat." },
      { status: 500, headers: privateHeaders },
    );
  }

  if (!order) {
    return Response.json(
      { message: "Pesanan tidak ditemukan." },
      { status: 404, headers: privateHeaders },
    );
  }

  const [photoUrl, paymentProofUrl] = await Promise.all([
    createOrderFileSignedUrl(supabase, order.photo_path),
    createOrderFileSignedUrl(supabase, order.payment_proof_path),
  ]);

  return Response.json(
    {
      photoUrl,
      paymentProofUrl,
      hasPhoto: Boolean(order.photo_path),
      hasPaymentProof: Boolean(order.payment_proof_path),
    },
    { headers: privateHeaders },
  );
}
