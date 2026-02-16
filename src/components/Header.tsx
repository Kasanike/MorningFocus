"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Settings } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Header() {
  const { t } = useLanguage();

  const formattedDate = useMemo(() => {
    const d = new Date();
    const weekday = t.weekdays[d.getDay()];
    const month = t.months[d.getMonth()];
    const day = d.getDate();
    return `${weekday}, ${month} ${day}`;
  }, [t]);

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-black/20 px-4 py-8 backdrop-blur-xl sm:px-8 sm:py-10">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/60">
            {formattedDate}
          </p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-app-fg sm:text-4xl">
            {t.greeting}
          </h1>
        </div>
        <Link
          href="/settings"
          className="flex shrink-0 items-center justify-center rounded-xl p-2.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
          aria-label={t.settings_title}
        >
          <Settings className="h-5 w-5" strokeWidth={1.5} />
        </Link>
      </div>
    </header>
  );
}
