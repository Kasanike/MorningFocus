"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Play, Square, Check, ChevronUp, ChevronDown, BookOpen } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { STORAGE_KEYS, setHasEditedContent } from "@/lib/constants";
import { fetchPrinciples, upsertPrinciple, deletePrinciple } from "@/lib/db";
import { createClient } from "@/utils/supabase/client";
import { usePlan } from "@/hooks/usePlan";
import { canAddPrinciple } from "@/lib/subscription";
import { SkeletonCard } from "@/components/SkeletonCard";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { SectionSuccessCard } from "@/components/ui/SectionSuccessCard";
import { cn } from "@/lib/utils";
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

  return (
    <>
      {/* Section header card */}
      <div className="mx-4 mb-3 px-4 py-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden />
            <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">
              {t.principles_title}
            </h2>
          </div>
          {showCard ? (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full
                             bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ✓ Complete
            </span>
          ) : (
            <button
              type="button"
              onClick={handleListen}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60",
                showCompletionCard
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "border-zinc-600 bg-zinc-50 text-zinc-950 hover:bg-zinc-200"
              )}
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
          )}
        </div>
      </div>
      {toastMessage && (
        <p className="mx-4 mb-2 text-xs text-amber-400/90" role="alert">{toastMessage}</p>
      )}

      <AnimatePresence mode="wait">
        {showCard ? (
          <div className="mx-4 mt-6">
            <SectionSuccessCard
              key="constitution-complete"
              label="Constitution complete"
              title="You affirmed your principles."
              subtitle={`${affirmedCount} ${affirmedCount === 1 ? "principle" : "principles"} affirmed`}
              primaryButton={
                onGoToKeystone
                  ? { label: "Set Your Keystone", onClick: onGoToKeystone }
                  : { label: "Done", onClick: () => {} }
              }
              secondaryButton={{ label: "Review", onClick: () => setReviewing(true) }}
            />
          </div>
        ) : (
          <motion.div
            key="constitution-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-4 mt-6"
          >
            {showCompletionCard && reviewing && (
              <button
                type="button"
                onClick={() => setReviewing(false)}
                className="mb-3 text-xs text-white/50 underline underline-offset-2 transition-colors hover:text-white/70"
              >
                ← Back to summary
              </button>
            )}
      <ul className="mt-6 flex flex-col gap-2">
                {principles.map((p, principleIdx) => (
                  <motion.li
                    key={p.id}
                    layout
                    className="list-none"
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
                            className="rounded-[14px] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 bg-zinc-600"
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
                      <div
                        className={cn(
                          "px-4 py-4 rounded-2xl border transition-all duration-300",
                          acknowledged[p.id] ? "border-orange-500/50" : "border-zinc-800/80"
                        )}
                        style={{
                          background: acknowledged[p.id] ? "rgba(249,115,22,0.06)" : "rgba(24,24,27,0.5)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p
                              className={cn(
                                "text-sm font-medium leading-snug transition-all duration-300",
                                acknowledged[p.id] ? "line-through text-white/95" : "text-zinc-100"
                              )}
                              style={acknowledged[p.id] ? { opacity: 0.4 } : {}}
                            >
                              {p.text}
                            </p>
                            {p.subtitle != null && p.subtitle !== "" && (
                              <p
                                className="text-xs text-zinc-500 mt-1.5 leading-relaxed font-normal font-sans transition-opacity duration-300"
                                style={acknowledged[p.id] ? { opacity: 0.4 } : {}}
                              >
                                {p.subtitle}
                              </p>
                            )}
                          </div>
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
                              variant="primary"
                              checked={!!acknowledged[p.id]}
                              onToggle={() => handleCheck(p.id)}
                              aria-label={`${t.acknowledge}: ${p.text}`}
                            />
                          </div>
                        </div>
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
                    className="flex items-center gap-2 rounded-[14px] bg-zinc-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
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
    </>
  );
}
