import "server-only";

import { SETTINGS_ID } from "@/lib/constants/settings";
import { createClient } from "@/lib/supabase/server";
import type { Settings } from "@/types/database";

export const adminSettingsSelect = `
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

export async function getAdminSettings(): Promise<Settings | null> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    throw new Error("Sesi admin tidak tersedia.");
  }

  const { data, error } = await supabase
    .from("settings")
    .select(adminSettingsSelect)
    .eq("id", SETTINGS_ID)
    .maybeSingle();

  if (error) {
    throw new Error("Pengaturan belum dapat dimuat.");
  }

  return data;
}
