"use client";

import { motion } from "framer-motion";
import { Sunrise } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function MorningEntry() {
  const { t } = useLanguage();

  const greetingHour = new Date().getHours();
  const isMorning = greetingHour >= 4 && greetingHour < 12;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="card-glass rounded-2xl border border-white/10 px-8 py-10 shadow-2xl shadow-black/20 sm:px-10 sm:py-12 text-center"
    >
      <div className="flex justify-center mb-4">
        <Sunrise className="h-8 w-8 text-white/60" />
      </div>
      <h1 className="font-mono text-2xl font-semibold text-white/95">
        {isMorning ? "Good morning." : "Good day."}
      </h1>
      <p className="mt-2 font-mono text-xs tracking-wider text-white/50">
        Your morning protocol is ready.
      </p>
    </motion.section>
  );
}
