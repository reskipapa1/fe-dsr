"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CalendarClock, 
  MapPin, 
  Box, 
  CheckCircle2, 
  QrCode, 
  ClipboardList 
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

// Tipe Data (Sesuaikan dengan BE)
type PeminjamanDetail = {
  id: number;
  Agenda: string;
  status: string;
  verifikasi: string;
  waktuMulai: string;
  waktuSelesai: string;
  lokasi?: { kode_lokasi: string; lokasi: string };
  lokasiTambahan?: string;
  items?: { id: number; barangUnit?: { nup: string; dataBarang?: { jenis_barang: string } } }[];
};

export default function PeminjamanDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, token, clearAuth } = useAuthStore();

  const [data, setData] = useState<PeminjamanDetail | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user) {
      clearAuth();
      router.replace("/login");
      return;
    }

    const load = async () => {
      try {
        const id = Number(params.id);
        const res = await apiFetch(`/peminjaman/${id}`, {}, token);

        const detail = res.data?.peminjaman ?? res.data ?? res.peminjaman ?? res;
        setData(detail);

        const qr = res.data?.qrCode ?? res.qrCode ?? null;
        if (qr) setQrCode(qr);
      } catch (err: any) {
        console.error("DETAIL ERROR", err);
        setError(err.message || "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router, params.id, token, user, clearAuth]);

  // Helper untuk warna badge status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "diterima": return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200";
      case "ditolak": return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
      case "selesai": return "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200";
      default: return "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"; // Pending/Diajukan
    }
  };

  if (loading) return <LoadingOverlay isLoading={true} message="Memuat detail..." />;

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100 mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.push("/peminjaman")}>
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 dark:bg-slate-950">
      <motion.div
        className="mx-auto max-w-5xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header Navigasi */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200 text-slate-700">
               <ClipboardList className="h-5 w-5" />
             </div>
             <div>
               <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                 Detail Peminjaman #{data.id}
               </h1>
               <p className="text-sm text-slate-500">Informasi lengkap pengajuan</p>
             </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/peminjaman")}
            className="hidden sm:flex"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Kolom Kiri: Detail Utama (Lebar 2 kolom) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-semibold">Informasi Kegiatan</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 {/* Status Badges */}
                 <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Status Peminjaman</p>
                      <Badge variant="outline" className={`px-3 py-1 capitalize ${getStatusColor(data.status)}`}>
                        {data.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Status Verifikasi</p>
                      <Badge variant="outline" className={`px-3 py-1 capitalize ${getStatusColor(data.verifikasi)}`}>
                        {data.verifikasi}
                      </Badge>
                    </div>
                 </div>

                 <Separator />

                 {/* Agenda & Lokasi */}
                 <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                         <ClipboardList className="h-4 w-4" />
                         <span className="text-xs font-medium uppercase tracking-wider">Agenda</span>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{data.Agenda}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                         <MapPin className="h-4 w-4" />
                         <span className="text-xs font-medium uppercase tracking-wider">Lokasi</span>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {data.lokasi ? `${data.lokasi.lokasi} (${data.lokasi.kode_lokasi})` : data.lokasiTambahan || "-"}
                      </p>
                    </div>
                 </div>
                 
                 {/* Waktu */}
                 <div className="grid gap-5 sm:grid-cols-2 bg-slate-50 p-4 rounded-lg border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Mulai</p>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <CalendarClock className="h-4 w-4 text-blue-600" />
                        {new Date(data.waktuMulai).toLocaleString("id-ID", { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Selesai</p>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <CalendarClock className="h-4 w-4 text-orange-600" />
                        {new Date(data.waktuSelesai).toLocaleString("id-ID", { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                 </div>
              </CardContent>
            </Card>

            {/* Card Daftar Barang */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                 <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-slate-500" />
                    <CardTitle className="text-base font-semibold">Daftar Barang Dipinjam</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 {data.items && data.items.length > 0 ? (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {data.items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {item.barangUnit?.dataBarang?.jenis_barang || "Barang"}
                                </p>
                                <p className="text-xs text-slate-500 font-mono">
                                  NUP: {item.barangUnit?.nup || "-"}
                                </p>
                              </div>
                           </div>
                           {/* Bisa tambah status kondisi barang disini nanti */}
                        </li>
                      ))}
                    </ul>
                 ) : (
                   <div className="p-8 text-center text-sm text-slate-500 italic">
                     Tidak ada barang tambahan yang dipinjam.
                   </div>
                 )}
              </CardContent>
            </Card>
          </div>

          {/* Kolom Kanan: QR Code (Sidebar) */}
          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200 overflow-hidden dark:border-slate-800">
              <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4 dark:bg-blue-900/10 dark:border-blue-900/30">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <QrCode className="h-4 w-4" />
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">Tiket Masuk</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-950">
                 {qrCode ? (
                   <>
                     <div className="rounded-lg border-2 border-slate-900 p-2 bg-white">
                        <img 
                          src={qrCode} 
                          alt="QR Code Peminjaman" 
                          className="h-40 w-40 object-contain"
                        />
                     </div>
                     <p className="mt-4 text-xs text-slate-500 max-w-[200px]">
                       Tunjukkan QR Code ini kepada petugas saat pengambilan/pengembalian barang.
                     </p>
                   </>
                 ) : (
                   <div className="flex h-40 w-full items-center justify-center rounded bg-slate-100 text-slate-400">
                     <p className="text-xs">QR Code belum tersedia</p>
                   </div>
                 )}
              </CardContent>
            </Card>

            {/* Helper Info */}
            <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-100 text-yellow-800 text-xs leading-relaxed">
               <strong>Catatan:</strong> Jika status masih <span className="underline">Pending</span>, silakan tunggu persetujuan admin. Hubungi staff jika verifikasi memakan waktu lebih dari 24 jam.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
