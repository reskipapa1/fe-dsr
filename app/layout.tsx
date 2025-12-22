import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard DSR - Sistem Peminjaman",
  description: "Sistem Peminjaman Barang & Ruangan Fakultas Sains dan Teknologi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50`}
      >
        {/* Render halaman children (Login, Admin, Peminjaman, dll) */}
        {children}

        {/* Notifikasi Global (Sonner) */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
