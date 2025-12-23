"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardList, User2, Menu, X } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

export default function PeminjamanLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isHydrated, clearAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    if (!token || !user) {
      clearAuth();
      router.replace("/login");
      return;
    }

    if (user.role !== "civitas_faste") {
      router.replace("/admin");
      return;
    }

    apiFetch("/auth/me", {}, token).catch(() => {
      clearAuth();
      router.replace("/login");
    });
  }, [isHydrated, token, user, router, clearAuth]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto" />
          <p className="mt-2 text-sm text-slate-600">Memuat...</p>
        </div>
      </div>
    );
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleNav = (href: string) => {
    setMobileOpen(false);
    router.push(href);
  };

  const SidebarContent = (
    <>
      <div className="px-4 py-4 border-b border-slate-700">
        <h1 className="text-lg font-semibold">DSR FASTE</h1>
        <p className="text-xs text-slate-400 mt-1">
          Panel peminjaman civitas
        </p>
        {user && (
          <p className="text-[11px] text-slate-400 mt-2">
            Masuk sebagai{" "}
            <span className="font-semibold">{user.nama}</span> ({user.role})
          </p>
        )}
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1 text-sm">
        <Button
          type="button"
          onClick={() => handleNav("/peminjaman")}
          variant={isActive("/peminjaman") ? "default" : "ghost"}
          size="sm"
          className="w-full justify-start gap-2"
        >
          <ClipboardList className="w-4 h-4" />
          Peminjaman Saya
        </Button>

        <Button
          type="button"
          onClick={() => handleNav("/peminjaman/profil")}
          variant={isActive("/peminjaman/profil") ? "default" : "ghost"}
          size="sm"
          className="w-full justify-start gap-2"
        >
          <User2 className="w-4 h-4" />
          Profil
        </Button>
      </nav>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
      {/* Top bar untuk mobile */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shadow-sm md:hidden">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-emerald-600" />
          <span className="font-semibold text-slate-800">DSR FASTE</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      <div className="flex flex-1">
        {/* Sidebar desktop */}
        <motion.aside
          className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {SidebarContent}
        </motion.aside>

        {/* Sidebar mobile (drawer) */}
        {mobileOpen && (
          <motion.aside
            className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col md:hidden shadow-lg"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {SidebarContent}
          </motion.aside>
        )}

        {/* Overlay backdrop mobile */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Konten */}
        <motion.main
          className="flex-1 p-4 md:p-6 overflow-x-hidden"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </div>

      <Footer />
    </div>
  );
}
