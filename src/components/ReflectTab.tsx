"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Moon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/utils/supabase/client";
import {
  fetchKeystone,
  fetchReflection,
  fetchPastReflections,
  setReflectionDidComplete,
  updateReflectionNote,
  type ReflectionEntry,
} from "@/lib/db";

const MAX_NOTE_CHARS = 280;
const DEBOUNCE_MS = 500;

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

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay } },
});

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 18,
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
        <div className={`mt-4 h-24 w-full rounded-xl ${bar}`} />
      </div>
    </div>
  );
}

export function ReflectTab() {
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [keystoneText, setKeystoneText] = useState<string>("");
  const [todayReflection, setTodayReflection] = useState<ReflectionEntry | null>(null);
  const [pastReflections, setPastReflections] = useState<ReflectionEntry[]>([]);
  const [savingDidComplete, setSavingDidComplete] = useState(false);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (ref?.reflection_note != null) setNote(ref.reflection_note);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hasAnsweredDidComplete =
    todayReflection != null && todayReflection.did_complete !== undefined && todayReflection.did_complete !== null;
  const didComplete = todayReflection?.did_complete ?? null;

  const handleDidComplete = async (value: boolean) => {
    if (hasAnsweredDidComplete || savingDidComplete) return;
    setSavingDidComplete(true);
    try {
      await setReflectionDidComplete(value, keystoneText || null);
      const ref = await fetchReflection(getTodayKey());
      setTodayReflection(ref);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Save did_complete failed:", message);
    } finally {
      setSavingDidComplete(false);
    }
  };

  const saveNoteDebounced = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        debounceRef.current = null;
        setSavingNote(true);
        try {
          await updateReflectionNote(value);
          const ref = await fetchReflection(getTodayKey());
          if (ref) setTodayReflection(ref);
        } catch (e) {
          console.error("Save reflection_note failed:", e);
        } finally {
          setSavingNote(false);
        }
      }, DEBOUNCE_MS);
    },
    []
  );

  const handleNoteBlur = () => {
    saveNoteDebounced(note);
  };

  const handleNoteChange = (value: string) => {
    if (value.length > MAX_NOTE_CHARS) return;
    setNote(value);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="px-1 py-2">
        <SkeletonBlock />
      </div>
    );
  }

  const showSeeYouTomorrow = hasAnsweredDidComplete;

  return (
    <>
      {/* Section header card */}
      <div className="mx-4 mb-3 px-4 py-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden />
          <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">
            {t.reflect_title}
          </h2>
        </div>
      </div>
      <section
        className="mx-4 relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 px-4 py-4"
        aria-label={t.reflect_title}
      >
        {/* SECTION 1 — This Morning's Keystone */}
        {keystoneText && (
          <motion.div
            {...rise(0.05)}
            className="flex gap-3 rounded-[14px] border p-4"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <span
              className="mt-1 block h-2.5 w-2.5 shrink-0 rounded-full bg-zinc-500"
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

        {/* SECTION 2 — Did you do it? */}
        <motion.div {...rise(0.08)} className={keystoneText ? "mt-4" : ""}>
          <p
            className="mb-3 text-[15px] font-semibold text-white/90"
            style={{ letterSpacing: "-0.01em" }}
          >
            {t.reflect_did_you_do_it}
          </p>
          {hasAnsweredDidComplete ? (
            <div
              className="flex h-14 items-center justify-center gap-2 rounded-xl border"
              style={
                didComplete === true
                  ? {
                      background: "rgba(34,197,94,0.12)",
                      borderColor: "rgba(34,197,94,0.25)",
                    }
                  : {
                      background: "rgba(120,80,160,0.12)",
                      borderColor: "rgba(255,255,255,0.12)",
                    }
              }
            >
              {didComplete === true ? (
                <>
                  <Check className="h-5 w-5 text-emerald-400" strokeWidth={2.5} />
                  <span className="text-[14px] font-semibold text-white/95">{t.reflect_yes_did_it}</span>
                </>
              ) : (
                <span className="text-[14px] font-medium text-white/70">{t.reflect_not_quite}</span>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDidComplete(true)}
                disabled={savingDidComplete}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl border-0 bg-orange-500 text-white font-semibold shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all duration-150 ease-out hover:bg-orange-600 disabled:opacity-60"
              >
                <Check className="h-5 w-5" strokeWidth={2.5} />
                <span className="text-[14px]">{t.reflect_crushed_it}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDidComplete(false)}
                disabled={savingDidComplete}
                className="flex h-14 flex-1 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-400 transition-all duration-150 ease-out hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-60"
              >
                <span className="text-[14px] font-medium">Not quite</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* SECTION 3 — What happened? (only after yes/no answered) */}
        <AnimatePresence>
          {hasAnsweredDidComplete && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-6"
            >
              <p
                className="mb-3 text-[15px] font-semibold text-white/90"
                style={{ letterSpacing: "-0.01em" }}
              >
                {t.reflect_what_happened}
              </p>
              <div className="relative">
                <textarea
                  value={note}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  onBlur={handleNoteBlur}
                  placeholder={t.reflect_note_placeholder}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-zinc-800 py-3 pl-4 pr-4 pt-3 text-[15px] text-white outline-none transition-colors duration-200 placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  style={{
                    lineHeight: 1.5,
                    background: "rgba(255,255,255,0.05)",
                  }}
                />
                <span
                  className="absolute bottom-3 right-3 text-[11px] tabular-nums text-zinc-500"
                >
                  {note.length}/{MAX_NOTE_CHARS}
                </span>
              </div>
              {savingNote && (
                <p className="mt-1 text-[11px] text-white/40">Saving…</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 4 — See you tomorrow */}
        {showSeeYouTomorrow && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center text-[13px] italic"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            {t.reflect_see_tomorrow}
          </motion.p>
        )}
      </section>

      {/* Past reflections */}
      {pastReflections.length > 0 && (
        <motion.div {...rise(0.15)} className="mt-6 mx-4">
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
              const displayText = r.reflection_note || r.entry || "—";
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  className="w-full rounded-[16px] p-4 text-left transition-colors"
                  style={cardStyle}
                >
                  <div className="flex items-center gap-2.5">
                    {r.did_complete !== undefined && r.did_complete !== null && (
                      <span className="text-sm">
                        {r.did_complete ? "✓" : "○"}
                      </span>
                    )}
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
                    {displayText}
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
