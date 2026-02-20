"use client";

import { useState, useEffect } from "react";
import { fetchStreakData, type StreakData } from "@/lib/db";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getStreakColor(days: number): string {
  if (days >= 30) return "text-amber-300";
  if (days >= 14) return "text-orange-400";
  if (days >= 7) return "text-[#d4856a]";
  return "text-white/70";
}

function getStreakDotColor(days: number): string {
  if (days >= 30) return "bg-amber-300";
  if (days >= 14) return "bg-orange-400";
  if (days >= 7) return "bg-[#d4856a]";
  return "bg-white/50";
}

function getWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() - mondayOffset + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export function StreakCard() {
  const [data, setData] = useState<StreakData | null>(null);

  useEffect(() => {
    fetchStreakData()
      .then(setData)
      .catch(() => setData({ currentStreak: 0, bestStreak: 0, totalMornings: 0, weekCompletions: new Set() }));
  }, []);

  if (!data) {
    return (
      <div
        className="shadow-2xl shadow-black/20"
        style={{ background: "rgba(30, 15, 25, 0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 24px" }}
      >
        <h2 className="font-mono text-xl font-semibold text-white/95">Streak</h2>
        <div className="mt-4 h-20 animate-pulse rounded-xl bg-white/5" />
      </div>
    );
  }

  const { currentStreak, bestStreak, totalMornings, weekCompletions } = data;
  const weekDates = getWeekDates();
  const todayKey = new Date().toISOString().slice(0, 10);
  const streakColor = getStreakColor(currentStreak);
  const dotColor = getStreakDotColor(currentStreak);

  return (
    <div
      className="shadow-2xl shadow-black/20"
      style={{ background: "rgba(30, 15, 25, 0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 24px" }}
    >
      <h2 className="font-mono text-xl font-semibold text-white/95">Streak</h2>

      <div className="mt-5 text-center">
        <p
          className={`font-serif text-4xl font-normal tracking-tight ${streakColor}`}
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          {currentStreak > 0 ? `🔥 ${currentStreak} day${currentStreak === 1 ? "" : "s"}` : "0 days"}
        </p>
        {currentStreak === 0 && (
          <p className="mt-1 font-mono text-xs text-white/40">
            start today
          </p>
        )}
      </div>

      <div className="mx-auto mt-6 flex max-w-[280px] items-center justify-between gap-1">
        {weekDates.map((date, i) => {
          const completed = weekCompletions.has(date);
          const isToday = date === todayKey;
          const isFuture = date > todayKey;

          return (
            <div key={date} className="flex flex-col items-center gap-1.5">
              <div
                className={`flex items-center justify-center rounded-full transition-all ${
                  isToday ? "h-7 w-7" : "h-5 w-5"
                } ${
                  completed
                    ? dotColor
                    : isFuture
                      ? "border border-white/8 bg-transparent"
                      : "border border-white/20 bg-transparent"
                } ${isToday && !completed ? "border-2 border-white/40" : ""}`}
              >
                {completed && (
                  <span className="text-[9px] font-bold text-white/90">✓</span>
                )}
              </div>
              <span
                className={`font-mono text-[10px] ${
                  isToday ? "font-semibold text-white/70" : "text-white/30"
                }`}
              >
                {WEEKDAY_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3 border-t border-white/8 pt-5">
        <span className="font-mono text-[11px] text-white/40">
          Best: <span className="text-white/60">{bestStreak} day{bestStreak === 1 ? "" : "s"}</span>
        </span>
        <span className="text-white/15">·</span>
        <span className="font-mono text-[11px] text-white/40">
          Total mornings: <span className="text-white/60">{totalMornings}</span>
        </span>
      </div>
    </div>
  );
}
