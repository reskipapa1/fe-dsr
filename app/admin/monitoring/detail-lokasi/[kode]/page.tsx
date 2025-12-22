"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Save, X } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

interface LokasiDetail {
  kode_lokasi: string;
  lokasi: string;
  jurusan: string;
  status: string;
  barangUnit: any[];
  peminjamanP: any[];
}

export default function DetailLokasiPage() {
  const params = useParams();
  const kode = params.kode as string;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  const [data, setData] = useState<LokasiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    lokasi: "",
    status: "",
    jurusan: "",
  });

  useEffect(() => {
    if (!token || !user) {
      clearAuthStore();
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace("/peminjaman");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/lokasi/${kode}`, {}, token!);
        setData(res.data);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (kode) {
      fetchData();
    }
  }, [kode, token, user, clearAuthStore, router]);

  useEffect(() => {
    if (data) {
      setFormData({
        lokasi: data.lokasi,
        status: data.status,
        jurusan: data.jurusan,
      });
    }
  }, [data]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    if (data) {
      setFormData({
        lokasi: data.lokasi,
        status: data.status,
        jurusan: data.jurusan,
      });
    }
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const updateData: any = {};
      if (formData.lokasi !== data.lokasi) updateData.lokasi = formData.lokasi;
      if (formData.status !== data.status) updateData.status = formData.status;
      if (formData.jurusan !== data.jurusan)
        updateData.jurusan = formData.jurusan;

      if (Object.keys(updateData).length > 0) {
        const res = await apiFetch(
          `/lokasi/${kode}`,
          {
            method: "PUT",
            body: JSON.stringify(updateData),
          },
          token!
        );
        setData(res.data);
      }

      setEditMode(false);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div>Data tidak ditemukan</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />

      <motion.div
        className="space-y-6 bg-slate-50 p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
            <h1 className="text-xl font-semibold">
              Detail Lokasi - {data.kode_lokasi}
            </h1>
          </div>
          {!editMode && user?.role !== "kepala_bagian_akademik" ? (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          ) : editMode ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="w-4 h-4 mr-1" />
                Batal
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-1" />
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium">Informasi Lokasi</h2>
            <div className="space-y-2">
              <div>
                <strong>Kode Lokasi:</strong> {data.kode_lokasi}
              </div>
              <div>
                <Label htmlFor="lokasi">Lokasi</Label>
                {editMode ? (
                  <Input
                    id="lokasi"
                    value={formData.lokasi}
                    onChange={(e) =>
                      setFormData({ ...formData, lokasi: e.target.value })
                    }
                  />
                ) : (
                  <div>{data.lokasi}</div>
                )}
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                {editMode ? (
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="dipinjam">Dipinjam</option>
                    <option value="tidakDipinjam">Tidak Dipinjam</option>
                    <option value="belumTersedia">Belum Tersedia</option>
                  </select>
                ) : (
                  <div>{data.status}</div>
                )}
              </div>
              <div>
                <Label htmlFor="jurusan">Jurusan</Label>
                {editMode ? (
                  <select
                    id="jurusan"
                    value={formData.jurusan}
                    onChange={(e) =>
                      setFormData({ ...formData, jurusan: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="umum">Umum</option>
                    <option value="tif">TIF</option>
                  </select>
                ) : (
                  <div>{data.jurusan}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {data.barangUnit && data.barangUnit.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium">Barang Unit di Lokasi Ini</h2>
            <div className="space-y-2">
              {data.barangUnit.map((item: any, index: number) => (
                <div key={index} className="border-b pb-2">
                  <div>
                    <strong>NUP:</strong> {item.nup}
                  </div>
                  <div>
                    <strong>Jenis Barang:</strong>{" "}
                    {item.dataBarang?.jenis_barang}
                  </div>
                  <div>
                    <strong>Merek:</strong> {item.dataBarang?.merek}
                  </div>
                  <div>
                    <strong>Status:</strong> {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.peminjamanP && data.peminjamanP.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium">Riwayat Peminjaman Lokasi</h2>
            <div className="space-y-2">
              {data.peminjamanP.map((pem: any, index: number) => (
                <div key={index} className="border-b pb-2">
                  <div>
                    <strong>Peminjaman ID:</strong> {pem.id}
                  </div>
                  <div>
                    <strong>User:</strong> {pem.user?.nama} ({pem.user?.nik})
                  </div>
                  <div>
                    <strong>Status:</strong> {pem.status}
                  </div>
                  <div>
                    <strong>Verifikasi:</strong> {pem.verifikasi}
                  </div>
                  <div>
                    <strong>Waktu Mulai:</strong>{" "}
                    {pem.waktuMulai
                      ? new Date(pem.waktuMulai).toLocaleString()
                      : "-"}
                  </div>
                  <div>
                    <strong>Waktu Selesai:</strong>{" "}
                    {pem.waktuSelesai
                      ? new Date(pem.waktuSelesai).toLocaleString()
                      : "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
