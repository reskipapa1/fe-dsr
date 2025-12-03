"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getAuth } from "@/lib/auth";

type Lokasi = { kode_lokasi: string; lokasi: string };

export default function BuatPeminjamanPage() {
  const router = useRouter();
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [kodeLokasi, setKodeLokasi] = useState("");
  const [lokasiTambahan, setLokasiTambahan] = useState("");
  const [noHp, setNoHp] = useState("");
  const [agenda, setAgenda] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("");
  const [waktuSelesai, setWaktuSelesai] = useState("");
  const [nupText, setNupText] = useState(""); // input NUP manual
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        // civitas boleh /lokasi/available
        const lokasiRes = await apiFetch("/lokasi/available", {}, token);
        setLokasiList(lokasiRes.data ?? lokasiRes);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Gagal memuat data awal");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { token } = getAuth();
    if (!token) return;

    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      // pecah NUP dari textarea jadi array
      const rawNups = nupText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (rawNups.length === 0) {
        setError("Minimal 1 NUP barang harus diisi");
        setSubmitting(false);
        return;
      }

      const payload: any = {
        no_hp: noHp,
        Agenda: agenda,
        waktuMulai,
        waktuSelesai,
        barangList: rawNups,
      };

      if (kodeLokasi) payload.kodeLokasi = kodeLokasi;
      if (lokasiTambahan) payload.lokasiTambahan = lokasiTambahan;

      const res = await apiFetch(
        "/peminjaman",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token
      );

      console.log("CREATE PEMINJAMAN RESPONSE", res);
      const created = res.data?.peminjaman ?? res.peminjaman ?? res;
      const id = created.id;
      setSuccess("Peminjaman berhasil dibuat.");
      // opsional: redirect ke list
      if (id) {
  // redirect ke halaman detail
  router.push(`/peminjaman/${id}`);
      }
      // router.push("/peminjaman");
    } catch (err: any) {
      console.error("CREATE PEMINJAMAN ERROR", err);
      setError(err.message || "Gagal membuat peminjaman");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded shadow-sm p-6 space-y-4">
        <h1 className="text-xl font-semibold">Buat Peminjaman</h1>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
            {success}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Lokasi (pilih salah satu)
            </label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={kodeLokasi}
              onChange={(e) => setKodeLokasi(e.target.value)}
            >
              <option value="">Pilih lokasi</option>
              {lokasiList.map((l) => (
                <option key={l.kode_lokasi} value={l.kode_lokasi}>
                  {l.kode_lokasi} - {l.lokasi}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Lokasi tambahan (opsional)"
              className="w-full border rounded px-3 py-2 text-sm mt-2"
              value={lokasiTambahan}
              onChange={(e) => setLokasiTambahan(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">No HP</label>
            <input
              type="tel"
              className="w-full border rounded px-3 py-2 text-sm"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Agenda</label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Waktu Mulai</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2 text-sm"
                value={waktuMulai}
                onChange={(e) => setWaktuMulai(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Waktu Selesai</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2 text-sm"
                value={waktuSelesai}
                onChange={(e) => setWaktuSelesai(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Daftar NUP Barang (pisahkan dengan koma)
            </label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Contoh: 12345, 67890, 11223"
              value={nupText}
              onChange={(e) => setNupText(e.target.value)}
              required
            />
            <p className="text-[11px] text-slate-500">
              Masukkan NUP yang ingin dipinjam. Sistem akan mengecek ketersediaan
              otomatis.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push("/peminjaman")}
              className="px-4 py-2 text-sm rounded border"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm rounded bg-slate-900 text-white disabled:opacity-60"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
