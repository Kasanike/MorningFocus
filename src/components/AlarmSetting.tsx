"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { STORAGE_KEYS } from "@/lib/constants";

export type AlarmSettings = {
  time: string;
  days: number[];
};

const DEFAULT_TIME = "07:00";
const DEFAULT_DAYS = [1, 2, 3, 4, 5]; // Mon–Fri

function getStoredAlarm(): AlarmSettings {
  if (typeof window === "undefined") {
    return { time: DEFAULT_TIME, days: [...DEFAULT_DAYS] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALARM_SETTINGS);
    if (!raw) return { time: DEFAULT_TIME, days: [...DEFAULT_DAYS] };
    const parsed = JSON.parse(raw);
    const time =
      typeof parsed?.time === "string" && /^\d{2}:\d{2}$/.test(parsed.time)
        ? parsed.time
        : DEFAULT_TIME;
    const days = Array.isArray(parsed?.days)
      ? parsed.days.filter(
          (d: unknown) => typeof d === "number" && d >= 0 && d <= 6
        )
      : [...DEFAULT_DAYS];
    return { time, days: days.length ? days : [...DEFAULT_DAYS] };
  } catch {
    return { time: DEFAULT_TIME, days: [...DEFAULT_DAYS] };
  }
}

function saveAlarm(settings: AlarmSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.ALARM_SETTINGS, JSON.stringify(settings));
}

export function AlarmSetting() {
  const { t } = useLanguage();
  const [time, setTime] = useState(DEFAULT_TIME);
  const [days, setDays] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredAlarm();
    setTime(stored.time);
    setDays(stored.days);
  }, []);

  const toggleDay = (day: number) => {
    const next = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day].sort((a, b) => a - b);
    setDays(next);
    saveAlarm({ time, days: next });
  };

  const handleTimeChange = (value: string) => {
    setTime(value);
    saveAlarm({ time: value, days });
  };

  if (!mounted) {
    return (
      <section className="card-glass rounded-2xl border border-white/10 px-8 py-10 shadow-2xl shadow-black/20 sm:px-10 sm:py-12">
        <h2 className="font-mono text-xl font-semibold text-white/95">
          {t.alarm_title}
        </h2>
        <p className="mt-3 text-white/60 animate-pulse">{t.loading}</p>
      </section>
    );
  }

  const shortDays = t.short_weekdays;

  return (
    <section
      className="card-glass rounded-2xl border border-white/10 px-8 py-10 shadow-2xl shadow-black/20 sm:px-10 sm:py-12"
      aria-label={t.alarm_aria}
    >
      <div className="flex flex-wrap items-center gap-2 drop-shadow-md">
        <Bell className="h-5 w-5 text-white/70" aria-hidden />
        <h2 className="font-mono text-xl font-semibold text-white/95">
          {t.alarm_title}
        </h2>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <label
            htmlFor="alarm-time"
            className="block font-mono text-xs font-medium uppercase tracking-wider text-white/50"
          >
            {t.alarm_time_label}
          </label>
          <input
            id="alarm-time"
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="mt-2 w-full max-w-[10rem] rounded-xl border border-white/20 bg-black/20 px-4 py-3 font-mono text-lg text-white/95 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 [color-scheme:dark]"
          />
        </div>

        <div>
          <span className="block font-mono text-xs font-medium uppercase tracking-wider text-white/50">
            {t.alarm_days_label}
          </span>
          <div className="mt-3 flex flex-wrap gap-2">
            {shortDays.map((label, index) => {
              const day = index;
              const isActive = days.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`min-w-[2.5rem] rounded-xl px-3 py-2.5 font-mono text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/25 text-white/95 shadow-inner"
                      : "border border-white/15 bg-black/20 text-white/50 hover:border-white/25 hover:bg-white/5 hover:text-white/70"
                  }`}
                  aria-pressed={isActive}
                  aria-label={`${label}, ${isActive ? "active" : "inactive"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
