"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch("/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
 

      console.log("LOGIN RESPONSE", res);

      // SESUAIKAN DENGAN RESPONSE BACKEND-MU
      // kalau backend kirim: { accessToken, user }
      const token =
        res.data?.accessToken ??
        res.accessToken ??
        res.token ??
        "";
      const user = res.data?.user ?? res.user;

      if (!token || !user) {
        throw new Error("Login gagal: response tidak lengkap");
      }

      saveAuth(token, {
        nik: user.nik,
        nama: user.nama,
        email: user.email,
        role: user.role,
      });

      if (user.role === "civitas_faste") {
        router.push("/peminjaman");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      console.error("LOGIN ERROR", err);
      setError(err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold text-slate-800 text-center">
          Masuk DSR
        </h1>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="w-full rounded border px-3 py-2 text-sm outline-none focus:ring focus:ring-slate-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            className="w-full rounded border px-3 py-2 text-sm outline-none focus:ring focus:ring-slate-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>
        <p className="text-xs text-slate-600 text-center">
  Belum punya akun?{" "}
  <button
    type="button"
    onClick={() => router.push("/register")}
    className="underline"
  >
    Daftar
  </button>
</p>
      </form>
    </div>
  );
}
