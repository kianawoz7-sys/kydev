import { redirect } from "next/navigation";

import { AdminNavigation } from "@/components/admin/admin-navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect("/login");
  }

  const email = typeof claims.email === "string" ? claims.email : "Admin";

  return (
    <section className="site-container py-10 sm:py-14">
      <AdminNavigation email={email} />
      {children}
    </section>
  );
}
