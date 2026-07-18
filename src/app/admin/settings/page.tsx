import { CircleAlert, Settings } from "lucide-react";

import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminSettings } from "@/lib/admin/settings";

export const metadata = {
  title: "Pengaturan Admin",
};

export const dynamic = "force-dynamic";

function SettingsQueryError() {
  return (
    <div className="pt-10 sm:pt-14">
      <div className="brutal-card bg-secondary/25 p-6 sm:p-8">
        <CircleAlert aria-hidden="true" className="size-10" />
        <h1 className="mt-4 text-3xl font-bold">
          Pengaturan belum dapat dimuat
        </h1>
        <p className="mt-2 max-w-xl font-semibold text-muted">
          Record pengaturan utama belum tersedia atau koneksi sedang bermasalah.
          Silakan muat ulang halaman beberapa saat lagi.
        </p>
      </div>
    </div>
  );
}

export default async function AdminSettingsPage() {
  let settings;

  try {
    settings = await getAdminSettings();
  } catch {
    settings = null;
  }

  if (!settings) return <SettingsQueryError />;

  return (
    <div className="pt-10 sm:pt-14">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border-2 border-ink bg-primary shadow-[3px_3px_0_var(--ink)]">
          <Settings aria-hidden="true" className="size-6" />
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">
            Area kerja
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
            Pengaturan
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            Kelola identitas website, kontak admin, QRIS, dan ketentuan pemesanan.
          </p>
        </div>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
