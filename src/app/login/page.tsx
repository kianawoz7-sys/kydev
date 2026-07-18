import { LockKeyhole, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Login Admin",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (claims?.sub) {
    redirect("/admin");
  }

  return (
    <section className="site-container grid min-h-[72dvh] items-center gap-8 py-12 md:grid-cols-[0.85fr_1.15fr] md:py-20">
      <div className="order-2 md:order-1">
        <span className="inline-flex rounded-full border-2 border-ink bg-primary px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">
          Akses terbatas
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-tight tracking-[-0.035em] sm:text-5xl">
          Kelola MabaTag dari satu tempat.
        </h1>
        <p className="mt-4 max-w-lg text-muted">
          Halaman ini hanya untuk admin yang akunnya dibuat manual melalui
          Supabase Authentication.
        </p>
        <div className="mt-7 flex items-start gap-3 text-sm font-semibold">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>Sesi login disimpan melalui cookie dan diverifikasi di server.</p>
        </div>
      </div>

      <div className="order-1 mx-auto w-full max-w-md md:order-2">
        <div className="brutal-card bg-tertiary p-4 sm:p-6">
          <div className="rounded-lg border-2 border-ink bg-surface p-5 sm:p-7">
            <LockKeyhole aria-hidden="true" className="size-10" />
            <p className="mt-5 text-sm font-bold uppercase tracking-[0.14em] text-muted">
              Admin MabaTag
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">
              Masuk ke dashboard
            </h2>
            <p className="mt-3 text-sm text-muted">
              Gunakan email dan password admin yang telah didaftarkan.
            </p>
            <LoginForm />
          </div>
        </div>
      </div>
    </section>
  );
}
