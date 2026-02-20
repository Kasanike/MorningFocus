"use client";

import { useState, useEffect, useCallback } from "react";
import { Target } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { STORAGE_KEYS } from "@/lib/constants";
import {
  fetchOneThing,
  saveOneThingDb,
  fetchOneThingHistory,
  setOneThingCompleted,
  type OneThingEntry,
} from "@/lib/db";
import { createClient } from "@/utils/supabase/client";
import { SkeletonCard } from "@/components/SkeletonCard";
import { trackOneThingSet } from "@/lib/analytics";

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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

function saveOneThingLocal(text: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEYS.ONE_THING,
    JSON.stringify({ date: getTodayKey(), text: text.trim() })
  );
}

export function OneThing() {
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<OneThingEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const list = await fetchOneThingHistory();
      setHistory(list);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const load = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const text = await fetchOneThing(getTodayKey());
          if (text !== "") {
            setValue(text);
          }
          await loadHistory();
          if (text !== "") return;
        }
      } catch {
        // ignore
      }
      setValue(getStoredOneThing());
    };
    load();
  }, [loadHistory]);

  const handleSave = async () => {
    const date = getTodayKey();
    saveOneThingLocal(value);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await saveOneThingDb(value.trim(), date);
        await loadHistory();
      }
      if (value.trim()) trackOneThingSet();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleCompleted = async (entry: OneThingEntry) => {
    try {
      await setOneThingCompleted(entry.date, !entry.completed);
      setHistory((prev) =>
        prev.map((e) =>
          e.id === entry.id ? { ...e, completed: !e.completed } : e
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (!mounted) {
    return <SkeletonCard variant="oneThing" />;
  }

  return (
    <section
      className="card-glass rounded-2xl border border-white/10 px-8 py-10 shadow-2xl shadow-black/20 sm:px-10 sm:py-12"
      aria-label={t.one_thing_aria}
    >
      <div className="drop-shadow-md">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 shrink-0 text-white/60" />
          <h2 className="font-mono text-xl font-semibold text-white/95">
            {t.one_thing_title}
          </h2>
        </div>
        <p className="mt-1 font-mono text-xs tracking-wider text-white/50">
          {t.one_thing_prompt}
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder={t.one_thing_placeholder}
          className="min-h-[44px] min-w-0 flex-1 rounded-full border border-white/30 bg-white/20 px-5 py-3 text-base font-medium text-white placeholder:text-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        <button
          type="button"
          onClick={handleSave}
          className="min-h-[44px] w-full shrink-0 rounded-full bg-white px-6 py-3 font-bold text-indigo-900 transition-opacity hover:opacity-90 sm:w-auto"
        >
          {t.save}
        </button>
      </div>

      {history.length > 0 && (
        <ul className="mt-6 space-y-2 border-t border-white/10 pt-6" aria-label="Last 7 days">
          {history.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => handleToggleCompleted(entry)}
                className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left font-mono text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white/95"
              >
                <span className="shrink-0 text-white/50">
                  {formatDateShort(entry.date)} —
                </span>
                <span className={"min-w-0 flex-1 break-words text-left " + (entry.completed ? "line-through opacity-70" : "")}>
                  {entry.text || "—"}
                </span>
                {entry.completed && (
                  <span className="ml-1 shrink-0 text-white/90" aria-hidden>✓</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
