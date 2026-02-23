"use client";

import { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import {
  getUserStreaks,
  getMonthDailyCompletions,
  getLast14DaysCompletions,
  type DayStatus,
} from "@/lib/streak";
import { fetchStreakData, getRecentActivity, type RecentActivityItem } from "@/lib/db";
import { useLanguage } from "@/context/LanguageContext";

const CARD_STYLE = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)" as const,
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 22,
  padding: "22px 20px",
};

const GRADIENT_FULL = "linear-gradient(135deg, #f97316, #ec4899)";
const PARTIAL_BG = "rgba(249, 115, 22, 0.4)";
const TODAY = () => new Date().toISOString().slice(0, 10);

type PillState = "complete" | "partial" | "missed";

function getPillState(dateStr: string, status: DayStatus | undefined, isToday: boolean): PillState {
  if (status === "full") return "complete";
  if (status === "partial") return "partial";
  return "missed";
}

function getMonthGrid(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const daysInMonth = last.getDate();
  const startWeekday = (first.getDay() + 6) % 7;
  const grid: (string | null)[][] = [];
  let row: (string | null)[] = Array(7).fill(null);
  let col = startWeekday;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = new Date(year, month - 1, day).toISOString().slice(0, 10);
    row[col] = dateStr;
    col++;
    if (col === 7) {
      grid.push(row);
      row = Array(7).fill(null);
      col = 0;
    }
  }
  if (col > 0) grid.push(row);
  return grid;
}

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

/** Last 7 days: [6 days ago, ..., yesterday, today]. Today is rightmost. */
function getLast7Dates(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function getDayLabel(dateStr: string): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date(dateStr + "T12:00:00").getDay()];
}

function getDateNumber(dateStr: string): number {
  return new Date(dateStr + "T12:00:00").getDate();
}

/** Format date for Recent Activity: "Feb 20" */
function formatActivityDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const SECTION_HEADER_STYLE = "text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50";

export function ProgressTab() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalMornings, setTotalMornings] = useState(0);
  const [monthMap, setMonthMap] = useState<Record<string, DayStatus>>({});
  const [last7Map, setLast7Map] = useState<Record<string, DayStatus>>({});
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const todayKey = TODAY();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [streaks, fallback] = await Promise.all([
          getUserStreaks(),
          fetchStreakData().catch(() => null),
        ]);
        if (cancelled) return;
        if (streaks && (streaks.current_streak > 0 || streaks.total_completions > 0)) {
          setCurrentStreak(streaks.current_streak);
          setLongestStreak(streaks.longest_streak);
          setTotalMornings(streaks.total_completions);
        } else if (fallback) {
          setCurrentStreak(fallback.currentStreak);
          setLongestStreak(fallback.bestStreak);
          setTotalMornings(fallback.totalMornings);
        }
      } catch {
        if (!cancelled) {
          setCurrentStreak(0);
          setLongestStreak(0);
          setTotalMornings(0);
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getMonthDailyCompletions(year, month)
      .then((map) => {
        if (!cancelled) setMonthMap(map);
      })
      .catch(() => {
        if (!cancelled) setMonthMap({});
      });
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  useEffect(() => {
    let cancelled = false;
    getLast14DaysCompletions(7)
      .then((map) => {
        if (!cancelled) setLast7Map(map);
      })
      .catch(() => {
        if (!cancelled) setLast7Map({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getRecentActivity()
      .then((list) => {
        if (!cancelled) setRecentActivity(list);
      })
      .catch(() => {
        if (!cancelled) setRecentActivity([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const grid = getMonthGrid(year, month);
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const last7Dates = getLast7Dates();
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div
        className="rounded-[22px] border backdrop-blur-xl"
        style={CARD_STYLE}
      >
        <div className="mb-1 flex items-center gap-3">
          <Flame className="h-5 w-5 shrink-0 text-white/60" strokeWidth={2} />
          <h2
            className="font-bold text-white"
            style={{ fontSize: 22, margin: 0, letterSpacing: "-0.01em" }}
          >
            {t.progress_title}
          </h2>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.3)",
            margin: "2px 0 0",
            lineHeight: 1.4,
          }}
        >
          {t.progress_subtitle}
        </p>
      </div>

      {/* 1. STREAK STATS ROW */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div
          className="flex flex-col items-center justify-center rounded-[14px] border text-center"
          style={{
            ...CARD_STYLE,
            padding: "18px 12px",
            borderRadius: 14,
            opacity: currentStreak === 0 && !loading ? 0.7 : 1,
            background: currentStreak === 0 && !loading ? "rgba(255,255,255,0.02)" : CARD_STYLE.background,
            borderColor: currentStreak === 0 && !loading ? "rgba(255,255,255,0.04)" : undefined,
            boxShadow: currentStreak > 0 ? "0 0 20px rgba(249,115,22,0.1)" : undefined,
          }}
        >
          <span className="text-2xl leading-none" aria-hidden>🔥</span>
          <span className="mt-1.5 text-xl font-semibold tabular-nums text-white/95 sm:text-2xl">
            {loading ? "…" : currentStreak}
          </span>
          {currentStreak === 0 && !loading && (
            <span className="mt-1 text-[10px] font-medium text-white/40">Complete today</span>
          )}
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
            Current
          </span>
        </div>
        <div
          className="flex flex-col items-center justify-center rounded-[14px] border text-center"
          style={{
            ...CARD_STYLE,
            padding: "18px 12px",
            borderRadius: 14,
          }}
        >
          <span className="text-2xl leading-none" aria-hidden>🏆</span>
          <span className="mt-1.5 text-xl font-semibold tabular-nums text-white/95 sm:text-2xl">
            {loading ? "…" : longestStreak}
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
            Longest
          </span>
        </div>
        <div
          className="flex flex-col items-center justify-center rounded-[14px] border text-center"
          style={{
            ...CARD_STYLE,
            padding: "18px 12px",
            borderRadius: 14,
          }}
        >
          <span className="text-2xl leading-none" aria-hidden>☀️</span>
          <span className="mt-1.5 text-xl font-semibold tabular-nums text-white/95 sm:text-2xl">
            {loading ? "…" : totalMornings}
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
            Total
          </span>
        </div>
      </div>

      {/* 2. LAST 7 DAYS */}
      <div className="rounded-[22px] border backdrop-blur-xl" style={CARD_STYLE}>
        {totalMornings >= 30 ? (
          <>
            <h2 className={`mb-3 ${SECTION_HEADER_STYLE}`}>{monthLabel}</h2>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-0">
                <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-1.5">
                  {WEEKDAY_LABELS.map((label, i) => (
                    <div key={`weekday-${i}`} className="text-center font-mono text-[10px] text-white/40">
                      {label}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1 sm:gap-1.5">
                  {grid.map((row, ri) => (
                    <div key={ri} className="grid grid-cols-7 gap-1 sm:gap-1.5">
                      {row.map((dateStr, ci) => {
                        if (dateStr === null) {
                          return (
                            <div
                              key={`empty-${ri}-${ci}`}
                              className="aspect-square min-w-0 rounded-lg bg-white/[0.02]"
                            />
                          );
                        }
                        const status = monthMap[dateStr] ?? "none";
                        const isToday = dateStr === todayKey;
                        const isFuture = dateStr > todayKey;
                        return (
                          <div
                            key={dateStr}
                            className={`aspect-square min-w-0 rounded-[10px] border-2 transition-all ${
                              isToday ? "border-white/60 ring-2 ring-white/20" : "border-transparent"
                            } ${isFuture ? "opacity-40" : ""}`}
                            style={{
                              background:
                                status === "full"
                                  ? GRADIENT_FULL
                                  : status === "partial"
                                    ? PARTIAL_BG
                                    : "rgba(255,255,255,0.04)",
                            }}
                            title={dateStr}
                            aria-label={`${dateStr}${status !== "none" ? `, ${status}` : ""}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className={`mb-4 ${SECTION_HEADER_STYLE}`}>Last 7 days</h2>
            <div className="flex items-center justify-between gap-0 overflow-x-auto pb-1">
              {last7Dates.map((dateStr, idx) => {
                const status = last7Map[dateStr];
                const isToday = dateStr === todayKey;
                const state = getPillState(dateStr, status, isToday);
                const completed = state === "complete" || state === "partial";
                const todayDone = isToday && completed;
                const nextStr = idx < last7Dates.length - 1 ? last7Dates[idx + 1] : null;
                const nextStatus = nextStr ? last7Map[nextStr] : undefined;
                const nextCompleted =
                  nextStr &&
                  (getPillState(nextStr, nextStatus, nextStr === todayKey) === "complete" ||
                    getPillState(nextStr, nextStatus, nextStr === todayKey) === "partial");
                const showConnectorRight = nextStr !== null && completed && nextCompleted;

                return (
                  <div key={dateStr} className="flex flex-1 min-w-0 shrink-0 items-center justify-center gap-0">
                    {idx > 0 && (
                      <div
                        className="h-[2px] flex-1 min-w-[6px] max-w-[16px] shrink-0"
                        style={{
                          background:
                            completed &&
                            (() => {
                              const prevStr = last7Dates[idx - 1];
                              const prevStatus = last7Map[prevStr];
                              const prevCompleted =
                                getPillState(prevStr, prevStatus, prevStr === todayKey) === "complete" ||
                                getPillState(prevStr, prevStatus, prevStr === todayKey) === "partial";
                              return prevCompleted;
                            })()
                              ? "linear-gradient(90deg, rgba(249,115,22,0.5), rgba(236,72,153,0.5))"
                              : "rgba(255,255,255,0.06)",
                        }}
                        aria-hidden
                      />
                    )}
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="font-mono text-[10px] text-white/50">{getDayLabel(dateStr)}</span>
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all"
                        style={{
                          background: completed ? GRADIENT_FULL : "transparent",
                          borderStyle: completed ? "solid" : "dashed",
                          borderColor: todayDone
                            ? "transparent"
                            : isToday
                              ? "rgba(249,115,22,0.4)"
                              : completed
                                ? "transparent"
                                : "rgba(255,255,255,0.15)",
                          boxShadow: todayDone ? "0 0 12px rgba(249,115,22,0.4)" : "none",
                          color: completed ? "white" : isToday ? "rgba(249,115,22,0.6)" : "rgba(255,255,255,0.2)",
                        }}
                        title={dateStr}
                        aria-label={`${dateStr}, ${state}${isToday ? ", today" : ""}`}
                      >
                        <span className="font-mono text-sm font-semibold tabular-nums">
                          {getDateNumber(dateStr)}
                        </span>
                      </div>
                    </div>
                    {idx < last7Dates.length - 1 && (
                      <div
                        className="h-[2px] flex-1 min-w-[6px] max-w-[16px] shrink-0"
                        style={{
                          background: showConnectorRight
                            ? "linear-gradient(90deg, rgba(249,115,22,0.5), rgba(236,72,153,0.5))"
                            : "rgba(255,255,255,0.06)",
                        }}
                        aria-hidden
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 3. RECENT ACTIVITY */}
      <div className="rounded-[22px] border backdrop-blur-xl" style={CARD_STYLE}>
        <h2 className={`mb-4 ${SECTION_HEADER_STYLE}`}>Recent activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-white/40">Complete your first morning to see activity here.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentActivity.map((item) => (
              <li
                key={item.date}
                className="flex items-start gap-3 rounded-xl border px-[14px] py-3"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.04)",
                  borderRadius: 12,
                }}
              >
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: "#f97316" }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-medium text-white/90">{formatActivityDate(item.date)}</span>
                    <span className="text-xs text-white/50">{item.stepsLabel}</span>
                  </div>
                  {item.keystoneText ? (
                    <p className="mt-1 text-sm text-white/70 line-clamp-2">{item.keystoneText}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
