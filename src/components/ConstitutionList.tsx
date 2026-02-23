"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, ChevronRight, Play, Pause, Square, Check, BookOpen } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { STORAGE_KEYS, setHasEditedContent } from "@/lib/constants";
import { fetchPrinciples, upsertPrinciple, deletePrinciple } from "@/lib/db";
import { createClient } from "@/utils/supabase/client";
import { usePlan } from "@/hooks/usePlan";
import { canAddPrinciple, FREE_PRINCIPLES_LIMIT } from "@/lib/subscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { SkeletonCard } from "@/components/SkeletonCard";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { trackConstitutionRead } from "@/lib/analytics";
import { getTodayCompletionDetail, setConstitutionDoneForToday } from "@/lib/streak";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

export interface Principle {
  id: string;
  text: string;
  subtitle?: string;
}

type DefaultPrinciple = { id: number; text: string; subtitle: string };

function normalizePrinciple(
  p: { id?: string; text?: string; subtitle?: string } | string,
  i: number
): Principle {
  if (typeof p === "string") {
    return { id: `default-${i}`, text: p };
  }
  const text = typeof p.text === "string" ? p.text : "";
  return {
    id: p.id ?? `default-${i}`,
    text,
    subtitle: typeof p.subtitle === "string" ? p.subtitle : undefined,
  };
}

function getStoredPrinciples(
  defaultPrinciples: readonly DefaultPrinciple[] | readonly string[]
): Principle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRINCIPLES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p: { id?: string; text?: string; subtitle?: string } | string, i: number) =>
          normalizePrinciple(p, i)
        );
      }
    }
  } catch {
    // ignore
  }
  return defaultPrinciples.map((p, i) =>
    typeof p === "string"
      ? normalizePrinciple(p, i)
      : normalizePrinciple(
          { id: `default-${p.id}`, text: p.text, subtitle: p.subtitle },
          i
        )
  );
}

function getAcknowledgementDate(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.ACKNOWLEDGED_DATE);
}

function isAcknowledgedToday(): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return getAcknowledgementDate() === today;
}

export function ConstitutionList(props: { onGoToKeystone?: () => void } = {}) {
  const { onGoToKeystone } = props;
  const { t } = useLanguage();
  const { profile, isPro } = usePlan();
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [newPrinciple, setNewPrinciple] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showCompletionCard, setShowCompletionCard] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const constitutionSyncedRef = useRef(false);

  const { texts: speechTexts, delaysAfter: speechDelays } = useMemo(() => {
    const t: string[] = [];
    const d: number[] = [];
    principles.forEach((p) => {
      t.push(p.text);
      t.push((p.subtitle ?? "").trim());
      d.push(500);
      d.push(1000);
    });
    if (d.length > 0) d[d.length - 1] = 0;
    return { texts: t, delaysAfter: d };
  }, [principles]);

  const handleListenComplete = useCallback(() => {
    const allChecked: Record<string, boolean> = {};
    principles.forEach((p) => {
      allChecked[p.id] = true;
    });
    setAcknowledged(allChecked);
    if (typeof window !== "undefined") {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.ACKNOWLEDGED_DATE, today);
      const key = "analytics_constitution_read";
      if (localStorage.getItem(key) !== today) {
        localStorage.setItem(key, today);
        trackConstitutionRead();
      }
    }
    setConstitutionDoneForToday()
      .then(() => setShowCompletionCard(true))
      .catch(() => {});
  }, [principles]);

  const {
    play: startListen,
    pause: pauseListen,
    resume: resumeListen,
    stop: stopListen,
    isPlaying: isListenPlaying,
    isPaused: isListenPaused,
    currentIndex: listenSegmentIndex,
    isSupported: isSpeechSupported,
  } = useTextToSpeech({
    texts: speechTexts,
    delaysAfter: speechDelays,
    rate: 0.9,
    pitch: 1,
    onProgress: () => {},
    onComplete: handleListenComplete,
  });

  const listenPrincipleIndex = listenSegmentIndex < 0 ? -1 : Math.floor(listenSegmentIndex / 2);
  const isListening = isListenPlaying || isListenPaused;

  useEffect(() => {
    if (!isListening) return;
    return () => {
      stopListen();
    };
  }, [isListening, stopListen]);

  const handleListenClick = useCallback(() => {
    if (!isSpeechSupported) {
      setToastMessage(t.constitution_audio_unsupported);
      return;
    }
    if (isListening) {
      stopListen();
      startListen();
    } else {
      startListen();
    }
  }, [isSpeechSupported, isListening, stopListen, startListen, t.constitution_audio_unsupported]);

  useEffect(() => {
    if (!toastMessage) return;
    const id = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(id);
  }, [toastMessage]);

  useEffect(() => {
    setMounted(true);
    let principlesLoaded = false;
    const load = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const data = await fetchPrinciples();
          if (data.length > 0) {
            setPrinciples(
              data.map(({ id, text, subtitle }) => ({ id, text, subtitle }))
            );
            principlesLoaded = true;
          }
        }
      } catch {
        // ignore
      }
      if (!principlesLoaded) {
        setPrinciples(getStoredPrinciples(t.default_principles));
      }
      const ackToday = isAcknowledgedToday();
      if (ackToday) {
        const stored = principlesLoaded ? [] : getStoredPrinciples(t.default_principles);
        const allChecked: Record<string, boolean> = {};
        (principlesLoaded ? (await fetchPrinciples()).map((p) => ({ id: p.id })) : stored.map((p) => ({ id: p.id }))).forEach((p) => {
          allChecked[p.id] = true;
        });
        setAcknowledged((prev) => (Object.keys(prev).length > 0 ? prev : allChecked));
      }
      const detail = await getTodayCompletionDetail().catch(() => null);
      setShowCompletionCard(detail?.constitution_done ?? false);
      constitutionSyncedRef.current = detail?.constitution_done ?? false;
    };
    load();
  }, [t.default_principles]);

  const savePrinciples = useCallback((next: Principle[]) => {
    setPrinciples(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PRINCIPLES, JSON.stringify(next));
    }
    next.forEach((p, i) => {
      upsertPrinciple({ ...p, order_index: i }).catch(console.error);
    });
    setHasEditedContent();
  }, []);

  useEffect(() => {
    const allChecked = principles.length > 0 && principles.every((p) => acknowledged[p.id]);
    if (!allChecked || constitutionSyncedRef.current) return;
    constitutionSyncedRef.current = true;
    setConstitutionDoneForToday()
      .then(() => setShowCompletionCard(true))
      .catch(() => {
        constitutionSyncedRef.current = false;
      });
  }, [principles.length, acknowledged]);

  const handleCheck = (id: string) => {
    setAcknowledged((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const allChecked = principles.every((p) => next[p.id]);
      if (allChecked && typeof window !== "undefined") {
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem(STORAGE_KEYS.ACKNOWLEDGED_DATE, today);
        const key = "analytics_constitution_read";
        if (localStorage.getItem(key) !== today) {
          localStorage.setItem(key, today);
          trackConstitutionRead();
        }
      }
      return next;
    });
  };

  const canAdd = canAddPrinciple(principles.length, profile);

  const handleAdd = () => {
    if (!canAdd) return;
    const trimmed = newPrinciple.trim();
    if (!trimmed) return;
    const id = `principle-${Date.now()}`;
    const subtitleTrimmed = newSubtitle.trim();
    const next = [
      ...principles,
      { id, text: trimmed, subtitle: subtitleTrimmed || undefined } as Principle,
    ];
    savePrinciples(next);
    setNewPrinciple("");
    setNewSubtitle("");
  };

  const handleRemove = (id: string) => {
    savePrinciples(principles.filter((p) => p.id !== id));
    deletePrinciple(id).catch(console.error);
    setEditId(null);
  };

  const handleStartEdit = (p: Principle) => {
    setEditId(p.id);
    setEditText(p.text);
  };

  const handleSaveEdit = () => {
    if (!editId) return;
    const trimmed = editText.trim();
    if (!trimmed) {
      handleRemove(editId);
      return;
    }
    savePrinciples(
      principles.map((p) =>
        p.id === editId ? { ...p, text: trimmed } : p
      )
    );
    setEditId(null);
  };

  if (!mounted) {
    return <SkeletonCard variant="list" lines={4} />;
  }

  const showCard = showCompletionCard && !reviewing;
  const affirmedCount = principles.length;

  const cardStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 22,
    padding: "22px 20px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)" as const,
  };

  return (
    <section
      className="relative overflow-hidden rounded-[22px] backdrop-blur-xl"
      style={cardStyle}
      aria-label={t.principles_title}
    >
      <div className="mb-1 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 shrink-0 text-white/60" strokeWidth={2} />
          <h2
            className="font-bold text-white"
            style={{ fontSize: 22, margin: 0, letterSpacing: "-0.01em" }}
          >
            {t.principles_title}
          </h2>
        </div>
        {!showCard && (
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="border-0 bg-transparent p-0.5 text-[rgba(255,255,255,0.25)] transition-colors hover:text-white/50"
            style={{ fontSize: 16 }}
            aria-label={isEditing ? t.done_editing : t.edit_principles}
          >
            ✎
          </button>
        )}
      </div>
      <p
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.3)",
          margin: "4px 0 0",
          lineHeight: 1.4,
        }}
      >
        {t.principles_subtitle}
      </p>

      {!showCard && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-white/30">
            {principles.length} {principles.length === 1 ? "principle" : "principles"}
            {" · "}
            {principles.length <= 3 ? "1 min" : `${Math.ceil((principles.length * 25) / 60)} min`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleListenClick}
              className="flex items-center gap-1.5 rounded-[10px] border px-3.5 py-1.5 text-xs font-semibold transition-colors"
              style={
                showCompletionCard
                  ? {
                      background: "rgba(34,197,94,0.15)",
                      borderColor: "rgba(34,197,94,0.3)",
                      color: "rgba(34,197,94,0.95)",
                    }
                  : {
                      background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(236,72,153,0.1))",
                      borderColor: "rgba(249,115,22,0.2)",
                      color: "rgba(249,115,22,0.85)",
                    }
              }
              aria-label={showCompletionCard ? t.constitution_listened : t.constitution_listen}
            >
              {showCompletionCard ? (
                <>
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  {t.constitution_listened}
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
                  {t.constitution_listen}
                </>
              )}
            </button>
            {toastMessage && (
              <p className="text-xs text-amber-400/90" role="alert">
                {toastMessage}
              </p>
            )}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {showCard ? (
          <motion.div
            key="constitution-complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="animate-completion-reveal mt-6 flex flex-col items-center justify-center rounded-2xl border p-5 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(74,222,128,0.04))",
              borderColor: "rgba(34,197,94,0.12)",
            }}
          >
            <div className="mb-2 text-[32px]">🌅</div>
            <p className="mb-1 font-bold text-white" style={{ fontSize: 16, margin: "0 0 4px" }}>
              Constitution complete
            </p>
            <p className="text-[13px] text-white/40" style={{ margin: 0 }}>
              {affirmedCount} {affirmedCount === 1 ? "principle" : "principles"} affirmed
            </p>
            {onGoToKeystone && (
              <button
                type="button"
                onClick={onGoToKeystone}
                className="mt-4 flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ec4899)",
                  boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
                }}
              >
                Set Your Keystone
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setReviewing(true)}
              className="mt-3 text-xs text-white/50 underline underline-offset-2 transition-colors hover:text-white/70"
            >
              Review
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="constitution-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-6"
          >
            {showCompletionCard && reviewing && (
              <button
                type="button"
                onClick={() => setReviewing(false)}
                className="mb-3 font-mono text-xs text-white/50 underline underline-offset-2 transition-colors hover:text-white/70"
              >
                ← Back to summary
              </button>
            )}
      <ul className="mt-6 flex flex-col gap-2">
                {principles.map((p, principleIdx) => (
                  <motion.li
                    key={p.id}
                    layout
                    className="flex items-start gap-4 rounded-[14px] border transition-all duration-300"
                    style={{
                      padding: 14,
                      paddingLeft: listenPrincipleIndex === principleIdx ? 11 : 14,
                      background:
                        listenPrincipleIndex === principleIdx
                          ? "rgba(255,255,255,0.07)"
                          : isListening
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(255,255,255,0.04)",
                      borderColor:
                        listenPrincipleIndex === principleIdx
                          ? "rgba(249,115,22,0.2)"
                          : "rgba(255,255,255,0.06)",
                      borderLeftWidth: listenPrincipleIndex === principleIdx ? 3 : 1,
                      borderLeftColor:
                        listenPrincipleIndex === principleIdx
                          ? "rgba(249,115,22,0.6)"
                          : "rgba(255,255,255,0.06)",
                      opacity: isListening && listenPrincipleIndex !== principleIdx ? 0.4 : 1,
                    }}
                  >
                    {editId === p.id ? (
                      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                          className="flex-1 rounded-[14px] border px-4 py-2.5 text-white/95 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                          style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="rounded-[14px] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            style={{
                              background: "linear-gradient(135deg, #f97316, #ec4899)",
                              boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
                            }}
                          >
                            {t.save}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(p.id)}
                            className="rounded-[14px] p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
                            aria-label={t.remove}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-start justify-between gap-4">
                          <p
                            className={`min-w-0 break-words font-sans text-base font-normal leading-relaxed drop-shadow-md ${
                              acknowledged[p.id] ? "opacity-40 line-through text-white/95" : "text-white/95"
                            }`}
                          >
                            {p.text}
                          </p>
                        <div className="flex shrink-0 items-center gap-1">
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(p)}
                              className="touch-target flex items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
                              aria-label={`${t.edit_principle}: ${p.text}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          <AnimatedCheckbox
                            checked={!!acknowledged[p.id]}
                            onToggle={() => handleCheck(p.id)}
                            aria-label={`${t.acknowledge}: ${p.text}`}
                          />
                        </div>
                        </div>
                        {p.subtitle && (
                          <p
                            className={`font-mono text-xs tracking-wider text-white/50 ${
                              acknowledged[p.id] ? "opacity-40" : ""
                            }`}
                          >
                            {p.subtitle}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.li>
        ))}
      </ul>

      {isListening && (
        <div
          className="mt-4 flex items-center gap-3 rounded-[14px] px-4 py-2.5"
          style={{
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            type="button"
            onClick={isListenPlaying ? pauseListen : resumeListen}
            className="flex items-center justify-center text-white/90 transition-opacity hover:opacity-100"
            aria-label={isListenPlaying ? "Pause" : "Resume"}
          >
            {isListenPlaying ? (
              <Pause className="h-5 w-5" strokeWidth={2} />
            ) : (
              <Play className="h-5 w-5" fill="currentColor" strokeWidth={0} />
            )}
          </button>
          <button
            type="button"
            onClick={stopListen}
            className="flex items-center justify-center text-white/70 transition-opacity hover:text-white/90"
            aria-label="Stop"
          >
            <Square className="h-4 w-4" fill="currentColor" strokeWidth={0} />
          </button>
          <span className="text-xs font-medium tabular-nums text-white/60">
            {t.constitution_listen_progress
              .replace("{{current}}", String(listenPrincipleIndex + 1))
              .replace("{{total}}", String(principles.length))}
          </span>
        </div>
      )}

      {isEditing && (
        <div className="mt-4 flex flex-col gap-2">
          {!canAdd ? (
            <UpgradePrompt
              message={`Free accounts can have up to ${FREE_PRINCIPLES_LIMIT} principles. Upgrade to Pro for unlimited.`}
            />
          ) : (
            <>
              <input
                type="text"
                value={newPrinciple}
                onChange={(e) => setNewPrinciple(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder={t.add_principle_placeholder}
                className="min-h-[44px] rounded-[14px] border px-4 py-2.5 text-base text-white/95 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}
              />
              <input
                type="text"
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder={t.add_principle_subtitle_placeholder}
                className="min-h-[44px] rounded-[14px] border px-4 py-2.5 text-base text-white/80 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}
              />
              <button
                type="button"
                onClick={handleAdd}
                className="flex w-fit items-center gap-2 rounded-[14px] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ec4899)",
                  boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
                }}
              >
                <Plus className="h-4 w-4" />
                {t.add}
              </button>
            </>
          )}
        </div>
      )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
