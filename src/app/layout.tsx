import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getPublicSettings } from "@/lib/public/settings";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MabaTag",
    template: "%s | MabaTag",
  },
  description: "Jasa pembuatan name tag untuk kegiatan mahasiswa baru.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicSettings().catch(() => null);
  const websiteName = settings?.website_name?.trim() || "MabaTag";

  return (
    <html lang="id">
      <body className="flex min-h-[100dvh] flex-col antialiased">
        <SiteHeader websiteName={websiteName} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
