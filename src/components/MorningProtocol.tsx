"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useProtocolProgress } from "@/context/ProtocolProgressContext";
import { STORAGE_KEYS } from "@/lib/constants";
import {
  fetchProtocolSteps,
  upsertProtocolStep,
  deleteProtocolStep,
} from "@/lib/db";
import { createClient } from "@/utils/supabase/client";
import { usePlan } from "@/hooks/usePlan";
import { canAddProtocolStep, FREE_PROTOCOL_STEPS_LIMIT } from "@/lib/subscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { ProtocolListItem, type ProtocolStep } from "./ProtocolListItem";

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

export function MorningProtocol() {
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

  useEffect(() => {
    setMounted(true);
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
            return;
          }
        }
      } catch {
        // ignore
      }
      setSteps(
        getStoredSteps(t.default_protocol_step_labels, DEFAULT_PROTOCOL_MINUTES)
      );
      setCompleted(getStoredCompleted());
    };
    load();
  }, [t.default_protocol_step_labels]);

  useEffect(() => {
    const completedCount = Object.values(completed).filter(Boolean).length;
    setProgress(completedCount, steps.length);
  }, [completed, steps.length, setProgress]);

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

  if (!mounted) {
    return (
      <section className="card-glass rounded-2xl border border-white/10 px-8 py-10 shadow-2xl shadow-black/20 sm:px-10 sm:py-12">
        <h2 className="font-mono text-xl font-semibold text-white/95">
          {t.morning_protocol_title}
        </h2>
        <p className="mt-3 text-white/60 animate-pulse">{t.loading}</p>
      </section>
    );
  }

  return (
    <section
      className="card-glass rounded-2xl border border-white/10 px-8 py-10 shadow-2xl shadow-black/20 sm:px-10 sm:py-12"
      aria-label={t.morning_protocol_aria}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="drop-shadow-md">
          <h2 className="font-mono text-xl font-semibold text-white/95">
            {t.morning_protocol_title}
          </h2>
          <p className="mt-1 font-mono text-xs tracking-wider text-white/50">
            {t.morning_protocol_prompt}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {totalMinutes > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-white/60">
              <Clock className="h-4 w-4" />
              <span>{t.total_minutes.replace("{{total}}", String(totalMinutes))}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className="rounded-xl p-2.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
            aria-label={isEditMode ? t.done_editing : t.edit_principles}
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ol className="mt-6 space-y-3">
        {steps.map((s) => (
          <ProtocolListItem
            key={s.id}
            step={s}
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

      {isEditMode && (
        !canAdd ? (
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
              className="flex-1 rounded-lg border border-white/20 bg-black/20 px-4 py-2.5 font-sans text-white/95 placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={newMinutes}
                onChange={(e) => setNewMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-16 rounded-lg border border-white/20 bg-black/20 px-2 py-2 text-center font-mono text-white/95 focus:border-white/40 focus:outline-none"
              />
              <span className="text-sm text-white/60">{t.minutes}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAdd}
                className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white/95 transition-colors hover:bg-white/30"
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
                className="rounded-lg border border-white/20 px-4 py-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white/90"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-white/20 px-5 py-3.5 text-white/60 transition-colors hover:border-white/40 hover:bg-white/5 hover:text-white/80"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4" />
            {t.add_step}
          </button>
        )
      )}
    </section>
  );
}
