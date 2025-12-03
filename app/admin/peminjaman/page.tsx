"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getAuth, clearAuth } from "@/lib/auth";

type Peminjaman = any; // nanti bisa diketik sesuai response

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

export default function AdminPeminjamanPage() {
  const router = useRouter();
  const [data, setData] = useState<Peminjaman[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [verifFilter, setVerifFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    const { token, user } = getAuth();

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace("/peminjaman");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (verifFilter) params.set("verifikasi", verifFilter);

      const path = `/peminjaman${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const res = await apiFetch(path, {}, token);
      setData(res.data ?? res);
    } catch (err: any) {
      console.error("LOAD ADMIN PEMINJAMAN ERROR", err);
      setError(err.message || "Gagal memuat data");
      clearAuth();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadData();
  };

  const handleVerify = async (id: number, verifikasi: "diterima" | "ditolak") => {
    const { token, user } = getAuth();
    if (!token || !user) return;
    if (!["staff_prodi", "kepala_bagian_akademik"].includes(user.role)) return;

    try {
      await apiFetch(
        `/peminjaman/verify/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ verifikasi }),
        },
        token
      );
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal memverifikasi");
    }
  };

  const handleActivate = async (id: number) => {
    const { token, user } = getAuth();
    if (!token || !user) return;
    if (!["staff", "staff_prodi"].includes(user.role)) return;

    try {
      await apiFetch(
        `/peminjaman/activate/${id}`,
        {
          method: "PUT",
        },
        token
      );
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal mengaktifkan");
    }
  };

  const handleReturn = async (id: number) => {
    const { token, user } = getAuth();
    if (!token || !user) return;
    if (!["staff", "staff_prodi"].includes(user.role)) return;

    try {
      await apiFetch(
        `/peminjaman/return/${id}`,
        {
          method: "PUT",
        },
        token
      );
      await loadData();
    } catch (err: any) {
      alert(err.message || "Gagal mengembalikan");
    }
  };

  if (loading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold mb-2">Daftar Peminjaman</h1>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <form
          onSubmit={handleFilter}
          className="flex flex-wrap gap-3 items-end bg-white rounded border p-3 text-sm"
        >
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">Semua</option>
              <option value="booking">booking</option>
              <option value="aktif">aktif</option>
              <option value="selesai">selesai</option>
              <option value="batal">batal</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-slate-700">Verifikasi</label>
            <select
              value={verifFilter}
              onChange={(e) => setVerifFilter(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">Semua</option>
              <option value="pending">pending</option>
              <option value="diterima">diterima</option>
              <option value="ditolak">ditolak</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded bg-slate-900 text-white text-sm"
          >
            Terapkan
          </button>
        </form>

        <div className="overflow-x-auto rounded border bg-white">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Peminjam</th>
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
                  <td className="px-3 py-2">{p.user?.nama ?? "-"}</td>
                  <td className="px-3 py-2">{p.Agenda}</td>
                  <td className="px-3 py-2">{p.status}</td>
                  <td className="px-3 py-2">{p.verifikasi}</td>
                  <td className="px-3 py-2 space-x-1">
                    {/* Verifikasi */}
                    {p.status === "booking" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleVerify(p.id, "diterima")}
                          className="px-2 py-1 rounded bg-emerald-600 text-white"
                        >
                          Terima
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerify(p.id, "ditolak")}
                          className="px-2 py-1 rounded bg-red-600 text-white"
                        >
                          Tolak
                        </button>
                      </>
                    )}

                    {/* Aktivasi */}
                    {p.status === "booking" && p.verifikasi === "diterima" && (
                      <button
                        type="button"
                        onClick={() => handleActivate(p.id)}
                        className="px-2 py-1 rounded bg-blue-600 text-white"
                      >
                        Aktifkan
                      </button>
                    )}

                    {/* Pengembalian */}
                    {p.status === "aktif" && (
                      <button
                        type="button"
                        onClick={() => handleReturn(p.id)}
                        className="px-2 py-1 rounded bg-indigo-600 text-white"
                      >
                        Kembalikan
                      </button>
                    )}

                    {/* Scan QR */}
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/admin/scan?kode=PINJAM-${p.id}`)
                      }
                      className="px-2 py-1 rounded bg-slate-700 text-white text-xs"
                    >
                      Scan
                    </button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-4 text-center text-slate-500"
                    colSpan={6}
                  >
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
