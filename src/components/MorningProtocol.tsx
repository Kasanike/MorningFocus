"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useProtocolProgress } from "@/context/ProtocolProgressContext";
import { STORAGE_KEYS, setHasEditedContent } from "@/lib/constants";
import {
  fetchProtocolSteps,
  upsertProtocolStep,
  deleteProtocolStep,
  saveTimerSession,
} from "@/lib/db";
import { createClient } from "@/utils/supabase/client";
import { usePlan } from "@/hooks/usePlan";
import { canAddProtocolStep, FREE_PROTOCOL_STEPS_LIMIT } from "@/lib/subscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { ProtocolListItem, type ProtocolStep } from "./ProtocolListItem";
import ProtocolTimer from "./ProtocolTimer";
import { SkeletonCard } from "@/components/SkeletonCard";
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

  useEffect(() => {
    if (
      steps.length === 0 ||
      Object.values(completed).filter(Boolean).length !== steps.length ||
      protocolDoneSyncedRef.current
    ) return;
    protocolDoneSyncedRef.current = true;
    setProtocolDoneForToday()
      .then(() => setShowCompletionCard(true))
      .catch(() => {
        protocolDoneSyncedRef.current = false;
      });
  }, [steps.length, completed]);

  const persist = useCallback((next: ProtocolStep[]) => {
    setSteps(next);
    saveSteps(next);
    next.forEach((s, i) => {
      upsertProtocolStep({
        id: s.id,
        label: s.label,
        minutes: s.minutes,
        order_index: i,
      }).catch(console.error);
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
    deleteProtocolStep(id).catch(console.error);
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

  const totalMinutes = steps.reduce((acc, s) => acc + s.minutes, 0);
  const completedCount = Object.values(completed).filter(Boolean).length;
  const allDone = steps.length > 0 && completedCount === steps.length;
  const completionTimeSeconds = getStoredCompletionTimeSeconds();
  const timeTakenLabel =
    completionTimeSeconds != null
      ? formatTimeTaken(completionTimeSeconds)
      : `${totalMinutes} min`;

  const handleRedo = useCallback(() => {
    setProtocolUndoneForToday()
      .then(() => {
        persistCompleted({});
        setShowCompletionCard(false);
        protocolDoneSyncedRef.current = false;
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEYS.PROTOCOL_COMPLETION_TIME);
        }
      })
      .catch(console.error);
  }, [persistCompleted]);

  if (!mounted) {
    return <SkeletonCard variant="list" lines={5} />;
  }

  return (
    <section
      className="relative overflow-hidden rounded-[22px] border backdrop-blur-xl"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.06)",
        padding: "22px 20px 24px",
      }}
      aria-label={t.morning_protocol_aria}
    >
      {/* Row 1: title + edit icon */}
      <div className="mb-1 flex items-start justify-between">
        <h2
          className="font-bold text-white"
          style={{ fontSize: 22, margin: 0, letterSpacing: "-0.01em" }}
        >
          {t.morning_protocol_title}
        </h2>
        {!showCompletionCard && (
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className="border-0 bg-transparent p-0.5 text-[rgba(255,255,255,0.25)] transition-colors hover:text-white/50"
            style={{ fontSize: 16 }}
            aria-label={isEditMode ? t.done_editing : t.edit_principles}
          >
            ✎
          </button>
        )}
      </div>
      <p
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.3)",
          margin: "0 0 16px",
          lineHeight: 1.4,
        }}
      >
        {t.morning_protocol_subtitle}
      </p>

      <AnimatePresence mode="wait">
        {showCompletionCard ? (
          <motion.div
            key="protocol-complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="animate-completion-reveal rounded-2xl border p-5 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(74,222,128,0.04))",
              borderColor: "rgba(34,197,94,0.12)",
              marginBottom: 16,
            }}
          >
            <div className="mb-2 text-[32px]">🌅</div>
            <p className="mb-1 font-bold text-white" style={{ fontSize: 16, margin: "0 0 4px" }}>
              Morning complete
            </p>
            <p className="text-[13px] text-white/40" style={{ margin: 0 }}>
              You showed up for yourself today. That matters.
            </p>
            {onGoToConstitution && (
              <button
                type="button"
                onClick={onGoToConstitution}
                className="mt-4 flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ec4899)",
                  boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
                }}
              >
                Go to Constitution
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleRedo}
              className="mt-3 text-xs text-white/50 underline underline-offset-2 transition-colors hover:text-white/70"
            >
              Redo protocol
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="protocol-steps"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Progress bar */}
            <div className="mb-4">
              <div
                className="mb-3 h-1 w-full overflow-hidden rounded"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="h-full rounded transition-all duration-500"
                  style={{
                    width: `${(completedCount / Math.max(1, steps.length)) * 100}%`,
                    background: allDone
                      ? "linear-gradient(90deg, #22c55e, #4ade80)"
                      : "linear-gradient(90deg, #f97316, #ec4899)",
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-medium transition-colors"
                    style={{
                      color: allDone ? "rgba(34,197,94,0.7)" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {allDone
                      ? "✓ Protocol complete"
                      : `${completedCount}/${steps.length} complete`}
                  </span>
                  <span
                    className="rounded-full"
                    style={{
                      width: 3,
                      height: 3,
                      background: "rgba(255,255,255,0.12)",
                    }}
                  />
                  <span className="text-xs font-medium text-white/25">
                    {totalMinutes} {t.minutes}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTimer(true)}
                  className="flex items-center gap-1.5 rounded-[10px] border px-3.5 py-1.5 text-xs font-semibold transition-colors"
                  style={{
                    background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(236,72,153,0.1))",
                    borderColor: "rgba(249,115,22,0.2)",
                    color: "rgba(249,115,22,0.85)",
                  }}
                >
                  ▶ Start Guided
                </button>
              </div>
            </div>

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
                  onEditLabelChange={setEditLabel}
                  onEditMinutesChange={setEditMinutes}
                  minutesLabel={t.minutes}
                  saveLabel={t.save}
                  removeLabel={t.remove}
                  editPrincipleLabel={t.edit_principle}
                />
              ))}
            </ol>

            {isEditMode &&
              (!canAdd ? (
                <div className="mt-4">
                  <UpgradePrompt
                    message={`Free accounts can have up to ${FREE_PROTOCOL_STEPS_LIMIT} protocol steps. Upgrade to Pro for unlimited.`}
                  />
                </div>
              ) : isAdding ? (
                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder={t.protocol_step_placeholder}
                    className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-white/20 bg-black/20 px-4 py-2.5 font-sans text-base text-white/95 placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={newMinutes}
                      onChange={(e) => setNewMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="min-h-[44px] w-16 min-w-[64px] rounded-lg border border-white/20 bg-black/20 px-2 py-2 text-center font-mono text-base text-white/95 focus:border-white/40 focus:outline-none"
                    />
                    <span className="text-sm text-white/60">{t.minutes}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAdd}
                      className="min-h-[44px] rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white/95 transition-colors hover:bg-white/30"
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
                </div>
              ) : (
                <button
                  type="button"
                  className="touch-target mt-4 flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-5 py-3.5 text-white/60 transition-colors hover:border-white/40 hover:bg-white/5 hover:text-white/80"
                  onClick={() => setIsAdding(true)}
                >
                  <Plus className="h-4 w-4" />
                  {t.add_step}
                </button>
              ))}
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
