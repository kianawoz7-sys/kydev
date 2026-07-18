"use client";

import { IdCard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { primaryNavigation } from "@/lib/constants/site";
import { cn } from "@/lib/utils";

export function SiteHeader({ websiteName }: { websiteName: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-100 border-b-3 border-ink bg-surface">
      <div className="site-container flex flex-nowrap items-center justify-between gap-2 py-3">
        <Link
          aria-label={`${websiteName} - Beranda`}
          className="flex min-w-0 flex-1 items-center gap-2 font-bold tracking-tight focus-visible:rounded-lg focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-tertiary"
          href="/"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border-2 border-ink bg-primary shadow-[2px_2px_0_var(--ink)]">
            <IdCard aria-hidden="true" className="size-5" strokeWidth={2.5} />
          </span>
          <span
            className="max-w-24 truncate text-base min-[420px]:max-w-44 min-[420px]:text-lg sm:max-w-72"
            title={websiteName}
          >
            {websiteName}
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="shrink-0">
          <ul className="flex flex-nowrap items-center justify-end gap-1.5 text-xs sm:gap-2 sm:text-sm">
            {primaryNavigation.map((item) => {
              const isActive =
                item.href === "/jasa"
                  ? pathname === "/jasa" || pathname.startsWith("/jasa/")
                  : pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border-2 border-ink px-3 py-2 font-bold leading-none transition-[transform,box-shadow,background-color] duration-200",
                      "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-tertiary",
                      "sm:px-4",
                      item.href === "/pesanan"
                        ? "bg-primary md:hover:-translate-y-0.5 md:hover:bg-primary-hover"
                        : "bg-surface md:hover:-translate-y-0.5 md:hover:bg-background",
                      isActive
                        ? "shadow-[inset_0_-4px_0_var(--tertiary),3px_3px_0_var(--ink)] md:hover:shadow-[inset_0_-4px_0_var(--tertiary),4px_4px_0_var(--ink)]"
                        : item.href === "/pesanan"
                          ? "shadow-[2px_2px_0_var(--ink)] md:hover:shadow-[3px_3px_0_var(--ink)]"
                          : "shadow-[1px_1px_0_var(--ink)] md:hover:shadow-[3px_3px_0_var(--ink)]",
                  )}
                  href={item.href}
                >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
