"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Monitor,
  Package,
  MapPin,
  Users,
  Projector,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header"; // Asumsi ada komponen Header

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

export default function MonitoringDashboard() {
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token || !user) {
      clearAuth();
      router.replace("/login");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace("/peminjaman");
    }
  }, [user, token, router, clearAuth]);

  if (!mounted) return null;

  // --- MENU CONFIGURATION ---
  // Kita buat daftar menu card di sini biar rapi
  const menuItems = [
    {
      title: "Semua Barang",
      description: "Daftar inventaris lengkap aset fakultas.",
      icon: Package,
      color: "bg-blue-100 text-blue-600",
      href: "/admin/monitoring/semua-barang", // -> Masuk ke case "semua-barang"
      roles: ["staff", "kepala_bagian_akademik"],
    },
    {
      title: "Data Lokasi",
      description: "Daftar ruangan dan fasilitas gedung.",
      icon: MapPin,
      color: "bg-orange-100 text-orange-600",
      href: "/admin/monitoring/semua-lokasi", // -> Masuk ke case "semua-lokasi"
      roles: ["staff", "kepala_bagian_akademik"], // Staff prodi mungkin tidak perlu lihat ini? Sesuaikan.
    },
    {
      title: "Daftar Proyektor",
      description: "Khusus manajemen unit proyektor.",
      icon: Projector,
      color: "bg-purple-100 text-purple-600",
      href: "/admin/monitoring/proyektor", // -> Masuk ke case "proyektor"
      roles: [ "staff_prodi"],
    },
    {
      title: "User Staff",
      description: "Manajemen akun staff & admin.",
      icon: ShieldAlert,
      color: "bg-red-100 text-red-600",
      href: "/admin/monitoring/users-staff", // -> Masuk ke case "users-staff"
      roles: ["kepala_bagian_akademik"], // Hanya Kabag yang bisa lihat list staff
    },
    {
      title: "User Civitas",
      description: "Daftar mahasiswa & dosen peminjam.",
      icon: Users,
      color: "bg-emerald-100 text-emerald-600",
      href: "/admin/monitoring/users-civitas", // -> Masuk ke case "users-civitas"
      roles: ["staff", "kepala_bagian_akademik"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />
      
      <motion.div 
        className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        
        {/* Banner Selamat Datang */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
              <Monitor className="w-8 h-8 text-slate-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard Monitoring</h1>
              <p className="text-slate-500">
                Halo, <span className="font-semibold text-slate-700">{user?.nama}</span> ({user?.role?.replace("_", " ")})
              </p>
            </div>
          </div>
        </div>

        {/* Grid Menu Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            // Filter card berdasarkan role user
            if (!item.roles.includes(user?.role || "")) return null;

            return (
              <Card 
                key={index}
                className="group cursor-pointer hover:shadow-md transition-all duration-200 border-slate-200 hover:border-slate-300"
                onClick={() => router.push(item.href)} // INI YANG MENGHUBUNGKAN KE PAGE [SLUG]
              >
                <CardContent className="p-6 flex items-start justify-between">
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-slate-300 group-hover:text-blue-500 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </motion.div>
    </div>
  );
}
