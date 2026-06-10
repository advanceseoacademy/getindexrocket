import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SITE_METADATA } from "@/lib/seo-metadata";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = SITE_METADATA;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--green)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#050f08]"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
