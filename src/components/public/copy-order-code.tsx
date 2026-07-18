"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CopyOrderCode({ code }: { code: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  async function copyCode() {
    let succeeded = false;

    try {
      await navigator.clipboard.writeText(code);
      succeeded = true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      succeeded = document.execCommand("copy");
      textarea.remove();
    }

    setStatus(succeeded ? "copied" : "failed");
    if (succeeded) window.setTimeout(() => setStatus("idle"), 2_000);
  }

  return (
    <div className="text-center">
      <Button aria-live="polite" onClick={copyCode} variant="secondary">
        {status === "copied" ? (
          <Check aria-hidden="true" className="size-4" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )}
        {status === "copied"
          ? "Kode tersalin"
          : status === "failed"
            ? "Coba salin lagi"
            : "Salin kode"}
      </Button>
      {status === "failed" ? (
        <p className="mt-2 text-xs font-bold text-red-700" role="status">
          Salin otomatis diblokir browser. Pilih kode di atas untuk menyalin manual.
        </p>
      ) : null}
    </div>
  );
}
