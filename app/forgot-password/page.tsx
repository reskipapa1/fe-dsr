"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await apiFetch(
        "/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        }
      );

      setSuccess(true);
    } catch (err: any) {
      console.error("FORGOT PASSWORD ERROR", err);
      setError(err.message || "Gagal mengirim email reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-8 mb-20 mt-20">
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white shadow-md rounded-lg p-6 space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Mail className="w-5 h-5 text-slate-700" />
            <h1 className="text-xl font-semibold text-slate-800 text-center">
              Lupa Password
            </h1>
          </div>

          <p className="text-sm text-slate-600 text-center">
            Masukkan email Anda untuk menerima link reset password.
          </p>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
              Link reset password telah dikirim ke email Anda.
            </p>
          )}

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || success}
            className="w-full"
          >
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </Button>

          <p className="text-xs text-slate-600 text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="underline"
            >
              Kembali ke Login
            </button>
          </p>
        </motion.form>
      </div>

      <Footer />
    </div>
  );
}