import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { NextConfig } from "next";

type PublicSupabaseEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
};

function isAnonJwt(value: string) {
  try {
    const [, payload] = value.split(".");
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { role?: string };

    return claims.role === "anon";
  } catch {
    return false;
  }
}

function extractAnonJwt(value: string) {
  const jwtStart = value.indexOf("eyJ");

  if (jwtStart < 0) {
    return undefined;
  }

  const candidate = value.slice(jwtStart).trim();

  return isAnonJwt(candidate) ? candidate : undefined;
}

function readLegacySupabaseEnvironment():
  | PublicSupabaseEnvironment
  | undefined {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ) {
    return undefined;
  }

  try {
    const lines = readFileSync(resolve(process.cwd(), ".env"), "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const urlLine = lines.find((line) => /^supa\s+url\s*:/i.test(line));
    const anonKey = lines
      .map(extractAnonJwt)
      .find((candidate): candidate is string => Boolean(candidate));
    const supabaseUrl = urlLine?.slice(urlLine.indexOf(":") + 1).trim();

    if (
      !supabaseUrl ||
      !URL.canParse(supabaseUrl) ||
      !anonKey ||
      !isAnonJwt(anonKey)
    ) {
      return undefined;
    }

    return {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
    };
  } catch {
    return undefined;
  }
}

const legacySupabaseEnvironment = readLegacySupabaseEnvironment();

const nextConfig: NextConfig = {
  env: legacySupabaseEnvironment,
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
