"use client";

import {
  ClipboardList,
  LogOut,
  Settings,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/admin", label: "Pesanan", icon: ClipboardList },
  { href: "/admin/services", label: "Kelola Jasa", icon: Wrench },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminNavigation({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <div className="brutal-card overflow-hidden bg-surface">
      <div className="p-5 sm:p-6">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-muted">
          <ShieldCheck aria-hidden="true" className="size-4" />
          Sesi admin aktif
        </p>
        <p className="mt-2 break-all font-bold">{email}</p>
      </div>

      <nav aria-label="Navigasi admin" className="border-t-3 border-ink bg-background p-2">
        <div className="flex flex-wrap gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-ink px-3 py-2 text-sm font-bold transition-transform",
                  isActive
                    ? "bg-primary shadow-[3px_3px_0_var(--ink)]"
                    : "bg-surface hover:-translate-y-0.5 hover:bg-tertiary/25",
                )}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden="true" className="size-4" />
                {item.label}
              </Link>
            );
          })}

          <form action={logout} className="sm:ml-auto">
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-ink bg-secondary/35 px-3 py-2 text-sm font-bold hover:bg-secondary/55"
              type="submit"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Keluar
            </button>
          </form>
        </div>
      </nav>
    </div>
  );
}
