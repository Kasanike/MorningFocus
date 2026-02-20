"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { fetchHistoryData, type HistoryDay } from "@/lib/db";

type Filter = "this_week" | "7" | "30";

const FILTER_LABELS: Record<Filter, string> = {
  this_week: "This week",
  "7": "Last 7 days",
  "30": "Last 30 days",
};

const FILTER_LIMITS: Record<Filter, number> = {
  this_week: 7,
  "7": 7,
  "30": 30,
};

function formatDayHeader(dateStr: string): string {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (dateStr === todayKey) return "TODAY";
  if (dateStr === yesterdayKey) return "YESTERDAY";

  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMinutes(seconds: number): string {
  const m = Math.round(seconds / 60);
  return `${m} min`;
}

function filterToThisWeek(days: HistoryDay[]): HistoryDay[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date();
  monday.setDate(today.getDate() - mondayOffset);
  const mondayKey = monday.toISOString().slice(0, 10);
  return days.filter((d) => d.date >= mondayKey);
}

function isStreakDay(days: HistoryDay[], date: string): boolean {
  const todayKey = new Date().toISOString().slice(0, 10);
  const sorted = days
    .filter((d) => d.session || d.oneThing)
    .map((d) => d.date)
    .sort((a, b) => b.localeCompare(a));

  if (sorted.length === 0) return false;

  let streakDates = new Set<string>();
  for (const dt of sorted) {
    if (dt > todayKey) continue;
    const prev = streakDates.size === 0 ? todayKey : undefined;
    if (streakDates.size === 0 && dt === todayKey) {
      streakDates.add(dt);
    } else if (streakDates.size === 0 && dt !== todayKey) {
      break;
    } else {
      const lastInStreak = Array.from(streakDates).sort((a, b) => a.localeCompare(b))[0];
      const expected = new Date(lastInStreak + "T12:00:00");
      expected.setDate(expected.getDate() - 1);
      if (dt === expected.toISOString().slice(0, 10)) {
        streakDates.add(dt);
      } else {
        break;
      }
    }
  }
  return streakDates.has(date);
}

export function HistoryCard() {
  const [allDays, setAllDays] = useState<HistoryDay[]>([]);
  const [filter, setFilter] = useState<Filter>("this_week");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);

  const load = useCallback(async (limit: number) => {
    setLoading(true);
    try {
      const data = await fetchHistoryData(limit);
      setAllDays(data);
    } catch {
      setAllDays([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(FILTER_LIMITS[filter]);
    setVisibleCount(5);
  }, [filter, load]);

  const days = filter === "this_week" ? filterToThisWeek(allDays) : allDays;
  const visible = days.slice(0, visibleCount);
  const hasMore = days.length > visibleCount;

  return (
    <div
      className="shadow-2xl shadow-black/20"
      style={{ background: "rgba(30, 15, 25, 0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 24px" }}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xl font-semibold text-white/95">History</h2>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-white/50 transition-colors hover:bg-white/10 hover:text-white/70"
          >
            {FILTER_LABELS[filter]}
            <ChevronDown className="h-3 w-3" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[130px] overflow-hidden rounded-lg border border-white/10 bg-[#1e0f19]/95 shadow-xl backdrop-blur-xl">
                {(Object.keys(FILTER_LABELS) as Filter[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setFilter(key);
                      setShowDropdown(false);
                    }}
                    className={`block w-full px-4 py-2 text-left font-mono text-[11px] transition-colors hover:bg-white/10 ${
                      key === filter ? "text-white/80" : "text-white/40"
                    }`}
                  >
                    {FILTER_LABELS[key]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : days.length === 0 ? (
        <p className="mt-4 font-mono text-sm text-white/40">
          No history yet. Complete your first morning to start tracking.
        </p>
      ) : (
        <div className="history-scroll mt-4 max-h-[400px] overflow-y-auto pr-1" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {visible.map((day) => {
            const hasActivity = !!(day.session || day.oneThing);
            const inStreak = hasActivity && isStreakDay(allDays, day.date);

            return (
              <div
                key={day.date}
                style={
                  hasActivity
                    ? { background: "rgba(60, 30, 40, 0.3)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, padding: 16 }
                    : { background: "transparent", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: 10, padding: 16, opacity: 0.3 }
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white/50">
                      {formatDayHeader(day.date)}
                    </span>
                    <span className="font-mono text-[11px] text-white/30">
                      · {formatDateShort(day.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {day.session ? (
                      <span
                        className={`font-mono text-[11px] font-semibold ${
                          day.session.stepsCompleted === day.session.stepsTotal
                            ? "text-emerald-400"
                            : "text-[#d4856a]"
                        }`}
                      >
                        ✓ {day.session.stepsCompleted}/{day.session.stepsTotal}
                      </span>
                    ) : !hasActivity ? (
                      <span className="font-mono text-[11px] text-white/80">
                        missed
                      </span>
                    ) : null}
                    {inStreak && (
                      <span className="text-xs" aria-label="streak day">🔥</span>
                    )}
                  </div>
                </div>

                {hasActivity && (
                  <div className="mt-2 space-y-0.5 border-l border-white/8 pl-3">
                    {day.session && (
                      <p className="font-mono text-[11px] text-white/40">
                        Protocol: {formatMinutes(day.session.totalTimeSeconds)}
                      </p>
                    )}
                    {day.oneThing && day.oneThing.text.trim() !== "" && (
                      <p className="flex items-center gap-1.5 font-mono text-[11px] text-white/40">
                        <span className="min-w-0 flex-1 truncate">
                          One Thing: &ldquo;{day.oneThing.text}&rdquo;
                        </span>
                        <span
                          className={`shrink-0 text-[10px] font-bold ${
                            day.oneThing.completed ? "text-emerald-400" : "text-white/20"
                          }`}
                        >
                          {day.oneThing.completed ? "✓" : "✗"}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((v) => v + 7)}
              className="mt-2 w-full border-t border-white/6 pt-3 text-center font-mono text-[11px] text-white/30 transition-colors hover:text-white/50"
            >
              ─── Show more ───
            </button>
          )}
        </div>
      )}
    </div>
  );
}
