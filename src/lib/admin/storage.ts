import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { ORDER_FILES_BUCKET } from "@/lib/constants/orders";
import type { Database } from "@/types/database";

function getStorageLocations(reference: string) {
  const normalized = reference.trim().replace(/^\/+/, "");

  if (!normalized || normalized.includes("://")) {
    return [];
  }

  const bucketPrefix = `${ORDER_FILES_BUCKET}/`;
  const defaultPath = normalized.startsWith(bucketPrefix)
    ? normalized.slice(bucketPrefix.length)
    : normalized;
  const [possibleBucket, ...pathSegments] = normalized.split("/");
  const locations = [
    {
      bucket: ORDER_FILES_BUCKET,
      path: defaultPath,
    },
  ];

  if (
    possibleBucket !== ORDER_FILES_BUCKET &&
    pathSegments.length > 0
  ) {
    locations.unshift({
      bucket: possibleBucket,
      path: pathSegments.join("/"),
    });
  }

  return locations;
}

export async function createOrderFileSignedUrl(
  supabase: SupabaseClient<Database>,
  reference: string | null,
) {
  if (!reference) {
    return null;
  }

  const locations = getStorageLocations(reference);

  for (const location of locations) {
    const { data, error } = await supabase.storage
      .from(location.bucket)
      .createSignedUrl(location.path, 5 * 60);

    if (!error) {
      return data.signedUrl;
    }
  }

  return null;
}
