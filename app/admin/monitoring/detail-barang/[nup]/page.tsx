"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Save, X } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiFetch } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

interface BarangDetail {
  nup: string;
  kodeBarang: string;
  lokasi: string;
  nikUser: string;
  status: string;
  jurusan: string;
  createdAt: string;
  dataBarang: {
    kode_barang: string;
    jenis_barang: string;
    merek: string;
  };
  dataLokasi: {
    kode_lokasi: string;
    lokasi: string;
    status: string;
    jurusan: string;
  };
  user: {
    nik: string;
    nama: string;
    email: string;
  };
  peminjamanItems: any[];
  monitoring: any[];
}

export default function DetailBarangPage() {
  const params = useParams();
  const nup = params.nup as string;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  const [data, setData] = useState<BarangDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    lokasi: "",
    status: "",
    jurusan: "",
    createdAt: "",
  });
  const [latestMonitoringId, setLatestMonitoringId] = useState<string | null>(
    null
  );
  const [currentKondisi, setCurrentKondisi] = useState<string>("");
  const [options, setOptions] = useState({
    lokasi: [] as { kode_lokasi: string; lokasi: string }[],
  });
  const [showMonitoringForm, setShowMonitoringForm] = useState(false);
  const [monitoringForm, setMonitoringForm] = useState({
    waktu: new Date().toISOString().slice(0, 16),
    plt: "",
    kondisiBarang: "",
    lokasiBarang: "",
    lokasiTambahan: "",
    foto: null as File | null,
    keterangan: "",
  });
  const [submittingMonitoring, setSubmittingMonitoring] = useState(false);

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
        const res = await apiFetch(`/barangunit/${nup}`, {}, token!);
        setData(res.data);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (nup) {
      fetchData();
    }
  }, [nup, token, user, clearAuthStore, router]);

  useEffect(() => {
    if (data) {
      const latestMonitoring = data.monitoring?.sort(
        (a: any, b: any) =>
          new Date(b.waktu).getTime() - new Date(a.waktu).getTime()
      )[0];
      setLatestMonitoringId(latestMonitoring?.id || null);
      setCurrentKondisi(latestMonitoring?.kondisiBarang || "");
      setFormData({
        lokasi: data.lokasi,
        status: data.status,
        jurusan: data.jurusan,
        createdAt: new Date(data.createdAt).toISOString().slice(0, 16),
      });
    }
  }, [data]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    if (data) {
      const latestMonitoring = data.monitoring?.sort(
        (a: any, b: any) =>
          new Date(b.waktu).getTime() - new Date(a.waktu).getTime()
      )[0];
      setCurrentKondisi(latestMonitoring?.kondisiBarang || "");
      setFormData({
        lokasi: data.lokasi,
        status: data.status,
        jurusan: data.jurusan,
        createdAt: new Date(data.createdAt).toISOString().slice(0, 16),
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
      if (
        formData.createdAt !==
        new Date(data.createdAt).toISOString().slice(0, 16)
      )
        updateData.createdAt = new Date(formData.createdAt);

      // Update barangunit
      if (Object.keys(updateData).length > 0) {
        const res = await apiFetch(
          `/barangunit/${nup}`,
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

  const handleMonitoringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monitoringForm.foto) {
      setError("Foto wajib diupload");
      return;
    }

    setSubmittingMonitoring(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nupBarang", nup);
      formDataToSend.append(
        "waktu",
        new Date(monitoringForm.waktu).toISOString()
      );
      formDataToSend.append("plt", monitoringForm.plt);
      formDataToSend.append("kondisiBarang", monitoringForm.kondisiBarang);
      if (monitoringForm.lokasiBarang) {
        formDataToSend.append("lokasiBarang", monitoringForm.lokasiBarang);
      }
      if (monitoringForm.lokasiTambahan) {
        formDataToSend.append("lokasiTambahan", monitoringForm.lokasiTambahan);
      }
      formDataToSend.append("foto", monitoringForm.foto);
      if (monitoringForm.keterangan) {
        formDataToSend.append("keterangan", monitoringForm.keterangan);
      }

      const res = await fetch(`${API_BASE_URL}/monitoring`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit monitoring");
      }

      // Refetch data
      const updatedRes = await apiFetch(`/barangunit/${nup}`, {}, token!);
      setData(updatedRes.data);

      // Reset form
      setMonitoringForm({
        waktu: new Date().toISOString().slice(0, 16),
        plt: user?.nama || "",
        kondisiBarang: "",
        lokasiBarang: "",
        lokasiTambahan: "",
        foto: null,
        keterangan: "",
      });
      setShowMonitoringForm(false);
    } catch (err: any) {
      console.error("Monitoring submit error:", err);
      setError(err.message || "Failed to submit monitoring");
    } finally {
      setSubmittingMonitoring(false);
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const lokasiRes = await apiFetch("/lokasi", {}, token!);
        setOptions({
          lokasi: lokasiRes.data || [],
        });
      } catch (err) {
        console.error("Fetch options error:", err);
      }
    };

    if (token) {
      fetchOptions();
    }
  }, [token]);

  useEffect(() => {
    if (user?.nama) {
      setMonitoringForm((prev) => ({ ...prev, plt: user.nama }));
    }
  }, [user?.nama]);

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
              Detail Barang - {data.nup}
            </h1>
          </div>
          {!editMode && user?.role === "staff" ? (
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
            <h2 className="text-lg font-medium">Informasi Barang Unit</h2>
            <div className="space-y-2">
              <div>
                <strong>NUP:</strong> {data.nup}
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
                    <option value="Tersedia">Tersedia</option>
                    <option value="TidakTersedia">Tidak Tersedia</option>
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

              <div>
                <Label htmlFor="createdAt">Created At</Label>
                {editMode ? (
                  <Input
                    id="createdAt"
                    type="datetime-local"
                    value={formData.createdAt}
                    onChange={(e) =>
                      setFormData({ ...formData, createdAt: e.target.value })
                    }
                  />
                ) : (
                  <div>{new Date(data.createdAt).toLocaleString()}</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium">Data Barang</h2>
            <div className="space-y-2">
              <div>
                <strong>Kode Barang:</strong>{" "}
                {data.dataBarang?.kode_barang || "-"}
              </div>
              <div>
                <strong>Jenis Barang:</strong>{" "}
                {data.dataBarang?.jenis_barang || "-"}
              </div>
              <div>
                <strong>Merek:</strong> {data.dataBarang?.merek || "-"}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium">Lokasi</h2>
            <div className="space-y-2">
              <div>
                <Label htmlFor="lokasi">Kode Lokasi</Label>
                {editMode ? (
                  <select
                    id="lokasi"
                    value={formData.lokasi}
                    onChange={(e) =>
                      setFormData({ ...formData, lokasi: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  >
                    {options.lokasi.map((l) => (
                      <option key={l.kode_lokasi} value={l.kode_lokasi}>
                        {l.kode_lokasi} - {l.lokasi}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>{data.dataLokasi?.kode_lokasi || "-"}</div>
                )}
              </div>
              <div>
                <strong>Lokasi:</strong> {data.dataLokasi?.lokasi || "-"}
              </div>
              <div>
                <strong>Status Lokasi:</strong> {data.dataLokasi?.status || "-"}
              </div>
              <div>
                <strong>Jurusan Lokasi:</strong>{" "}
                {data.dataLokasi?.jurusan || "-"}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium">User</h2>
            <div className="space-y-2">
              <div>
                <strong>NIK:</strong> {data.user.nik}
              </div>
              <div>
                <strong>Nama:</strong> {data.user.nama}
              </div>
              <div>
                <strong>Email:</strong> {data.user.email}
              </div>
            </div>
          </div>
        </div>

        {data.peminjamanItems && data.peminjamanItems.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium">Riwayat Peminjaman</h2>
            <div className="space-y-2">
              {data.peminjamanItems.map((item: any, index: number) => (
                <div key={index} className="border-b pb-2">
                  <div>
                    <strong>Peminjaman ID:</strong> {item.peminjaman?.id}
                  </div>
                  <div>
                    <strong>Status:</strong> {item.peminjaman?.status}
                  </div>
                  <div>
                    <strong>Verifikasi:</strong> {item.peminjaman?.verifikasi}
                  </div>
                  <div>
                    <strong>Waktu Mulai:</strong>{" "}
                    {item.peminjaman?.waktuMulai
                      ? new Date(item.peminjaman.waktuMulai).toLocaleString()
                      : "-"}
                  </div>
                  <div>
                    <strong>Waktu Selesai:</strong>{" "}
                    {item.peminjaman?.waktuSelesai
                      ? new Date(item.peminjaman.waktuSelesai).toLocaleString()
                      : "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monitoring Form */}
        {user?.role === "staff" && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Tambah Monitoring</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMonitoringForm(!showMonitoringForm)}
              >
                {showMonitoringForm ? "Batal" : "Tambah Monitoring"}
              </Button>
            </div>

            {showMonitoringForm && (
              <form onSubmit={handleMonitoringSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="waktu">Waktu</Label>
                    <Input
                      id="waktu"
                      type="datetime-local"
                      value={monitoringForm.waktu}
                      onChange={(e) =>
                        setMonitoringForm({
                          ...monitoringForm,
                          waktu: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="plt">PLT (Penanggung Jawab)</Label>
                    <Input
                      id="plt"
                      value={monitoringForm.plt}
                      onChange={(e) =>
                        setMonitoringForm({
                          ...monitoringForm,
                          plt: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="kondisiBarang">Kondisi Barang</Label>
                  <select
                    id="kondisiBarang"
                    value={monitoringForm.kondisiBarang}
                    onChange={(e) =>
                      setMonitoringForm({
                        ...monitoringForm,
                        kondisiBarang: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Pilih kondisi</option>
                    <option value="baik">Baik</option>
                    <option value="rusak_ringan">Rusak Ringan</option>
                    <option value="rusak_berat">Rusak Berat</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lokasiBarang">
                      Lokasi Barang (Opsional)
                    </Label>
                    <select
                      id="lokasiBarang"
                      value={monitoringForm.lokasiBarang}
                      onChange={(e) =>
                        setMonitoringForm({
                          ...monitoringForm,
                          lokasiBarang: e.target.value,
                          lokasiTambahan: e.target.value
                            ? ""
                            : monitoringForm.lokasiTambahan,
                        })
                      }
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Pilih lokasi</option>
                      {options.lokasi.map((l) => (
                        <option key={l.kode_lokasi} value={l.kode_lokasi}>
                          {l.kode_lokasi} - {l.lokasi}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="lokasiTambahan">
                      Lokasi Tambahan (Opsional)
                    </Label>
                    <Input
                      id="lokasiTambahan"
                      value={monitoringForm.lokasiTambahan}
                      onChange={(e) =>
                        setMonitoringForm({
                          ...monitoringForm,
                          lokasiTambahan: e.target.value,
                          lokasiBarang: e.target.value
                            ? ""
                            : monitoringForm.lokasiBarang,
                        })
                      }
                      placeholder="Jika lokasi tidak terdaftar"
                      disabled={!!monitoringForm.lokasiBarang}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="foto">Foto</Label>
                  <Input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setMonitoringForm({
                        ...monitoringForm,
                        foto: e.target.files?.[0] || null,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
                  <textarea
                    id="keterangan"
                    value={monitoringForm.keterangan}
                    onChange={(e) =>
                      setMonitoringForm({
                        ...monitoringForm,
                        keterangan: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={submittingMonitoring}>
                  {submittingMonitoring ? "Mengirim..." : "Kirim Monitoring"}
                </Button>
              </form>
            )}
          </div>
        )}

        {data.monitoring && data.monitoring.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium">Riwayat Monitoring</h2>
            <div className="space-y-2">
              {data.monitoring.map((mon: any, index: number) => (
                <div key={index} className="border-b pb-2">
                  <div>
                    <strong>Waktu:</strong>{" "}
                    {new Date(mon.waktu).toLocaleString()}
                  </div>
                  <div>
                    <strong>PLT:</strong> {mon.plt}
                  </div>
                  <div>
                    <strong>Kondisi:</strong> {mon.kondisiBarang}
                  </div>
                  <div>
                    <strong>Foto:</strong>{" "}
                    {mon.foto ? (
                      <a
                        href={mon.foto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Lihat Foto
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                  <div>
                    <strong>Keterangan:</strong> {mon.keterangan || "-"}
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
