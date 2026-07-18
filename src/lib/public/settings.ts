import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

const publicSettingsSelect = `
  id,
  website_name,
  whatsapp_number,
  qris_owner_name,
  qris_image_url,
  payment_instruction,
  terms_and_conditions,
  created_at,
  updated_at
`;

export const getPublicSettings = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select(publicSettingsSelect)
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error("Pengaturan pembayaran belum dapat dimuat.", {
      cause: error,
    });
  }

  return data;
});
