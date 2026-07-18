import "server-only";

import { z } from "zod";

const successPayloadSchema = z.object({
  orderCode: z.string().regex(/^NT-\d{6}-[A-Z0-9]{4}$/),
  fullName: z.string().min(1).max(120),
  serviceName: z.string().min(1).max(160),
  formattedPrice: z.string().min(1).max(40),
  whatsappNumber: z.string().max(30),
});

export type OrderSuccessPayload = z.infer<typeof successPayloadSchema>;
export const ORDER_SUCCESS_COOKIE = "mabatag-order-success";

export function encodeOrderSuccess(payload: OrderSuccessPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeOrderSuccess(value: string | undefined) {
  if (!value) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as unknown;
    const parsed = successPayloadSchema.safeParse(decoded);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
