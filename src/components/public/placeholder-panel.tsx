import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type PlaceholderPanelProps = {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  icon: LucideIcon;
  accent?: "surface" | "secondary";
};

export function PlaceholderPanel({
  title,
  description,
  href,
  linkLabel,
  icon: Icon,
  accent = "surface",
}: PlaceholderPanelProps) {
  return (
    <article
      className={cn(
        "brutal-card flex flex-col p-6 sm:p-8",
        accent === "secondary" && "bg-secondary",
      )}
    >
      <Icon aria-hidden="true" className="size-9" strokeWidth={2.4} />
      <h2 className="mt-6 text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-3 flex-1 text-sm text-muted sm:text-base">{description}</p>
      <Link
        className="mt-7 inline-flex w-fit items-center gap-2 font-bold underline decoration-2 underline-offset-4"
        href={href}
      >
        {linkLabel}
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </article>
  );
}
