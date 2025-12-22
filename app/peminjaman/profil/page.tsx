"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  LogOut, 
  Settings, 
  User, 
  Mail, 
  Briefcase, 
  CreditCard 
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

type UserProfile = {
  nik: string;
  nama: string;
  email: string;
  role: string;
};

const roleLabel: Record<string, string> = {
  civitas_faste: "Civitas FASTE",
  staff: "Staff",
  staff_prodi: "Staff Prodi",
  kepala_bagian_akademik: "Kepala Bagian Akademik",
};

export default function ProfilPage() {
  const router = useRouter();
  const { user: storeUser, clearAuth } = useAuthStore();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeUser) {
      clearAuth();
      router.replace("/login");
      return;
    }

    setUser({
      nik: storeUser.nik,
      nama: storeUser.nama,
      email: storeUser.email,
      role: storeUser.role,
    });
    setLoading(false);
  }, [storeUser, router, clearAuth]);

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
        clearAuth();
        router.replace("/login");
    }, 500);
  };

  if (loading && !user) return <LoadingOverlay isLoading={true} message="Memuat..." />;
  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-100px)]">
      <LoadingOverlay isLoading={loading} message="Memproses..." />

      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="mb-4">
           <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/peminjaman")}
              className="pl-0 hover:bg-transparent hover:text-slate-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Button>
        </div>

        <Card className="shadow-md border-slate-200 bg-white">
          <CardHeader>
            <div className="flex items-start justify-between">
               <div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                     Informasi Akun
                  </CardTitle>
                  <CardDescription>
                     Detail data diri Anda di sistem BMN FASTe.
                  </CardDescription>
               </div>
               <div className="rounded-full bg-slate-100 p-2">
                 <User className="h-6 w-6 text-slate-500" />
               </div>
            </div>
          </CardHeader>
          
          <Separator />

          <CardContent className="space-y-4 pt-6">
             <div className="grid gap-4">
                <SimpleInfoRow label="Nama Lengkap" value={user.nama} />
                <SimpleInfoRow label="Nomor Induk (NIK)" value={user.nik} />
                <SimpleInfoRow label="Email" value={user.email} />
                <SimpleInfoRow 
                  label="Role Akses" 
                  value={roleLabel[user.role] || user.role} 
                  isBadge 
                />
             </div>
          </CardContent>

          <CardFooter className="flex justify-between gap-3 bg-slate-50 px-6 py-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => router.push("/peminjaman/akun")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Kelola Akun
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-1 bg-white text-red-600 border border-red-200 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

// Komponen baris info yang sangat simple (Text only)
function SimpleInfoRow({ label, value, isBadge = false }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      {isBadge ? (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 mt-1 sm:mt-0 w-fit">
          {value}
        </span>
      ) : (
        <span className="text-sm font-semibold text-slate-900 mt-1 sm:mt-0 break-all sm:text-right">
          {value}
        </span>
      )}
    </div>
  )
}
