"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";

const allowedRoles = ["staff"];

export default function TambahLokasiPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

  const [formData, setFormData] = useState({
    kode_lokasi: "",
    lokasi: "",
    status: "tidakDipinjam",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, [router, token, user, clearAuthStore]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch(
        "/lokasi",
        {
          method: "POST",
          body: JSON.stringify({
            kode_lokasi: formData.kode_lokasi,
            lokasi: formData.lokasi,
            status: formData.status,
          }),
        },
        token!
      );

      if (!res.success) {
        throw new Error(res.message || "Failed to create lokasi");
      }

      // Success, redirect back
      router.push("/admin/monitoring/semua-lokasi");
    } catch (err: any) {
      console.error("Submit error:", err);
      let errorMessage = err.message || "Terjadi kesalahan";
      if (err.data && err.data.errors) {
        errorMessage = err.data.errors
          .map((e: any) => `${e.field}: ${e.message}`)
          .join(", ");
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />

      <motion.div
        className="space-y-6 bg-slate-50 p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/monitoring")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <h1 className="text-xl font-semibold">Tambah Lokasi</h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium">Data Lokasi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kode_lokasi">Kode Lokasi</Label>
                <Input
                  id="kode_lokasi"
                  value={formData.kode_lokasi}
                  onChange={(e) =>
                    handleInputChange("kode_lokasi", e.target.value)
                  }
                  minLength={3}
                  maxLength={50}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lokasi">Lokasi</Label>
                <Input
                  id="lokasi"
                  value={formData.lokasi}
                  onChange={(e) => handleInputChange("lokasi", e.target.value)}
                  minLength={3}
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="tidakDipinjam">Tidak Dipinjam</option>
                  <option value="dipinjam">Dipinjam</option>
                  <option value="belumTersedia">Belum Tersedia</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-1" />
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
