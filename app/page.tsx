"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
const router = useRouter();

useEffect(() => {
router.replace("/login");
}, [router]);

return (
<div className="min-h-screen flex items-center justify-center">
<p className="text-sm text-slate-500">Mengalihkan ke halaman login...</p>
</div>
);
}