import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import { withServiceAvailability, type PublicService } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";
import type { Database, Service } from "@/types/database";

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

async function countActiveOrders(
  supabase: SupabaseClient<Database>,
  serviceId: string,
) {
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("service_id", serviceId)
    .neq("order_status", "dibatalkan");

  return error ? null : (count ?? 0);
}

async function addAvailability(
  supabase: SupabaseClient<Database>,
  services: Service[],
) {
  const counts = await Promise.all(
    services.map((service) => countActiveOrders(supabase, service.id)),
  );

  return services.map((service, index) =>
    withServiceAvailability(service, counts[index]),
  );
}

export async function getFeaturedPublicServices(): Promise<{
  services: PublicService[];
  hasMore: boolean;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(serviceSelect)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    throw new Error("Jasa belum dapat dimuat.", { cause: error });
  }

  const services = await addAvailability(supabase, data ?? []);
  return {
    services: services.slice(0, 3),
    hasMore: services.length > 3,
  };
}

export async function getAllPublicServices(): Promise<PublicService[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(serviceSelect)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Jasa belum dapat dimuat.", { cause: error });
  }

  return addAvailability(supabase, data ?? []);
}

export const getPublicServiceBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(serviceSelect)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error("Detail jasa belum dapat dimuat.", { cause: error });
  }

  if (!data) return null;

  const activeOrderCount = await countActiveOrders(supabase, data.id);
  return withServiceAvailability(data, activeOrderCount);
});
