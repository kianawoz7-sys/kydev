import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="site-container flex min-h-[65dvh] items-center py-16">
      <div className="brutal-card mx-auto max-w-xl p-6 text-center sm:p-10">
        <FileQuestion aria-hidden="true" className="mx-auto mb-5 size-12" />
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em]">
          404
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-3 text-muted">
          Tautan yang kamu buka belum tersedia atau sudah berpindah.
        </p>
        <Link className={buttonStyles({ className: "mt-7" })} href="/">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Kembali ke beranda
        </Link>
      </div>
    </section>
  );
}
