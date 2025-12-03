"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getAuth, clearAuth } from "@/lib/auth";

type Peminjaman = any; // nanti bisa diketik sesuai response BE

export default function PeminjamanPage() {
  const router = useRouter();
  const [data, setData] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { token, user } = getAuth();

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "civitas_faste") {
      router.replace("/admin");
      return;
    }

    const load = async () => {
      try {
        const res = await apiFetch("/peminjaman", {}, token);
        // sesuaikan bentuk response BE
        setData(res.data ?? res);
      } catch (err: any) {
        console.error("LOAD PEMINJAMAN ERROR", err);
        setError(err.message || "Gagal memuat data");
        clearAuth();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  if (loading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Peminjaman Saya</h1>
          <button
            onClick={() => router.push("/peminjaman/buat")}
            className="rounded bg-slate-900 text-white text-sm px-4 py-2 hover:bg-slate-800"
          >
            Buat Peminjaman
          </button>
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
      </div>
    </div>
  );
}
