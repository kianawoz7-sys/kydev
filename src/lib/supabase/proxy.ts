import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

function copyAuthCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));

  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header);

    if (value) {
      target.headers.set(header, value);
    }
  }

  return target;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = getPublicSupabaseConfig();
  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const isAuthenticated = !error && Boolean(claims?.sub);
  const pathname = request.nextUrl.pathname;

  if (!isAuthenticated && pathname.startsWith("/admin")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";

    return copyAuthCookies(response, NextResponse.redirect(loginUrl));
  }

  if (isAuthenticated && pathname === "/login") {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    adminUrl.search = "";

    return copyAuthCookies(response, NextResponse.redirect(adminUrl));
  }

  return response;
}
