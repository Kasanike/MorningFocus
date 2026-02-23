"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, ChevronRight, Play, Square, Check, BookOpen, ChevronUp, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { STORAGE_KEYS, setHasEditedContent } from "@/lib/constants";
import { fetchPrinciples, upsertPrinciple, deletePrinciple } from "@/lib/db";
import { createClient } from "@/utils/supabase/client";
import { usePlan } from "@/hooks/usePlan";
import { canAddPrinciple } from "@/lib/subscription";
import { SkeletonCard } from "@/components/SkeletonCard";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { trackConstitutionRead } from "@/lib/analytics";
import { getTodayCompletionDetail, setConstitutionDoneForToday } from "@/lib/streak";

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
  const [isAdding, setIsAdding] = useState(false);
  const [newPrinciple, setNewPrinciple] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showCompletionCard, setShowCompletionCard] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const constitutionSyncedRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

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

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [readyToPlay, setReadyToPlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const cachedContentKeyRef = useRef<string | null>(null);

  const handleListen = useCallback(async () => {
    if (isSpeaking) {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      setIsSpeaking(false);
      return;
    }

    // Second tap: play prepared audio (user gesture so browser allows it)
    if (readyToPlay && audioRef.current) {
      setReadyToPlay(false);
      setToastMessage(null);
      audioRef.current.play().then(() => setIsSpeaking(true)).catch(() => {
        setToastMessage(t.constitution_audio_load_failed);
      });
      return;
    }

    if (isLoading) return;

    const text = principles
      .map((p) => (p.subtitle ? `${p.text}. ${p.subtitle}` : p.text))
      .join(". ");
    if (!text.trim()) return;

    // Reuse cached audio if principles unchanged (edit/add invalidates cache)
    if (cachedContentKeyRef.current === text && audioRef.current) {
      audioRef.current.currentTime = 0;
      setReadyToPlay(true);
      return;
    }

    // New content or no cache: revoke previous and fetch
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    cachedContentKeyRef.current = null;

    setIsLoading(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        setToastMessage(t.constitution_audio_load_failed);
        return;
      }

      const blob = await res.blob();
      const playbackUrl = URL.createObjectURL(blob);
      blobUrlRef.current = playbackUrl;
      cachedContentKeyRef.current = text;

      const audio = new Audio(playbackUrl);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        setReadyToPlay(false);
        handleListenComplete();
      };
      audio.onerror = () => {
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }
        cachedContentKeyRef.current = null;
        setIsSpeaking(false);
        setReadyToPlay(false);
        setIsLoading(false);
      };

      setReadyToPlay(true);
      setIsLoading(false);
    } catch {
      cachedContentKeyRef.current = null;
      setToastMessage(t.constitution_audio_load_failed);
    } finally {
      setIsLoading(false);
    }
  }, [
    isSpeaking,
    readyToPlay,
    isLoading,
    principles,
    handleListenComplete,
    t.constitution_audio_load_failed,
  ]);

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
      if (!initialLoadDoneRef.current) {
        initialLoadDoneRef.current = true;
        setShowCompletionCard(detail?.constitution_done ?? false);
        constitutionSyncedRef.current = detail?.constitution_done ?? false;
      }
    };
    load();
  }, [t.default_principles]);

  const savePrinciples = useCallback((next: Principle[]) => {
    setPrinciples(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PRINCIPLES, JSON.stringify(next));
    }
    next.forEach((p, i) => {
      upsertPrinciple({ ...p, order_index: i }).catch((err) => console.error("Upsert principle failed:", err));
    });
    setHasEditedContent();
  }, []);

  useEffect(() => {
    const allChecked = principles.length > 0 && principles.every((p) => acknowledged[p.id]);
    if (!allChecked) return;
    if (constitutionSyncedRef.current) {
      setShowCompletionCard(true);
      return;
    }
    constitutionSyncedRef.current = true;
    setShowCompletionCard(true);
    setConstitutionDoneForToday().catch(() => {
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
    setIsAdding(false);
  };

  const handleRemove = (id: string) => {
    savePrinciples(principles.filter((p) => p.id !== id));
    deletePrinciple(id).catch((err) => console.error("Delete principle failed:", err));
    setEditId(null);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...principles];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    savePrinciples(next);
  };

  const handleMoveDown = (index: number) => {
    if (index >= principles.length - 1) return;
    const next = [...principles];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    savePrinciples(next);
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
              onClick={handleListen}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-[10px] border px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60"
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
              aria-label={
                isLoading ? undefined : isSpeaking ? "Stop" : readyToPlay ? t.constitution_start_listening : t.constitution_listen
              }
            >
              {showCompletionCard ? (
                <>
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  {t.constitution_listened}
                </>
              ) : isLoading ? (
                "Preparing"
              ) : readyToPlay ? (
                <>
                  <Play className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
                  {t.constitution_start_listening}
                </>
              ) : isSpeaking ? (
                <>
                  <Square className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
                  Stop
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
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.06)",
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
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <button
                              type="button"
                              disabled={principleIdx <= 0}
                              onClick={() => handleMoveUp(principleIdx)}
                              className="flex items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 disabled:opacity-30 disabled:pointer-events-none"
                              aria-label="Move up"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              disabled={principleIdx >= principles.length - 1}
                              onClick={() => handleMoveDown(principleIdx)}
                              className="flex items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 disabled:opacity-30 disabled:pointer-events-none"
                              aria-label="Move down"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>
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
                            <>
                              <div className="flex flex-col">
                                <button
                                  type="button"
                                  disabled={principleIdx <= 0}
                                  onClick={() => handleMoveUp(principleIdx)}
                                  className="flex items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 disabled:opacity-30 disabled:pointer-events-none"
                                  aria-label="Move up"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  disabled={principleIdx >= principles.length - 1}
                                  onClick={() => handleMoveDown(principleIdx)}
                                  className="flex items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 disabled:opacity-30 disabled:pointer-events-none"
                                  aria-label="Move down"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(p)}
                                className="touch-target flex items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
                                aria-label={`${t.edit_principle}: ${p.text}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </>
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

      {!showCard && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            {isEditing && canAdd && isAdding && (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={newPrinciple}
                  onChange={(e) => setNewPrinciple(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder={t.add_principle_placeholder}
                  className="min-h-[44px] rounded-[14px] border px-4 py-2.5 text-base text-white/95 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}
                  autoFocus
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
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #f97316, #ec4899)",
                      boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    {t.add}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setNewPrinciple("");
                      setNewSubtitle("");
                    }}
                    className="min-h-[44px] rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white/90"
                  >
                    {t.cancel}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border-0 px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                    aria-label={t.done_editing}
                  >
                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span>{t.done_editing}</span>
                  </button>
                </div>
              </div>
            )}
            {isEditing && !isAdding && (
              <button
                type="button"
                className="touch-target flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-5 py-2 text-sm font-medium text-white/60 transition-colors hover:border-white/40 hover:bg-white/5 hover:text-white/80"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-4 w-4" />
                {t.add_principle}
              </button>
            )}
          </div>
          {!(isEditing && canAdd && isAdding) && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border-0 px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{
                background: "rgba(255,255,255,0.08)",
                borderColor: "rgba(255,255,255,0.1)",
              }}
              aria-label={isEditing ? t.done_editing : t.edit_principles}
            >
              <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span>{isEditing ? t.done_editing : t.keystone_edit}</span>
            </button>
          )}
        </div>
      )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
