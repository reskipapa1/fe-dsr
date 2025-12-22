"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
    } catch (err: any) {
      console.error("FORGOT PASSWORD ERROR", err);
      setError(err.message || "Gagal mengirim email reset password. Pastikan email terdaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header />

      <LoadingOverlay isLoading={loading} message="Mengirim link reset..." />

      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="border-slate-200 shadow-xl dark:border-slate-800">
            {success ? (
              // Tampilan Sukses
              <CardContent className="flex flex-col items-center py-10 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-50">Cek Email Anda</h2>
                <p className="mb-6 max-w-xs text-sm text-slate-500">
                  Kami telah mengirimkan tautan untuk mengatur ulang kata sandi ke <strong>{email}</strong>.
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => router.push("/login")}
                >
                  Kembali ke Halaman Login
                </Button>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-4 text-xs text-slate-500 hover:text-slate-800 hover:underline"
                >
                  Kirim ulang dengan email lain
                </button>
              </CardContent>
            ) : (
              // Form Input
              <>
                <CardHeader className="space-y-1 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    <Mail className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Lupa Password?</CardTitle>
                  <CardDescription>
                    Masukkan email yang terdaftar untuk menerima instruksi reset password.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Terjadi Kesalahan</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Institusi</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@uin-suska.ac.id"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white dark:bg-slate-900"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900" 
                      disabled={loading}
                    >
                      Kirim Link Reset
                    </Button>
                  </form>
                </CardContent>

                <CardFooter className="justify-center border-t border-slate-100 py-4 dark:border-slate-800">
                  <Button 
                    variant="link" 
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400"
                    onClick={() => router.push("/login")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Login
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
