"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardList, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

type Peminjaman = any; // sesuaikan dengan tipe BE
type Barang = any;
type Lokasi = any;

export default function PeminjamanPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  const [data, setData] = useState<Peminjaman[]>([]);
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user) {
      clearAuthStore();
      router.replace("/login");
      return;
    }

    if (user.role !== "civitas_faste") {
      router.replace("/admin");
      return;
    }

    const load = async () => {
      try {
        const peminjamanRes = await apiFetch("/peminjaman", {}, token);
        setData(peminjamanRes.data ?? peminjamanRes);

        const barangRes = await apiFetch("/barangunit/available-for-peminjaman", {}, token);
        setBarangList(barangRes.data ?? barangRes);

        const lokasiRes = await apiFetch("/lokasi", {}, token);
        setLokasiList(lokasiRes.data ?? lokasiRes);
      } catch (err: any) {
        console.error("LOAD DATA ERROR", err);
        setError(err.message || "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router, token, user, clearAuthStore]);

  if (loading) return <div className="p-6">Memuat...</div>;

  return (
    <motion.div
      className="min-h-screen bg-slate-50 p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-slate-700" />
            <h1 className="text-xl font-semibold">Peminjaman Saya</h1>
          </div>
          <Button
            onClick={() => router.push("/peminjaman/buat")}
            size="sm"
            className="inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Buat Peminjaman
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        {data.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada peminjaman.</p>
        ) : (
          <div className="overflow-x-auto rounded border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Agenda</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Verifikasi</th>
                  <th className="px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p: any) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">{p.id}</td>
                    <td className="px-3 py-2">{p.Agenda}</td>
                    <td className="px-3 py-2">{p.status}</td>
                    <td className="px-3 py-2">{p.verifikasi}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => router.push(`/peminjaman/${p.id}`)}
                        className="text-xs text-slate-900 underline"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Daftar Barang Unit</h2>
          {barangList.length === 0 ? (
            <p className="text-sm text-slate-500">Tidak ada data barang.</p>
          ) : (
            <div className="overflow-x-auto rounded border bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-left">
                  <tr>
                    <th className="px-3 py-2">NUP</th>
                    <th className="px-3 py-2">Jenis Barang</th>
                    <th className="px-3 py-2">Merek</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {barangList.map((b: any) => (
                    <tr key={b.nup} className="border-t">
                      <td className="px-3 py-2">{b.nup}</td>
                      <td className="px-3 py-2">{b.dataBarang?.jenis_barang}</td>
                      <td className="px-3 py-2">{b.dataBarang?.merek}</td>
                      <td className="px-3 py-2">{b.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Daftar Lokasi</h2>
          {lokasiList.length === 0 ? (
            <p className="text-sm text-slate-500">Tidak ada data lokasi.</p>
          ) : (
            <div className="overflow-x-auto rounded border bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-left">
                  <tr>
                    <th className="px-3 py-2">Kode Lokasi</th>
                    <th className="px-3 py-2">Lokasi</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lokasiList.map((l: any) => (
                    <tr key={l.kode_lokasi} className="border-t">
                      <td className="px-3 py-2">{l.kode_lokasi}</td>
                      <td className="px-3 py-2">{l.lokasi}</td>
                      <td className="px-3 py-2">{l.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
