"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Settings, Flame } from "lucide-react";
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
    return `${weekday.toUpperCase()}, ${month.toUpperCase()} ${day}`;
  }, [t]);

  useEffect(() => {
    fetchStreakData()
      .then((data) => setStreakCount(data.currentStreak))
      .catch(() => setStreakCount(0));
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-transparent px-4 pt-3 pb-1.5 backdrop-blur-sm sm:px-8 sm:pt-4 sm:pb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 drop-shadow-md">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
            {formattedDate}
          </p>
          <h1 className="mt-0.5 font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t.greeting}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-white/90"
            style={{ background: "rgba(40, 15, 60, 0.9)" }}
            aria-label={streakCount !== null ? `Current streak: ${streakCount} days` : "Streak"}
          >
            <Flame className="h-3.5 w-3.5 shrink-0 text-[#d4856a]" strokeWidth={2} />
            <span className="font-mono text-xs font-semibold tabular-nums">{streakCount ?? "…"}</span>
          </span>
          <Link
            href="/settings"
            className="touch-target flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/70"
            aria-label={t.settings_title}
          >
            <Settings className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}
