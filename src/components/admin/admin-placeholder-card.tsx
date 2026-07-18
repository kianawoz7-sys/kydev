import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminPlaceholderCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: "primary" | "secondary" | "tertiary";
};

const accentClasses = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
};

export function AdminPlaceholderCard({
  title,
  description,
  icon: Icon,
  accent,
}: AdminPlaceholderCardProps) {
  return (
    <article className={cn("brutal-card p-5 sm:p-6", accentClasses[accent])}>
      <Icon aria-hidden="true" className="size-8" strokeWidth={2.4} />
      <h2 className="mt-7 text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm font-medium text-ink/75">{description}</p>
    </article>
  );
}
