"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [nik, setNik] = useState("");
  const [nomorIT, setNomorIT] = useState("");
  const [email, setEmail] = useState("");
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const body = {
        nik,
        nomor_identitas_tunggal: nomorIT,
        email,
        password,
        nama,
        // role biarkan kosong: backend bisa set default (mis. civitas_faste)
      };

      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });

      console.log("REGISTER RESPONSE", res);

      setSuccess("Registrasi berhasil, silakan login.");
      // opsional redirect otomatis
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      console.error("REGISTER ERROR", err);
      setError(err.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold text-slate-800 text-center">
          Register DSR
        </h1>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
            {success}
          </p>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">NIK</label>
          <input
            type="text"
            className="w-full rounded border px-3 py-2 text-sm"
            value={nik}
            onChange={(e) => setNik(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Nomor Identitas Tunggal
          </label>
          <input
            type="text"
            className="w-full rounded border px-3 py-2 text-sm"
            value={nomorIT}
            onChange={(e) => setNomorIT(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Nama</label>
          <input
            type="text"
            className="w-full rounded border px-3 py-2 text-sm"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="w-full rounded border px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            className="w-full rounded border px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="text-[11px] text-slate-500">
            Minimal 8 karakter dan mengandung huruf besar, huruf kecil, dan angka.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Mendaftar..." : "Daftar"}
        </button>

        <p className="text-xs text-slate-600 text-center">
          Sudah punya akun?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="underline"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
