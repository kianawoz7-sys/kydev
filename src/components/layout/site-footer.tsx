import { ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t-3 border-ink bg-ink py-7 text-surface">
      <div className="site-container flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold">Website jasa.</p>
        <p className="flex items-center gap-2 text-white/75">
          <ShieldCheck aria-hidden="true" className="size-4" />
          Bukan Punya Panitia Acara Atau Sponsor Terkait
        </p>
      </div>
    </footer>
  );
}
