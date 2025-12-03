"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, clearAuth } from "@/lib/auth";

type VerifikasiFilter = "" | "pending" | "diterima" | "ditolak";

export default function LaporanPage() {
  const router = useRouter();
  const [verifikasi, setVerifikasi] = useState<VerifikasiFilter>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hanya untuk kabag
  useEffect(() => {
    const { token, user } = getAuth();

    if (!token || !user) {
      clearAuth();
      router.replace("/login");
      return;
    }

    if (user.role !== "kepala_bagian_akademik") {
      router.replace("/admin/peminjaman");
    }
  }, [router]);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token } = getAuth();
      if (!token) {
        throw new Error("Sesi login habis, silakan login ulang.");
      }

      const params = new URLSearchParams();
      if (verifikasi) params.set("verifikasi", verifikasi);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const url = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      }/laporan/peminjaman/export${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Gagal mengunduh laporan");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "Laporan_Peminjaman_Selesai.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      console.error("EXPORT LAPORAN ERROR", err);
      setError(err.message || "Gagal mengunduh laporan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Laporan Peminjaman</h1>
      <p className="text-sm text-slate-600">
        Export data peminjaman yang sudah selesai ke file Excel, dengan filter
        status verifikasi dan rentang tanggal.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <form
        onSubmit={handleExport}
        className="bg-white border rounded p-4 space-y-4 text-sm max-w-xl"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="font-medium text-slate-700">
              Status Verifikasi
            </label>
            <select
              value={verifikasi}
              onChange={(e) =>
                setVerifikasi(e.target.value as VerifikasiFilter)
              }
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Semua</option>
              <option value="pending">pending</option>
              <option value="diterima">diterima</option>
              <option value="ditolak">ditolak</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-slate-700">
              Tanggal Mulai (createdAt)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-slate-700">
              Tanggal Selesai (createdAt)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-emerald-600 text-white text-sm disabled:opacity-60"
        >
          {loading ? "Mengunduh..." : "Export ke Excel"}
        </button>
      </form>
    </div>
  );
}
