"use client";

import { useState, useEffect, useCallback } from "react";
import { Target, Pencil } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { STORAGE_KEYS, setHasEditedContent } from "@/lib/constants";
import {
  fetchKeystone,
  saveKeystoneDb,
  fetchKeystoneHistory,
  type KeystoneEntry,
} from "@/lib/db";
import { createClient } from "@/utils/supabase/client";
import { SkeletonCard } from "@/components/SkeletonCard";
import { StoicQuote } from "@/components/StoicQuote";
import { trackKeystoneSet } from "@/lib/analytics";

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getStoredKeystone(): string {
  if (typeof window === "undefined") return "";
  try {
    const data = localStorage.getItem(STORAGE_KEYS.KEYSTONE);
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

function saveKeystoneLocal(text: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEYS.KEYSTONE,
    JSON.stringify({ date: getTodayKey(), text: text.trim() })
  );
}

interface KeystoneProps {
  onGoToProgress?: () => void;
}

export function Keystone({ onGoToProgress }: KeystoneProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<KeystoneEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const list = await fetchKeystoneHistory();
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
          const text = await fetchKeystone(getTodayKey());
          if (text !== "") {
            setValue(text);
          }
          await loadHistory();
          if (text !== "") return;
        }
      } catch {
        // ignore
      }
      setValue(getStoredKeystone());
    };
    load();
  }, [loadHistory]);

  const handleSave = async () => {
    const date = getTodayKey();
    saveKeystoneLocal(value);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await saveKeystoneDb(value.trim(), date);
        await loadHistory();
      }
      if (value.trim()) {
        trackKeystoneSet();
        setHasEditedContent();
      }
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  if (!mounted) {
    return <SkeletonCard variant="keystone" />;
  }

  const hasSetKeystone = value.trim() !== "";
  const showLockedCard = hasSetKeystone && !isEditing;

  return (
    <>
    <section
      className="card-glass rounded-2xl border border-white/10 px-8 py-10 shadow-2xl shadow-black/20 sm:px-10 sm:py-12"
      aria-label={t.keystone_aria}
    >
      <div className="drop-shadow-md">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 shrink-0 text-white/60" />
          <h2 className="font-mono text-xl font-semibold text-white/95">
            {t.keystone_title}
          </h2>
        </div>
        <p className="mt-1 font-mono text-xs tracking-wider text-white/50">
          {t.keystone_prompt}
        </p>
      </div>

      {showLockedCard ? (
        <div className="animate-fade-scale-in mt-6 rounded-xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-white/50">
              {t.keystone_todays_commitment}
            </span>
            <span className="animate-slide-in-right shrink-0 rounded-full bg-emerald-500/20 px-2.5 py-1 font-mono text-xs font-medium text-emerald-300">
              {t.keystone_locked_badge}
            </span>
          </div>
          <p className="mt-2 font-medium text-white/95">{value.trim()}</p>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex min-h-[40px] items-center gap-2 rounded-lg px-3 py-2 font-mono text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white/90"
              aria-label={t.keystone_edit}
            >
              <Pencil className="h-4 w-4" />
              {t.keystone_edit}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setSaved(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder={t.keystone_placeholder}
            className="min-h-[44px] min-w-0 flex-1 rounded-full border border-white/30 bg-white/20 px-5 py-3 text-base font-medium text-white placeholder:text-white/50 backdrop-blur-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:shadow-[0_0_0_4px_rgba(255,255,255,0.08)]"
          />
          <button
            type="button"
            onClick={handleSave}
            className={`min-h-[44px] w-full shrink-0 rounded-full px-6 py-3 font-bold transition-all duration-300 active:scale-[0.98] sm:w-auto ${
              saved
                ? "bg-emerald-500/30 text-emerald-300"
                : "bg-white text-indigo-900 hover:opacity-90"
            }`}
          >
            {saved ? t.keystone_locked_badge : t.keystone_lock_button}
          </button>
        </div>
      )}
    </section>

    {/* Recent keystones — last 3 as cards; "See all" to Progress */}
    {(() => {
      const todayKey = getTodayKey();
      const pastEntries = history.filter((e) => e.date !== todayKey).slice(0, 3);
      if (pastEntries.length === 0 && !onGoToProgress) return null;
      return (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/50">
              {t.keystone_recent_title}
            </h3>
            {onGoToProgress && (
              <button
                type="button"
                onClick={onGoToProgress}
                className="font-mono text-xs font-medium text-[#d4856a] transition-colors hover:text-[#e09a7a]"
              >
                {t.keystone_see_all}
              </button>
            )}
          </div>
          {pastEntries.length > 0 && (
            <ul className="space-y-2.5" aria-label={t.keystone_recent_title}>
              {pastEntries.map((entry) => (
                <li key={entry.id}>
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-[#d4856a]"
                      aria-hidden
                    />
                    <span className="shrink-0 font-mono text-xs text-white/50">
                      {formatDateShort(entry.date)}
                    </span>
                    <span
                      className={
                        "min-w-0 flex-1 truncate font-mono text-xs text-white/70 " +
                        (entry.completed ? "line-through opacity-60" : "")
                      }
                    >
                      {entry.text || "—"}
                    </span>
                    {entry.completed && (
                      <span className="shrink-0 text-white/50" aria-hidden>
                        ✓
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    })()}

    {hasSetKeystone && (
      <div className="mt-6" role="complementary" aria-label={t.quote_remember_today}>
        <StoicQuote />
      </div>
    )}
    </>
  );
}
