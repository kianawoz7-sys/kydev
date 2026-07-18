import { createBrowserClient } from "@supabase/ssr";

import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export function createClient() {
  const { url, key } = getPublicSupabaseConfig();

  return createBrowserClient<Database>(url, key);
}
