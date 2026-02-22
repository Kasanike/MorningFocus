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

  const cardStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 22,
    padding: "22px 20px 24px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)" as const,
  };

  return (
    <>
    <section
      className="relative overflow-hidden rounded-[22px] backdrop-blur-xl"
      style={cardStyle}
      aria-label={t.keystone_aria}
    >
      <div className="mb-1 flex items-center gap-3">
        <Target className="h-5 w-5 shrink-0 text-white/60" />
        <div>
          <h2
            className="font-bold text-white"
            style={{ fontSize: 22, margin: 0, letterSpacing: "-0.01em" }}
          >
            {t.keystone_title}
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.3)",
              margin: "2px 0 0",
              lineHeight: 1.4,
            }}
          >
            {t.keystone_prompt}
          </p>
        </div>
      </div>

      {showLockedCard ? (
        <div
          className="animate-fade-scale-in mt-6 rounded-[14px] border"
          style={{
            padding: "14px 16px",
            background: "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {t.keystone_todays_commitment}
            </span>
            <span
              className="animate-slide-in-right shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{
                background: "rgba(34,197,94,0.2)",
                color: "rgba(74,222,128,0.9)",
              }}
            >
              {t.keystone_locked_badge}
            </span>
          </div>
          <p className="mt-2 text-[15px] font-medium text-white/95">{value.trim()}</p>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex min-h-[40px] items-center gap-2 rounded-[10px] px-3 py-2 text-sm transition-colors"
              style={{
                color: "rgba(255,255,255,0.7)",
                background: "rgba(255,255,255,0.06)",
              }}
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
            className="min-h-[44px] min-w-0 flex-1 rounded-[14px] border px-4 py-3 text-[15px] font-medium text-white placeholder:text-white/50 transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            style={{
              background: "rgba(255,255,255,0.06)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          />
          <button
            type="button"
            onClick={handleSave}
            className={`min-h-[44px] w-full shrink-0 rounded-[14px] px-6 py-3 text-sm font-semibold transition-all duration-300 active:scale-[0.98] sm:w-auto ${
              saved
                ? "text-emerald-300"
                : "text-white"
            }`}
            style={
              saved
                ? { background: "rgba(34,197,94,0.2)" }
                : {
                    background: "linear-gradient(135deg, #f97316, #ec4899)",
                    boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
                  }
            }
          >
            {saved ? t.keystone_locked_badge : t.keystone_lock_button}
          </button>
        </div>
      )}
    </section>

    {/* Recent keystones */}
    {(() => {
      const todayKey = getTodayKey();
      const pastEntries = history.filter((e) => e.date !== todayKey).slice(0, 3);
      if (pastEntries.length === 0 && !onGoToProgress) return null;
      return (
        <div
          className="mt-6 rounded-[22px] border backdrop-blur-xl"
          style={{
            ...cardStyle,
            padding: "18px 20px",
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {t.keystone_recent_title}
            </h3>
            {onGoToProgress && (
              <button
                type="button"
                onClick={onGoToProgress}
                className="text-xs font-semibold transition-colors"
                style={{ color: "rgba(249,115,22,0.9)" }}
              >
                {t.keystone_see_all}
              </button>
            )}
          </div>
          {pastEntries.length > 0 && (
            <ul className="flex flex-col gap-2" aria-label={t.keystone_recent_title}>
              {pastEntries.map((entry) => (
                <li key={entry.id}>
                  <div
                    className="flex items-center gap-3 rounded-[14px] border px-4 py-3"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.06)",
                    }}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: "rgba(249,115,22,0.8)" }}
                      aria-hidden
                    />
                    <span className="shrink-0 text-xs text-white/50">
                      {formatDateShort(entry.date)}
                    </span>
                    <span
                      className={
                        "min-w-0 flex-1 truncate text-xs text-white/70 " +
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
