"use client";

import { useState, useEffect } from "react";
import { Target } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { STORAGE_KEYS } from "@/lib/constants";

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getStoredOneThing(): string {
  if (typeof window === "undefined") return "";
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ONE_THING);
    if (!data) return "";
    const parsed = JSON.parse(data);
    if (parsed?.date === getTodayKey() && typeof parsed?.text === "string") {
      return parsed.text;
    }
    return "";
  } catch {
    return "";
  }
}

function saveOneThing(text: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEYS.ONE_THING,
    JSON.stringify({ date: getTodayKey(), text: text.trim() })
  );
}

export function OneThing() {
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setValue(getStoredOneThing());
  }, []);

  const handleSave = () => {
    saveOneThing(value);
  };

  if (!mounted) {
    return (
      <section className="card-glass rounded-2xl border border-white/10 px-8 py-10 shadow-2xl shadow-black/20 sm:px-10 sm:py-12">
        <h2 className="font-mono text-xl font-semibold text-white/95">
          {t.one_thing_title}
        </h2>
        <p className="mt-3 text-white/60 animate-pulse">{t.loading}</p>
      </section>
    );
  }

  return (
    <section
      className="card-glass rounded-2xl border border-white/10 px-8 py-10 shadow-2xl shadow-black/20 sm:px-10 sm:py-12"
      aria-label={t.one_thing_aria}
    >
      <div className="flex items-center gap-3">
        <Target className="h-5 w-5 shrink-0 text-white/60" />
        <h2 className="font-mono text-xl font-semibold text-white/95">
          {t.one_thing_title}
        </h2>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder={t.one_thing_placeholder}
          className="min-w-0 flex-1 rounded-xl border border-white/20 bg-black/20 px-4 py-3 font-mono text-white/95 placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
        />
        <button
          type="button"
          onClick={handleSave}
          className="w-full shrink-0 rounded-xl bg-white/20 px-5 py-3 font-mono font-semibold text-white/95 transition-colors hover:bg-white/30 sm:w-auto"
        >
          {t.save}
        </button>
      </div>
    </section>
  );
}
