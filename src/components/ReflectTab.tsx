"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Moon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/utils/supabase/client";
import {
  fetchKeystone,
  fetchReflection,
  fetchPastReflections,
  saveReflection,
  type ReflectionEntry,
  type ReflectionMood,
} from "@/lib/db";

const MAX_CHARS = 280;

const MOODS: { key: ReflectionMood; emoji: string }[] = [
  { key: "calm", emoji: "😌" },
  { key: "focused", emoji: "🎯" },
  { key: "energized", emoji: "⚡" },
  { key: "drained", emoji: "😮‍💨" },
];

const MOOD_LABEL: Record<string, Record<ReflectionMood, string>> = {
  en: { calm: "Calm", focused: "Focused", energized: "Energized", drained: "Drained" },
  sk: { calm: "Pokojný", focused: "Sústredený", energized: "Energický", drained: "Vyčerpaný" },
};

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateShort(dateStr: string, locale: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString(locale === "sk" ? "sk-SK" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function moodEmoji(mood: string | null): string {
  return MOODS.find((m) => m.key === mood)?.emoji ?? "";
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay } },
});

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 18,
};

/** Matches Keystone section wrapper */
const sectionCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 22,
  padding: "22px 20px",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

function SkeletonBlock() {
  const bar = "rounded-lg bg-white/[0.12] animate-skeleton-pulse";
  return (
    <div className="space-y-6" aria-hidden>
      <div>
        <div className={`h-3 w-40 ${bar}`} />
        <div className={`mt-3 h-8 w-56 ${bar}`} />
      </div>
      <div className="rounded-[18px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className={`h-3 w-36 ${bar}`} />
        <div className={`mt-3 h-5 w-full ${bar}`} />
      </div>
      <div className="rounded-[18px] border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className={`h-6 w-48 ${bar}`} />
        <div className={`mt-2 h-3 w-56 ${bar}`} />
        <div className={`mt-4 h-24 w-full rounded-xl ${bar}`} />
        <div className={`mt-4 flex gap-2`}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-10 flex-1 rounded-full ${bar}`} />
          ))}
        </div>
        <div className={`mt-4 h-12 w-full rounded-2xl ${bar}`} />
      </div>
    </div>
  );
}

export function ReflectTab() {
  const { t, locale } = useLanguage();
  const labels = MOOD_LABEL[locale] ?? MOOD_LABEL.en;

  const [loading, setLoading] = useState(true);
  const [keystoneText, setKeystoneText] = useState<string>("");
  const [todayReflection, setTodayReflection] = useState<ReflectionEntry | null>(null);
  const [pastReflections, setPastReflections] = useState<ReflectionEntry[]>([]);

  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState<ReflectionMood | null>(null);
  const [saving, setSaving] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const today = getTodayKey();
      const [ks, ref, past] = await Promise.all([
        fetchKeystone(today),
        fetchReflection(today),
        fetchPastReflections(14),
      ]);
      setKeystoneText(ks);
      setTodayReflection(ref);
      setPastReflections(past);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!entry.trim() || saving) return;
    setSaving(true);
    try {
      await saveReflection(entry, mood, keystoneText || null);
      const today = getTodayKey();
      const ref = await fetchReflection(today);
      setTodayReflection(ref);
    } catch (e) {
      console.error("Save reflection failed:", e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-1 py-2">
        <SkeletonBlock />
      </div>
    );
  }

  const hasTodayReflection = todayReflection !== null;

  return (
    <>
      <section
        className="relative overflow-hidden rounded-[22px] backdrop-blur-xl"
        style={sectionCardStyle}
        aria-label={t.reflect_title}
      >
        {/* Header: same as Keystone — icon + title + subtitle */}
        <div className="mb-1 flex items-center gap-3">
          <Moon className="h-5 w-5 shrink-0 text-white/60" strokeWidth={2} />
          <h2
            className="font-bold text-white"
            style={{ fontSize: 22, margin: 0, letterSpacing: "-0.01em" }}
          >
            {t.reflect_title}
          </h2>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.3)",
            margin: "2px 0 0",
            lineHeight: 1.4,
          }}
        >
          {t.reflect_title_suffix}
        </p>

      {/* Keystone callback — inner card */}
      {keystoneText && (
        <motion.div {...rise(0.05)} className="mt-6 flex gap-3 rounded-[14px] border p-4" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.06)" }}>
          <span
            className="mt-1 block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: "linear-gradient(135deg, #f97316, #ec4899)" }}
          />
          <div className="min-w-0">
            <p
              className="text-[9px] font-bold uppercase tracking-[0.15em]"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {t.reflect_keystone_label}
            </p>
            <p className="mt-1.5 text-[15px] italic text-white/80">{keystoneText}</p>
          </div>
        </motion.div>
      )}

      {/* Reflection form / saved card */}
      <AnimatePresence mode="wait">
        {hasTodayReflection ? (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-[14px] border p-5"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="mb-3 flex items-center gap-2">
              {todayReflection.mood && (
                <span className="text-lg">{moodEmoji(todayReflection.mood)}</span>
              )}
              {todayReflection.mood && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {labels[todayReflection.mood]}
                </span>
              )}
            </div>
            <p className="text-[15px] leading-relaxed text-white/85">
              {todayReflection.entry}
            </p>
            <p
              className="mt-4 text-center text-[13px] italic"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              {t.reflect_see_tomorrow}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            {...rise(0.1)}
            className="mt-6 rounded-[14px] border p-5"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <h3
              className="text-[18px] font-bold text-white"
              style={{ letterSpacing: "-0.01em" }}
            >
              {t.reflect_prompt}
            </h3>
            <p
              className="mt-1 text-[13px]"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {t.reflect_subtext}
            </p>

            <div className="relative mt-4">
              <textarea
                value={entry}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) setEntry(e.target.value);
                }}
                placeholder={t.reflect_placeholder}
                rows={4}
                className="w-full resize-none rounded-xl border bg-transparent p-4 text-[15px] text-white outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-white/20 focus:border-[rgba(193,122,138,0.4)] focus:shadow-[0_0_0_3px_rgba(193,122,138,0.08)]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "rgba(255,255,255,0.08)",
                  lineHeight: 1.6,
                }}
              />
              <span
                className="absolute bottom-3 right-3 text-[11px] tabular-nums"
                style={{ color: entry.length >= 260 ? "rgba(249,115,22,0.7)" : "rgba(255,255,255,0.2)" }}
              >
                {entry.length}/{MAX_CHARS}
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              {MOODS.map((m) => {
                const active = mood === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMood(active ? null : m.key)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-medium transition-all duration-200"
                    style={
                      active
                        ? {
                            background: "rgba(193,122,138,0.15)",
                            border: "1px solid rgba(193,122,138,0.5)",
                            color: "rgba(255,255,255,0.9)",
                          }
                        : {
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.4)",
                          }
                    }
                  >
                    <span>{m.emoji}</span>
                    <span className="hidden sm:inline">{labels[m.key]}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={!entry.trim() || saving}
              className="mt-4 w-full rounded-2xl py-[14px] text-[15px] font-bold text-white transition-all duration-300 active:scale-[0.98]"
              style={
                entry.trim()
                  ? {
                      background: "linear-gradient(135deg, #c17a5a, #a05570)",
                      boxShadow: "0 6px 24px rgba(170,90,80,0.35)",
                      opacity: saving ? 0.6 : 1,
                      cursor: saving ? "wait" : "pointer",
                    }
                  : {
                      background: "rgba(255,255,255,0.08)",
                      opacity: 0.4,
                      cursor: "not-allowed",
                    }
              }
            >
              {t.reflect_save}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </section>

      {/* Past reflections — outside main card, same as before */}
      {pastReflections.length > 0 && (
        <motion.div {...rise(0.15)} className="mt-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span
              className="shrink-0 text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              {t.reflect_past_title}
            </span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          <div className="space-y-2.5">
            {pastReflections.map((r) => {
              const isExpanded = expandedId === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  className="w-full rounded-[16px] p-4 text-left transition-colors"
                  style={cardStyle}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{moodEmoji(r.mood)}</span>
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      {formatDateShort(r.date, locale)}
                    </span>
                    <ChevronDown
                      className="ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-200"
                      style={{
                        color: "rgba(255,255,255,0.2)",
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </div>
                  <p
                    className={`mt-2 text-[14px] leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {r.entry}
                  </p>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </>
  );
}
