"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getAuth, clearAuth } from "@/lib/auth";
import { Html5Qrcode } from "html5-qrcode";

export default function ScanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [kodeQR, setKodeQR] = useState("");
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingReturn, setLoadingReturn] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Isi otomatis dari query ?kode=PINJAM-{id}
  useEffect(() => {
    const kode = searchParams.get("kode");
    if (kode) setKodeQR(kode);
  }, [searchParams]);

  // Batasi akses: hanya staff & staff_prodi
  useEffect(() => {
    const { token, user } = getAuth();
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "staff" && user.role !== "staff_prodi") {
      router.replace("/peminjaman");
      return;
    }
  }, [router]);

  // Scanner kamera dengan html5-qrcode
  useEffect(() => {
    const elId = "qr-reader";
    let qr: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        qr = new Html5Qrcode(elId);
        await qr.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (decodedText) {
              setKodeQR(decodedText);
              setMessage(`QR terbaca: ${decodedText}`);
              setError(null);
            }
          },
          () => {
            // error per frame bisa diabaikan
          }
        );
      } catch (e: any) {
        console.error("HTML5 QRCode init error:", e);
        setError(
          e?.message ||
            "Gagal mengakses kamera. Pastikan izin kamera sudah diberikan."
        );
      }
    };

    // hanya jalan di browser
    if (typeof window !== "undefined") {
      startScanner();
    }

    return () => {
      if (qr) {
        qr
          .stop()
          .then(() => qr?.clear())
          .catch(() => {});
      }
    };
  }, []);

  const parseIdFromKode = () => {
    const trimmed = kodeQR.trim();
    if (!trimmed.startsWith("PINJAM-")) {
      throw new Error("Format QR tidak dikenali. Harus berupa PINJAM-{id}");
    }
    const parts = trimmed.split("-");
    const idStr = parts[1];
    const id = Number(idStr);
    if (!id || isNaN(id)) {
      throw new Error("ID peminjaman di QR tidak valid");
    }
    return id;
  };

  const callApi = async (mode: "pickup" | "return") => {
    setError(null);
    setMessage(null);

    let id: number;
    try {
      id = parseIdFromKode();
    } catch (e: any) {
      setError(e.message || "QR tidak valid");
      return;
    }

    const { token } = getAuth();
    if (!token) {
      setError("Sesi login sudah habis. Silakan login ulang.");
      clearAuth();
      router.replace("/login");
      return;
    }

    if (mode === "pickup") setLoadingPickup(true);
    else setLoadingReturn(true);

    try {
      const path =
        mode === "pickup"
          ? `/peminjaman/scan-pickup/${id}`
          : `/peminjaman/scan-return/${id}`;

      const res = await apiFetch(
        path,
        {
          method: "POST",
        },
        token
      );

      setMessage(
        mode === "pickup"
          ? `Scan pickup berhasil untuk peminjaman #${id}.`
          : `Scan return berhasil untuk peminjaman #${id}.`
      );
      console.log("SCAN RESPONSE", res);
    } catch (err: any) {
      console.error("SCAN ERROR", err);
      setError(err.message || "Gagal memproses scan");
    } finally {
      setLoadingPickup(false);
      setLoadingReturn(false);
    }
  };

  const handlePickup = async (e: React.FormEvent) => {
    e.preventDefault();
    await callApi("pickup");
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    await callApi("return");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded shadow-sm p-6 space-y-4">
        <h1 className="text-xl font-semibold">Scan QR Peminjaman</h1>
        <p className="text-sm text-slate-600">
          Arahkan kamera ke QR peminjaman atau masukkan teks (format:
          PINJAM-123), lalu pilih apakah ini scan{" "}
          <span className="font-medium">Pickup</span> atau{" "}
          <span className="font-medium">Return</span>.
        </p>

        {/* Area kamera */}
        <div
          id="qr-reader"
          className="w-full max-w-xs mx-auto border rounded mb-2"
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        {message && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
            {message}
          </p>
        )}

        <form className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Kode QR</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Contoh: PINJAM-12"
              value={kodeQR}
              onChange={(e) => setKodeQR(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePickup}
              disabled={loadingPickup || loadingReturn}
              className="px-4 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
            >
              {loadingPickup ? "Memproses Pickup..." : "Scan Pickup"}
            </button>
            <button
              onClick={handleReturn}
              disabled={loadingPickup || loadingReturn}
              className="px-4 py-2 rounded bg-indigo-600 text-white text-sm disabled:opacity-60"
            >
              {loadingReturn ? "Memproses Return..." : "Scan Return"}
            </button>
          </div>
        </form>

        <button
          onClick={() => router.push("/admin/peminjaman")}
          className="text-sm underline text-slate-700"
        >
          Kembali ke daftar peminjaman
        </button>
      </div>
    </div>
  );
}
