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
      <section className="rounded-lg border border-app-border bg-app-card px-6 py-8 sm:px-8 sm:py-10">
        <h2 className="font-mono text-xl font-semibold text-app-fg">
          {t.one_thing_title}
        </h2>
        <p className="mt-3 text-app-muted animate-pulse">{t.loading}</p>
      </section>
    );
  }

  return (
    <section
      className="rounded-lg border border-app-border bg-app-card px-6 py-8 sm:px-8 sm:py-10"
      aria-label={t.one_thing_aria}
    >
      <div className="flex items-center gap-3">
        <Target className="h-5 w-5 shrink-0 text-app-muted" />
        <h2 className="font-mono text-xl font-semibold text-app-fg">
          {t.one_thing_title}
        </h2>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder={t.one_thing_placeholder}
          className="min-w-0 flex-1 rounded-lg border border-app-border bg-app-bg px-4 py-3 font-mono text-app-fg placeholder:text-app-muted focus:border-app-fg focus:outline-none focus:ring-1 focus:ring-app-fg"
        />
        <button
          type="button"
          onClick={handleSave}
          className="w-full shrink-0 rounded-lg bg-app-fg px-5 py-3 font-mono font-semibold text-app-bg transition-opacity hover:opacity-90 sm:w-auto"
        >
          {t.save}
        </button>
      </div>
    </section>
  );
}
