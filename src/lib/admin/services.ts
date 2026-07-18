import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/types/database";

const serviceSelect = `
  id,
  name,
  slug,
  description,
  price,
  quota,
  deadline,
  image_url,
  requirements,
  form_config,
  is_active,
  created_at,
  updated_at
`;

export async function getServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(serviceSelect)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Data jasa belum dapat dimuat.", { cause: error });
  }

  return data ?? [];
}
