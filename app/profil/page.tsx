"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, clearAuth } from "@/lib/auth";

type UserProfile = {
  nik: string;
  nama: string;
  email: string;
  role: string;
};

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { token, user } = getAuth();

    if (!token || !user) {
      clearAuth();
      router.replace("/login");
      return;
    }

    setUser({
      nik: user.nik,
      nama: user.nama,
      email: user.email,
      role: user.role,
    });
    setLoading(false);
  }, [router]);

  if (loading) return <div className="p-6">Memuat...</div>;

  if (!user) return null;

  const roleLabel: Record<string, string> = {
    civitas_faste: "Civitas FASTe",
    staff: "Staff",
    staff_prodi: "Staff Prodi",
    kepala_bagian_akademik: "Kepala Bagian Akademik",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Profil</h1>
          <button
            onClick={() =>
              user.role === "civitas_faste"
                ? router.push("/peminjaman")
                : router.push("/admin/peminjaman")
            }
            className="text-sm underline"
          >
            Kembali
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium">NIK: </span>
            <span>{user.nik}</span>
          </div>
          <div>
            <span className="font-medium">Nama: </span>
            <span>{user.nama}</span>
          </div>
          <div>
            <span className="font-medium">Email: </span>
            <span>{user.email}</span>
          </div>
          <div>
            <span className="font-medium">Role: </span>
            <span>{roleLabel[user.role] ?? user.role}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Pengubahan data profil (nama, email, password) bisa ditambahkan
          belakangan lewat endpoint khusus update user.
        </p>
      </div>
    </div>
  );
}
