"use client";

import { ImageIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function ServiceImage({
  imageUrl,
  name,
  className,
  eager = false,
  variant = "detail",
}: {
  imageUrl: string | null;
  name: string;
  className?: string;
  eager?: boolean;
  variant?: "card" | "detail";
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const failed = Boolean(imageUrl && failedUrl === imageUrl);
  const isCard = variant === "card";
  const containerStyles = isCard
    ? "aspect-square p-2 sm:p-4"
    : "aspect-[4/5] p-4 sm:p-6";

  if (!imageUrl || failed) {
    return (
      <div
        aria-label={`Gambar ${name} belum tersedia`}
        className={cn(
          "flex w-full items-center justify-center overflow-hidden bg-tertiary/15",
          containerStyles,
          className,
        )}
        role="img"
      >
        <div
          className={cn(
            "flex flex-col items-center rounded-lg border-2 border-ink bg-surface text-center shadow-[3px_3px_0_var(--ink)]",
            isCard ? "p-3" : "p-5",
          )}
        >
          <ImageIcon
            aria-hidden="true"
            className={isCard ? "size-7" : "size-10"}
          />
          <span className={cn("font-bold text-muted", isCard ? "mt-1 text-xs" : "mt-2 text-sm")}>
            Gambar belum tersedia
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center overflow-hidden bg-tertiary/15",
        containerStyles,
        className,
      )}
    >
      {/* Native img supports arbitrary Supabase/external URLs without domain config. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={`Contoh ${name}`}
        className="h-full w-full object-contain object-center"
        loading={eager ? "eager" : "lazy"}
        onError={() => setFailedUrl(imageUrl)}
        src={imageUrl}
      />
    </div>
  );
}
