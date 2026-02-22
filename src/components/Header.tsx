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
    <header
      className="sticky top-0 z-10 bg-transparent backdrop-blur-sm"
      style={{ padding: "52px 24px 16px" }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.15em]"
        style={{ color: "rgba(255,255,255,0.4)", margin: 0 }}
      >
        {formattedDate}
      </p>
      <div className="flex items-center justify-between" style={{ marginTop: 4 }}>
        <h1
          className="font-bold tracking-tight text-white"
          style={{ fontSize: 32, margin: 0, letterSpacing: "-0.02em" }}
        >
          {t.greeting}
        </h1>
        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white"
            style={{
              background: "rgba(255,255,255,0.08)",
              fontSize: 14,
              fontWeight: 600,
            }}
            aria-label={streakCount !== null ? `Current streak: ${streakCount} days` : "Streak"}
          >
            <Flame className="h-4 w-4 shrink-0 text-[#f97316]" strokeWidth={2} />
            <span className="tabular-nums">{streakCount ?? "…"}</span>
          </span>
          <Link
            href="/settings"
            className="touch-target flex items-center justify-center text-[rgba(255,255,255,0.4)] transition-colors hover:text-white/70"
            style={{ fontSize: 18 }}
            aria-label={t.settings_title}
          >
            <Settings className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}
