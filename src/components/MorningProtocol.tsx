"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, ChevronRight, ChevronUp, ChevronDown, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useProtocolProgress } from "@/context/ProtocolProgressContext";
import { useStreak } from "@/context/StreakContext";
import { STORAGE_KEYS, setHasEditedContent } from "@/lib/constants";
import {
  fetchProtocolSteps,
  upsertProtocolStep,
  deleteProtocolStep,
  saveTimerSession,
} from "@/lib/db";
import { createClient } from "@/utils/supabase/client";
import { usePlan } from "@/hooks/usePlan";
import { canAddProtocolStep } from "@/lib/subscription";
import { ProtocolListItem, type ProtocolStep } from "./ProtocolListItem";
import ProtocolTimer from "./ProtocolTimer";
import { SkeletonCard } from "@/components/SkeletonCard";
import { SectionSuccessCard } from "@/components/ui/SectionSuccessCard";
import { trackProtocolCompleted } from "@/lib/analytics";
import {
  getTodayCompletionDetail,
  setProtocolDoneForToday,
  setProtocolUndoneForToday,
} from "@/lib/streak";

export type { ProtocolStep };

const DEFAULT_PROTOCOL_MINUTES = [5, 3, 10, 10, 5, 10, 10, 15] as const;

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getStoredSteps(
  defaultLabels: readonly string[],
  defaultMinutes: readonly number[]
): ProtocolStep[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MORNING_PROTOCOL);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((s: { id?: string; label?: string; minutes?: number }, i: number) => ({
          id: s.id ?? `step-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          label: typeof s.label === "string" ? s.label : "",
          minutes:
            typeof s.minutes === "number" && s.minutes >= 0
              ? s.minutes
              : (defaultMinutes[i] ?? 0),
        }));
      }
    }
  } catch {
    // ignore
  }
  return defaultLabels.map((label, i) => ({
    id: `default-${i}`,
    label,
    minutes: defaultMinutes[i] ?? 0,
  }));
}

function saveSteps(steps: ProtocolStep[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.MORNING_PROTOCOL, JSON.stringify(steps));
}

function getStoredCompleted(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MORNING_PROTOCOL_COMPLETED);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed?.date === getTodayKey() && parsed?.completed && typeof parsed.completed === "object") {
      return parsed.completed;
    }
    return {};
  } catch {
    return {};
  }
}

function saveCompleted(completed: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEYS.MORNING_PROTOCOL_COMPLETED,
    JSON.stringify({ date: getTodayKey(), completed })
  );
}

function getStoredCompletionTimeSeconds(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROTOCOL_COMPLETION_TIME);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.date === getTodayKey() && typeof parsed?.totalSeconds === "number") {
      return parsed.totalSeconds;
    }
    return null;
  } catch {
    return null;
  }
}

function saveCompletionTimeSeconds(totalSeconds: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEYS.PROTOCOL_COMPLETION_TIME,
    JSON.stringify({ date: getTodayKey(), totalSeconds })
  );
}

function formatTimeTaken(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

export function MorningProtocol({
  onGoToConstitution,
  onGuidedModeChange,
}: {
  onGoToConstitution?: () => void;
  onGuidedModeChange?: (active: boolean) => void;
}) {
  const { t } = useLanguage();
  const { setProgress } = useProtocolProgress();
  const { profile } = usePlan();
  const [steps, setSteps] = useState<ProtocolStep[]>([]);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editMinutes, setEditMinutes] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newMinutes, setNewMinutes] = useState(5);
  const [mounted, setMounted] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    onGuidedModeChange?.(showTimer);
    return () => onGuidedModeChange?.(false);
  }, [showTimer, onGuidedModeChange]);
  const [showCompletionCard, setShowCompletionCard] = useState(false);
  const protocolDoneSyncedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    let stepsLoaded = false;
    const load = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const data = await fetchProtocolSteps();
          if (data.length > 0) {
            setSteps(
              data.map(({ id, label, minutes }) => ({ id, label, minutes }))
            );
            setCompleted(getStoredCompleted());
            stepsLoaded = true;
          }
        }
      } catch {
        // ignore
      }
      if (!stepsLoaded) {
        setSteps(
          getStoredSteps(t.default_protocol_step_labels, DEFAULT_PROTOCOL_MINUTES)
        );
        setCompleted(getStoredCompleted());
      }
      const detail = await getTodayCompletionDetail().catch(() => null);
      setShowCompletionCard(detail?.protocol_done ?? false);
      protocolDoneSyncedRef.current = detail?.protocol_done ?? false;
    };
    load();
  }, [t.default_protocol_step_labels]);

  useEffect(() => {
    const completedCount = Object.values(completed).filter(Boolean).length;
    setProgress(completedCount, steps.length);
    if (
      steps.length > 0 &&
      completedCount === steps.length &&
      typeof window !== "undefined"
    ) {
      const today = new Date().toISOString().slice(0, 10);
      const key = "analytics_protocol_completed";
      if (localStorage.getItem(key) !== today) {
        localStorage.setItem(key, today);
        trackProtocolCompleted();
      }
    }
  }, [completed, steps.length, setProgress]);

  const refreshStreak = useStreak()?.refresh;

  useEffect(() => {
    const completedCount = Object.values(completed).filter(Boolean).length;
    const allDone = steps.length > 0 && completedCount === steps.length;
    if (!allDone) return;
    if (protocolDoneSyncedRef.current) {
      setShowCompletionCard(true);
      return;
    }
    protocolDoneSyncedRef.current = true;
    setShowCompletionCard(true);
    setProtocolDoneForToday()
      .then(() => void refreshStreak?.())
      .catch(() => {
        protocolDoneSyncedRef.current = false;
      });
  }, [steps.length, completed, refreshStreak]);

  const persist = useCallback((next: ProtocolStep[]) => {
    setSteps(next);
    saveSteps(next);
    next.forEach((s, i) => {
      upsertProtocolStep({
        id: s.id,
        label: s.label,
        minutes: s.minutes,
        order_index: i,
      }).catch((err) => console.error("Protocol reorder failed:", err));
    });
    setHasEditedContent();
  }, []);

  const persistCompleted = useCallback((next: Record<string, boolean>) => {
    setCompleted(next);
    saveCompleted(next);
  }, []);

  const handleToggleComplete = (id: string) => {
    persistCompleted({ ...completed, [id]: !completed[id] });
  };

  const canAdd = canAddProtocolStep(steps.length, profile);

  const handleAdd = () => {
    if (!canAdd) return;
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    const id = `step-${Date.now()}`;
    persist([...steps, { id, label: trimmed, minutes: newMinutes }]);
    setNewLabel("");
    setNewMinutes(5);
    setIsAdding(false);
  };

  const handleRemove = (id: string) => {
    persist(steps.filter((s) => s.id !== id));
    deleteProtocolStep(id).catch((err) => console.error("Delete protocol step failed:", err));
    setEditId(null);
    const { [id]: _, ...rest } = completed;
    persistCompleted(rest);
  };

  const handleStartEdit = (s: ProtocolStep) => {
    setEditId(s.id);
    setEditLabel(s.label);
    setEditMinutes(s.minutes);
  };

  const handleSaveEdit = () => {
    if (!editId) return;
    const trimmed = editLabel.trim();
    if (!trimmed) {
      handleRemove(editId);
      return;
    }
    persist(
      steps.map((s) =>
        s.id === editId ? { ...s, label: trimmed, minutes: editMinutes } : s
      )
    );
    setEditId(null);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...steps];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    persist(next);
  };

  const handleMoveDown = (index: number) => {
    if (index >= steps.length - 1) return;
    const next = [...steps];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    persist(next);
  };

  const totalMinutes = steps.reduce((acc, s) => acc + s.minutes, 0);
  const completedCount = Object.values(completed).filter(Boolean).length;
  const allDone = steps.length > 0 && completedCount === steps.length;
  const completionTimeSeconds = getStoredCompletionTimeSeconds();
  const timeTakenLabel =
    completionTimeSeconds != null
      ? formatTimeTaken(completionTimeSeconds)
      : `${totalMinutes} min`;

  const handleRedo = useCallback(() => {
    setShowCompletionCard(false);
    persistCompleted({});
    protocolDoneSyncedRef.current = false;
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.PROTOCOL_COMPLETION_TIME);
    }
    setProtocolUndoneForToday().catch((err) => {
      const msg =
        err instanceof Error
          ? err.message
          : (typeof err === "object" && err !== null ? JSON.stringify(err) : String(err)) || "";
      const display = msg && msg !== "{}" ? msg : "Unknown error";
      console.error("Persist completed failed:", display);
      protocolDoneSyncedRef.current = false;
    });
  }, [persistCompleted]);

  if (!mounted) {
    return <SkeletonCard variant="list" lines={5} />;
  }

  return (
    <section aria-label={t.morning_protocol_aria}>
      {/* Section header card */}
      <div className="mx-4 mb-3 px-4 py-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden />
            <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">
              {t.morning_protocol_title}
            </h2>
          </div>
          {allDone ? (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full
                             bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ✓ Complete
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setShowTimer(true)}
              className="rounded-xl border border-zinc-600 bg-zinc-50 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
            >
              ▶ Begin
            </button>
          )}
        </div>
      </div>
      {!showCompletionCard && (
        <div className="mx-4 mb-3 h-0.5 rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-zinc-400 transition-all duration-500"
            style={{ width: `${(completedCount / Math.max(1, steps.length)) * 100}%` }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {showCompletionCard ? (
          <SectionSuccessCard
            key="protocol-complete"
            label="Morning complete"
            title="You showed up for yourself today."
            subtitle="That matters."
            primaryButton={
              onGoToConstitution
                ? { label: "Go to Constitution", onClick: onGoToConstitution }
                : { label: "Done", onClick: () => {} }
            }
            secondaryButton={{ label: "Redo protocol", onClick: handleRedo }}
          />
        ) : (
          <motion.div
            key="protocol-steps"
            className="mx-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Progress bar moved to header card above */}
            <ol className="flex flex-col gap-2">
              {steps.map((s, i) => (
                <ProtocolListItem
                  key={s.id}
                  step={s}
                  stepIndex={i}
                  isCompleted={!!completed[s.id]}
                  isEditing={editId === s.id}
                  isEditMode={isEditMode}
                  editLabel={editLabel}
                  editMinutes={editMinutes}
                  onToggle={() => handleToggleComplete(s.id)}
                  onStartEdit={() => handleStartEdit(s)}
                  onSaveEdit={handleSaveEdit}
                  onRemove={() => handleRemove(s.id)}
                  onMoveUp={() => handleMoveUp(i)}
                  onMoveDown={() => handleMoveDown(i)}
                  canMoveUp={i > 0}
                  canMoveDown={i < steps.length - 1}
                  onEditLabelChange={setEditLabel}
                  onEditMinutesChange={setEditMinutes}
                  minutesLabel={t.minutes}
                  saveLabel={t.save}
                  removeLabel={t.remove}
                  editPrincipleLabel={t.edit_principle}
                />
              ))}
            </ol>

            {!showCompletionCard && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {isEditMode && canAdd && isAdding && (
                    <div className="flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        placeholder={t.protocol_step_placeholder}
                        className="min-h-[44px] w-full rounded-lg border border-white/20 bg-black/20 px-4 py-2.5 font-sans text-base text-white/95 placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={newMinutes}
                          onChange={(e) => setNewMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className="min-h-[44px] w-20 min-w-[5rem] rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-center text-base text-zinc-100 focus:border-zinc-500 focus:outline-none"
                        />
                        <span className="text-sm text-white/60">{t.minutes}</span>
                        <button
                          type="button"
                          onClick={handleAdd}
                          className="min-h-[44px] min-w-[5rem] rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white/95 transition-colors hover:bg-white/30"
                        >
                          {t.add}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAdding(false);
                            setNewLabel("");
                            setNewMinutes(5);
                          }}
                          className="min-h-[44px] rounded-lg border border-white/20 px-4 py-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white/90"
                        >
                          {t.cancel}
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsEditMode(!isEditMode)}
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
                  {isEditMode && canAdd && !isAdding && (
                    <button
                      type="button"
                      className="touch-target flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-5 py-2 text-sm font-medium text-white/60 transition-colors hover:border-white/40 hover:bg-white/5 hover:text-white/80"
                      onClick={() => setIsAdding(true)}
                    >
                      <Plus className="h-4 w-4" />
                      {t.add_step}
                    </button>
                  )}
                </div>
                {!(isEditMode && canAdd && isAdding) && (
                  <button
                    type="button"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border-0 px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                    aria-label={isEditMode ? t.done_editing : t.edit_principles}
                  >
                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span>{isEditMode ? t.done_editing : t.keystone_edit}</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showTimer && (
        <ProtocolTimer
          steps={steps.map((s) => ({
            id: s.id,
            title: s.label,
            duration: s.minutes,
          }))}
          onComplete={async (results) => {
            const next = { ...completed };
            results.completedSteps.forEach((step) => {
              if (!step.skipped) next[step.id] = true;
            });
            persistCompleted(next);
            saveCompletionTimeSeconds(results.totalTime);

            try {
              await saveTimerSession(results);
              refreshStreak?.();
            } catch {
              // non-critical — session still marked complete locally
            }

            setShowTimer(false);
          }}
          onClose={() => setShowTimer(false)}
        />
      )}
    </section>
  );
}
