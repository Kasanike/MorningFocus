"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { fetchStreakData } from "@/lib/db";

export function Header() {
  const { t } = useLanguage();
  const [streakCount, setStreakCount] = useState<number | null>(null);

  const formattedDate = useMemo(() => {
    const d = new Date();
    const weekday = t.weekdays[d.getDay()];
    const month = t.months[d.getMonth()];
    const day = d.getDate();
    return `${weekday}, ${month} ${day}`;
  }, [t]);

  useEffect(() => {
    fetchStreakData()
      .then((data) => setStreakCount(data.currentStreak))
      .catch(() => setStreakCount(0));
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-black/20 px-4 py-8 backdrop-blur-xl sm:px-8 sm:py-10">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 drop-shadow-md">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/60">
            {formattedDate}
          </p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-app-fg sm:text-4xl">
            {t.greeting}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/60 backdrop-blur-md"
            aria-label={streakCount !== null ? `Current streak: ${streakCount} days` : "Streak"}
          >
            <span className="text-base leading-none">🔥</span>
            <span className="font-mono font-medium tabular-nums">{streakCount ?? "…"}</span>
          </span>
          <Link
            href="/settings"
            className="touch-target flex items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
            aria-label={t.settings_title}
          >
            <Settings className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}
