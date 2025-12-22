"use client";

import { motion } from "framer-motion";
import { ArrowRight, Boxes } from "lucide-react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 selection:bg-emerald-100 dark:bg-slate-950">
      <Header />

      <main className="flex flex-1 flex-col justify-center">
        <motion.section
          className="container mx-auto max-w-4xl px-4 py-20 text-center sm:py-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div 
            className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700 shadow-sm"
            whileHover={{ scale: 1.05 }}
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>Sistem Digital Pengelolaan BMN FASTE</span>
          </motion.div>

          {/* Heading */}
          <h1 className="mb-6 text-3xl font-bold uppercase tracking-widest text-slate-900 sm:text-4xl md:text-5xl lg:leading-tight dark:text-slate-50">
            Sistem Pengelolaan <span className="text-emerald-600">BMN FASTE</span>
          </h1>

          {/* Description */}
          <div className="mx-auto max-w-2xl space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
            <p>
              Platform terintegrasi untuk mempermudah peminjaman, penempatan, dan
              pemantauan Barang Milik Negara (BMN) di Fakultas Sains dan Teknologi
              UIN Sultan Syarif Kasim Riau.
            </p>
            <p>
              Transparan, akuntabel, dan efisien demi mendukung kegiatan akademik
              yang berkelanjutan.
            </p>
          </div>

          {/* Action Button */}
          <motion.div 
            className="mt-10 flex flex-col items-center gap-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="group h-12 px-8 text-base shadow-lg transition-all hover:shadow-emerald-200/50"
            >
              Masuk ke Sistem
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>

          {/* Footer Teams */}
          <div className="mt-16 border-t border-slate-200 pt-8 dark:border-slate-800">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Our Team
            </h2>
            <p className="mx-auto max-w-md text-xs text-slate-500">
              Dikelola oleh tim pengelola BMN dan pengembang sistem Fakultas Sains
              dan Teknologi.
            </p>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
