"use client";

import { useState, useEffect } from "react";
import {
  getUserStreaks,
  getMonthDailyCompletions,
  getLast14DaysCompletions,
  getTodayCompletionDetail,
  type DayStatus,
  type TodayCompletionDetail,
} from "@/lib/streak";
import { fetchStreakData } from "@/lib/db";

const GLASS_CARD_STYLE = {
  background: "rgba(30, 13, 25, 0.53)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)" as const,
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: "20px 16px",
};

const GRADIENT_FULL =
  "linear-gradient(135deg, #a78bfa 0%, #f472b6 50%, #fb923c 100%)";
const PARTIAL_BG = "rgba(139, 92, 246, 0.4)";
const MISSED_BG = "rgba(255,255,255,0.08)";
const MISSED_TEXT = "rgba(255,255,255,0.3)";
const TODAY = () => new Date().toISOString().slice(0, 10);

type PillState = "complete" | "partial" | "missed";

function getPillState(dateStr: string, status: DayStatus | undefined, isToday: boolean): PillState {
  if (status === "full") return "complete";
  if (status === "partial") return "partial";
  return "missed";
}

function getStreakMilestone(streak: number): string {
  if (streak <= 6) return "Building momentum 💪";
  if (streak <= 13) return "One week strong 🔥";
  if (streak <= 29) return "Two weeks in. This is becoming real.";
  return "This is who you are now. 🌅";
}

/** Day of year 1–365; pick quote by index (dayOfYear - 1) % 30. */
function getDayOfYear(): number {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}

const DAILY_QUOTES = [
  "The soul becomes dyed with the color of its thoughts.",
  "Begin at once to live, and count each day as a separate life.",
  "We suffer more often in imagination than in reality.",
  "It is not that we have a short time to live, but that we waste a lot of it.",
  "Luck is what happens when preparation meets opportunity.",
  "You have power over your mind—not outside events. Realize this, and you will find strength.",
  "The best revenge is not to be like your enemy.",
  "Waste no more time arguing what a good person should be. Be one.",
  "First say to yourself what you would be; and then do what you have to do.",
  "The happiness of your life depends upon the quality of your thoughts.",
  "We are what we repeatedly do. Excellence, then, is not an act but a habit.",
  "How long are you going to wait before you demand the best for yourself?",
  "Don’t explain your philosophy. Embody it.",
  "It’s not what happens to you, but how you react to it that matters.",
  "The mind is not a vessel to be filled but a fire to be kindled.",
  "He who lives in harmony with himself lives in harmony with the universe.",
  "Very little is needed to make a happy life.",
  "Accept the things to which fate binds you, and love the people with whom fate brings you together.",
  "Each day provides its own gifts.",
  "Begin each day by telling yourself: Today I shall meet with interference, ingratitude, arrogance.",
  "When you arise in the morning, think of what a precious privilege it is to be alive.",
  "The object of life is not to be on the side of the majority, but to escape finding oneself in the ranks of the insane.",
  "No person has the power to have everything they want, but it is in their power not to want what they don’t have.",
  "We are more often frightened than hurt; and we suffer more from imagination than from reality.",
  "Life is very short and anxious for those who forget the past, neglect the present, and fear the future.",
  "While we are postponing, life speeds by.",
  "Difficulties strengthen the mind, as labor does the body.",
  "It is the power of the mind to be unconquerable.",
  "Only the educated are free.",
  "Make the best use of what is in your power, and take the rest as it happens.",
];

function getQuoteForToday(): string {
  const dayOfYear = getDayOfYear();
  const index = (dayOfYear - 1) % DAILY_QUOTES.length;
  return DAILY_QUOTES[index];
}

function getMonthGrid(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const daysInMonth = last.getDate();
  // Monday = 0 (first column)
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
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  return DAY_LABELS[new Date(dateStr + "T12:00:00").getDay()];
}

function getDateNumber(dateStr: string): number {
  return new Date(dateStr + "T12:00:00").getDate();
}

export function ProgressTab() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalMornings, setTotalMornings] = useState(0);
  const [monthMap, setMonthMap] = useState<Record<string, DayStatus>>({});
  const [last7Map, setLast7Map] = useState<Record<string, DayStatus>>({});
  const [todayDetail, setTodayDetail] = useState<TodayCompletionDetail | null | undefined>(undefined);
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
    getTodayCompletionDetail()
      .then((detail) => {
        if (!cancelled) setTodayDetail(detail ?? null);
      })
      .catch(() => {
        if (!cancelled) setTodayDetail(null);
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

  return (
    <div className="space-y-6">
      {/* A) Hero stats row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div
          className="flex flex-col items-center justify-center rounded-2xl text-center shadow-lg"
          style={GLASS_CARD_STYLE}
        >
          <span className="text-2xl leading-none" aria-hidden>🔥</span>
          <span className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-white/95 sm:text-2xl">
            {loading ? "…" : currentStreak}
          </span>
          <span className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/50">
            Current
          </span>
        </div>
        <div
          className="flex flex-col items-center justify-center rounded-2xl text-center shadow-lg"
          style={GLASS_CARD_STYLE}
        >
          <span className="text-2xl leading-none" aria-hidden>🏆</span>
          <span className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-white/95 sm:text-2xl">
            {loading ? "…" : longestStreak}
          </span>
          <span className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/50">
            Longest
          </span>
        </div>
        <div
          className="flex flex-col items-center justify-center rounded-2xl text-center shadow-lg"
          style={GLASS_CARD_STYLE}
        >
          <span className="text-2xl leading-none" aria-hidden>☀️</span>
          <span className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-white/95 sm:text-2xl">
            {loading ? "…" : totalMornings}
          </span>
          <span className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/50">
            Total
          </span>
        </div>
      </div>

      {/* B) Calendar: 14-day strip when total < 30, else monthly heatmap */}
      <div
        className="rounded-2xl p-4 sm:p-5"
        style={GLASS_CARD_STYLE}
      >
        {totalMornings >= 30 ? (
          <>
            <h2 className="mb-3 font-mono text-sm font-semibold uppercase tracking-wider text-white/70">
              {monthLabel}
            </h2>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-0">
                <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-1.5">
                  {WEEKDAY_LABELS.map((label, i) => (
                    <div
                      key={`weekday-${i}`}
                      className="text-center font-mono text-[10px] text-white/40"
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1 sm:gap-1.5">
                  {grid.map((row, ri) => (
                    <div
                      key={ri}
                      className="grid grid-cols-7 gap-1 sm:gap-1.5"
                    >
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
                            className={`aspect-square min-w-0 rounded-lg border-2 transition-all ${
                              isToday ? "border-white/60 ring-2 ring-white/20" : "border-transparent"
                            } ${isFuture ? "opacity-40" : ""}`}
                            style={{
                              background:
                                status === "full"
                                  ? GRADIENT_FULL
                                  : status === "partial"
                                    ? "rgba(167, 139, 250, 0.35)"
                                    : "rgba(0,0,0,0.25)",
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
            <h2 className="mb-3 font-mono text-sm font-semibold uppercase tracking-wider text-white/70">
              Last 7 days
            </h2>
            <div className="flex justify-between gap-2 overflow-x-auto pb-1">
              {getLast7Dates().map((dateStr) => {
                const status = last7Map[dateStr];
                const isToday = dateStr === todayKey;
                const state = getPillState(dateStr, status, isToday);

                const bg =
                  state === "complete"
                    ? GRADIENT_FULL
                    : state === "partial"
                      ? PARTIAL_BG
                      : MISSED_BG;
                const dateColor = state === "missed" ? MISSED_TEXT : "rgba(255,255,255,1)";

                return (
                  <div
                    key={dateStr}
                    className="flex shrink-0 flex-col items-center gap-1.5"
                  >
                    <span className="font-mono text-[10px] text-white/50">
                      {getDayLabel(dateStr)}
                    </span>
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                        isToday ? "border-white ring-2 ring-white/40" : "border-transparent"
                      }`}
                      style={{ background: bg }}
                      title={dateStr}
                      aria-label={`${dateStr}, ${state}${isToday ? ", today" : ""}`}
                    >
                      <span
                        className="font-mono text-xs font-medium tabular-nums"
                        style={{ color: dateColor }}
                      >
                        {getDateNumber(dateStr)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* C) Dynamic message card: quote / checklist / morning complete */}
      <div
        className="rounded-2xl px-5 py-4 text-center"
        style={GLASS_CARD_STYLE}
      >
        {todayDetail === undefined ? (
          <p className="font-serif text-lg text-white/70 sm:text-xl" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            …
          </p>
        ) : todayDetail === null || (!todayDetail.fully_completed && !todayDetail.protocol_done && !todayDetail.constitution_done && !todayDetail.keystone_done) ? (
          <p className="font-serif text-lg text-white/90 sm:text-xl" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            {getQuoteForToday()}
          </p>
        ) : todayDetail.fully_completed ? (
          <div className="space-y-2">
            <p className="font-serif text-lg text-white/95 sm:text-xl" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Morning complete 🌅
            </p>
            <p className="font-mono text-sm text-white/70">
              {getStreakMilestone(currentStreak)}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-left">
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">Today</span>
            <ul className="flex flex-col gap-1.5 w-full max-w-[200px]">
              <li className="flex items-center gap-2 font-mono text-sm text-white/90">
                <span aria-hidden>{todayDetail.protocol_done ? "✓" : "○"}</span>
                Protocol
              </li>
              <li className="flex items-center gap-2 font-mono text-sm text-white/90">
                <span aria-hidden>{todayDetail.constitution_done ? "✓" : "○"}</span>
                Constitution
              </li>
              <li className="flex items-center gap-2 font-mono text-sm text-white/90">
                <span aria-hidden>{todayDetail.keystone_done ? "✓" : "○"}</span>
                Keystone
              </li>
            </ul>
          </div>
        )}
      </div>

    </div>
  );
}
