"use client";

import { useState, useEffect } from "react";
import { Bell, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { STORAGE_KEYS } from "@/lib/constants";
import {
  getNativeAlarmUrl,
  getDeepLinkSupport,
  openNativeAlarm,
} from "@/lib/alarm-deeplink";

export type AlarmSettings = {
  time: string;
};

const DEFAULT_TIME = "07:00";

function getStoredAlarm(): AlarmSettings {
  if (typeof window === "undefined") {
    return { time: DEFAULT_TIME };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALARM_SETTINGS);
    if (!raw) return { time: DEFAULT_TIME };
    const parsed = JSON.parse(raw);
    const time =
      typeof parsed?.time === "string" && /^\d{2}:\d{2}$/.test(parsed.time)
        ? parsed.time
        : DEFAULT_TIME;
    return { time };
  } catch {
    return { time: DEFAULT_TIME };
  }
}

function saveAlarm(settings: AlarmSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.ALARM_SETTINGS, JSON.stringify(settings));
}

export function AlarmSetting() {
  const { t } = useLanguage();
  const [time, setTime] = useState(DEFAULT_TIME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredAlarm();
    setTime(stored.time);
  }, []);

  const handleTimeChange = (value: string) => {
    setTime(value);
    saveAlarm({ time: value });
  };

  const handleSetAlarm = () => {
    saveAlarm({ time });

    const url = getNativeAlarmUrl(time);
    if (url) {
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) openNativeAlarm(time);
    }
  };

  const platform =
    typeof window !== "undefined" ? getDeepLinkSupport() : "desktop";

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

        <button
          type="button"
          onClick={handleSetAlarm}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/15 px-6 py-4 font-mono text-sm font-medium text-white/95 transition-colors hover:bg-white/25"
        >
          <ExternalLink className="h-4 w-4" />
          {platform === "desktop"
            ? "Open Clock App"
            : platform === "ios"
              ? "Open Clock App → Set Your Alarm"
              : `Set Alarm for ${time}`}
        </button>

        <p className="text-center font-mono text-xs text-white/40">
          Opens your device clock app with this time
        </p>
      </div>
    </section>
  );
}
