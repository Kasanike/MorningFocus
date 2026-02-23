"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Settings, Flame } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useStreak } from "@/context/StreakContext";

export function Header() {
  const { t } = useLanguage();
  const streak = useStreak();

  const formattedDate = useMemo(() => {
    const d = new Date();
    const weekday = t.weekdays[d.getDay()];
    const month = t.months[d.getMonth()];
    const day = d.getDate();
    return `${weekday.toUpperCase()}, ${month.toUpperCase()} ${day}`;
  }, [t]);

  const currentStreak = streak?.currentStreak ?? 0;
  const totalMornings = streak?.totalMornings ?? 0;
  const loading = streak?.loading ?? true;

  // Never show bare "0" with no context
  const showBadge = !loading;
  const neverCompleted = totalMornings === 0;
  const streakBroken = totalMornings > 0 && currentStreak === 0;

  return (
    <header
      className="sticky top-0 z-10 bg-transparent backdrop-blur-sm"
      style={{ padding: "52px 20px 16px" }}
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
          {showBadge && (
            <>
              {neverCompleted ? (
                <span
                  className="rounded-full px-3 py-1.5 text-white/70"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                  aria-label={t.streak_start}
                >
                  {t.streak_start}
                </span>
              ) : streakBroken ? (
                <span className="flex flex-col items-center gap-0.5">
                  <span
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                    aria-label={`Current streak: 0 days. ${t.streak_restart_hint}`}
                    title={t.streak_restart_hint}
                  >
                    <Flame className="h-4 w-4 shrink-0 text-[#f97316]" strokeWidth={2} />
                    <span className="tabular-nums">0</span>
                  </span>
                  <span
                    className="text-[10px] font-medium text-white/50 whitespace-nowrap"
                    style={{ maxWidth: "140px", textAlign: "center" }}
                  >
                    {t.streak_restart_hint}
                  </span>
                </span>
              ) : (
                <span
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                  aria-label={`Current streak: ${currentStreak} days`}
                >
                  <Flame className="h-4 w-4 shrink-0 text-[#f97316]" strokeWidth={2} />
                  <span className="tabular-nums">{currentStreak}</span>
                </span>
              )}
            </>
          )}
          {loading && (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white/60"
              style={{
                background: "rgba(255,255,255,0.06)",
                fontSize: 14,
                fontWeight: 600,
              }}
              aria-label="Streak"
            >
              <Flame className="h-4 w-4 shrink-0 text-[#f97316]/60" strokeWidth={2} />
              <span className="tabular-nums">…</span>
            </span>
          )}
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
