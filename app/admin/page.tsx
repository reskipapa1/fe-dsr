"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, clearAuth } from "@/lib/auth";

export default function AdminHome() {
  const router = useRouter();

  useEffect(() => {
    const { token, user } = getAuth();

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    if (!["staff", "staff_prodi", "kepala_bagian_akademik"].includes(user.role)) {
      router.replace("/peminjaman");
      return;
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold">Admin DSR</h1>
        <p className="text-sm text-slate-600">
          Pilih menu: daftar peminjaman, verifikasi, monitoring, atau laporan.
        </p>
      </div>
    </div>
  );
}
