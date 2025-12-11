"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  Users,
  Package,
  MapPin,
  Settings,
  Plus,
  FileText,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

const allowedRoles = ["staff", "staff_prodi", "kepala_bagian_akademik"];

interface CardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "outline";
}

function Card({ title, description, icon, onClick, variant = "default" }: CardProps) {
  return (
    <motion.div
      className={`p-6 rounded-lg border bg-white cursor-pointer hover:shadow-md transition-shadow ${
        variant === "outline" ? "border-dashed border-slate-300" : "border-slate-200"
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${variant === "outline" ? "bg-slate-50" : "bg-sky-50"}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </motion.div>
  );
}

export default function AdminMonitoringPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuthStore = useAuthStore((s) => s.clearAuth);

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

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  const renderCards = () => {
    if (!user) return null;

    const cards: CardProps[] = [];

    if (user.role === "kepala_bagian_akademik") {
      cards.push(
        {
          title: "Daftar User Civitas",
          description: "Lihat daftar semua user civitas",
          icon: <Users className="w-5 h-5 text-sky-600" />,
          onClick: () => handleCardClick("/admin/monitoring/users-civitas"),
        },
        {
          title: "Daftar User Staff & Staff Prodi",
          description: "Lihat daftar user staff dan staff prodi",
          icon: <Users className="w-5 h-5 text-green-600" />,
          onClick: () => handleCardClick("/admin/monitoring/users-staff"),
        },
        {
          title: "Daftar Semua Barang",
          description: "Lihat daftar semua barang",
          icon: <Package className="w-5 h-5 text-purple-600" />,
          onClick: () => handleCardClick("/admin/monitoring/semua-barang"),
        },
        {
          title: "Daftar Semua Lokasi",
          description: "Lihat daftar semua lokasi",
          icon: <MapPin className="w-5 h-5 text-orange-600" />,
          onClick: () => handleCardClick("/admin/monitoring/semua-lokasi"),
        },
        {
          title: "Laporan",
          description: "Akses menu laporan",
          icon: <FileText className="w-5 h-5 text-blue-600" />,
          onClick: () => handleCardClick("/admin/laporan"),
          variant: "outline",
        }
      );
    } else if (user.role === "staff") {
      cards.push(
        {
          title: "Daftar Barang (Non-Proyektor)",
          description: "Lihat daftar barang selain proyektor",
          icon: <Package className="w-5 h-5 text-purple-600" />,
          onClick: () => handleCardClick("/admin/monitoring/barang-non-proyektor"),
        },
        {
          title: "Daftar Semua Lokasi",
          description: "Lihat daftar semua lokasi",
          icon: <MapPin className="w-5 h-5 text-orange-600" />,
          onClick: () => handleCardClick("/admin/monitoring/semua-lokasi"),
        },
        {
          title: "Peminjaman",
          description: "Akses menu peminjaman",
          icon: <Settings className="w-5 h-5 text-gray-600" />,
          onClick: () => handleCardClick("/admin/peminjaman"),
          variant: "outline",
        }
      );
    } else if (user.role === "staff_prodi") {
      cards.push(
        {
          title: "Daftar Proyektor",
          description: "Lihat daftar proyektor",
          icon: <Package className="w-5 h-5 text-red-600" />,
          onClick: () => handleCardClick("/admin/monitoring/proyektor"),
        },
        {
          title: "Scan QR",
          description: "Akses menu scan QR",
          icon: <Settings className="w-5 h-5 text-gray-600" />,
          onClick: () => handleCardClick("/admin/scan"),
          variant: "outline",
        }
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
          >
            <Card {...card} />
          </motion.div>
        ))}
      </div>
    );
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
          <Activity className="w-5 h-5 text-sky-600" />
          <h1 className="text-xl font-semibold">Monitoring</h1>
        </div>

        <div className="text-sm text-slate-600">
          Pilih menu monitoring yang ingin Anda akses
        </div>

        {renderCards()}
      </motion.div>
    </div>
  );
}
