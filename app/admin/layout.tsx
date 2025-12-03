"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuth, clearAuth } from "@/lib/auth";

const adminRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const { token, user } = getAuth();

    if (!token || !user) {
      clearAuth();
      router.replace("/login");
      return;
    }

    if (!adminRoles.includes(user.role)) {
      router.replace("/peminjaman");
    }
  }, [router]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const { user } = getAuth(); // ambil role untuk logika menu

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-700">
          <h1 className="text-lg font-semibold">Admin DSR</h1>
          <p className="text-xs text-slate-400 mt-1">
            Panel pengelolaan BMN & peminjaman
          </p>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-1 text-sm">
          {/* Semua admin: Peminjaman */}
          <button
            type="button"
            onClick={() => router.push("/admin/peminjaman")}
            className={`w-full text-left px-3 py-2 rounded ${
              isActive("/admin/peminjaman")
                ? "bg-slate-700 text-white"
                : "text-slate-200 hover:bg-slate-800"
            }`}
          >
            Peminjaman
          </button>

          {/* Hanya staff & staff_prodi: Scan QR */}
          {user &&
            (user.role === "staff" || user.role === "staff_prodi") && (
              <button
                type="button"
                onClick={() => router.push("/admin/scan")}
                className={`w-full text-left px-3 py-2 rounded ${
                  isActive("/admin/scan")
                    ? "bg-slate-700 text-white"
                    : "text-slate-200 hover:bg-slate-800"
                }`}
              >
                Scan QR
              </button>
            )}

          {/* Semua admin: Monitoring */}
          <button
            type="button"
            onClick={() => router.push("/admin/monitoring")}
            className={`w-full text-left px-3 py-2 rounded ${
              isActive("/admin/monitoring")
                ? "bg-slate-700 text-white"
                : "text-slate-200 hover:bg-slate-800"
            }`}
          >
            Monitoring
          </button>

          {/* Laporan: khusus kabag */}
          {user && user.role === "kepala_bagian_akademik" && (
            <button
              type="button"
              onClick={() => router.push("/admin/laporan")}
              className={`w-full text-left px-3 py-2 rounded ${
                isActive("/admin/laporan")
                  ? "bg-slate-700 text-white"
                  : "text-slate-200 hover:bg-slate-800"
              }`}
            >
              Laporan
            </button>
          )}

          {/* Semua admin: Profil */}
          <button
            type="button"
            onClick={() => router.push("/profil")}
            className={`w-full text-left px-3 py-2 rounded ${
              isActive("/profil")
                ? "bg-slate-700 text-white"
                : "text-slate-200 hover:bg-slate-800"
            }`}
          >
            Profil
          </button>
        </nav>

        <div className="px-4 py-3 border-t border-slate-700 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} DSR FASTe</p>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
    </div>
  );
}
