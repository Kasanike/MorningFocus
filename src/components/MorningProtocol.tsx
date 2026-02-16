"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Clock, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { STORAGE_KEYS } from "@/lib/constants";

export interface ProtocolStep {
  id: string;
  label: string;
  minutes: number;
}

const DEFAULT_PROTOCOL_MINUTES = [0, 5, 5, 10, 5] as const;

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
        return parsed.map((s: { id?: string; label?: string; minutes?: number }) => ({
          id: s.id ?? `step-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          label: typeof s.label === "string" ? s.label : "",
          minutes: typeof s.minutes === "number" && s.minutes >= 0 ? s.minutes : 0,
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
    setSteps(getStoredSteps(t.default_protocol_step_labels, DEFAULT_PROTOCOL_MINUTES));
    setCompleted(getStoredCompleted());
  }, [t.default_protocol_step_labels]);

  const persist = useCallback((next: ProtocolStep[]) => {
    setSteps(next);
    saveSteps(next);
  }, []);

  const persistCompleted = useCallback((next: Record<string, boolean>) => {
    setCompleted(next);
    saveCompleted(next);
  }, []);

  const handleToggleComplete = (id: string) => {
    persistCompleted({ ...completed, [id]: !completed[id] });
  };

  const handleAdd = () => {
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
      <section className="rounded-lg border border-app-border bg-app-card px-8 py-10 sm:px-10 sm:py-12">
        <h2 className="font-mono text-xl font-semibold text-app-fg">
          {t.morning_protocol_title}
        </h2>
        <p className="mt-3 text-app-muted animate-pulse">{t.loading}</p>
      </section>
    );
  }

  return (
    <section
      className="rounded-lg border border-app-border bg-app-card px-8 py-10 sm:px-10 sm:py-12"
      aria-label={t.morning_protocol_aria}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-mono text-xl font-semibold text-app-fg">
          {t.morning_protocol_title}
        </h2>
        <div className="flex items-center gap-2">
          {totalMinutes > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-app-muted">
              <Clock className="h-4 w-4" />
              <span>{t.total_minutes.replace("{{total}}", String(totalMinutes))}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className="rounded-lg p-2.5 text-app-muted transition-colors hover:bg-app-border hover:text-app-fg"
            aria-label={isEditMode ? t.done_editing : t.edit_principles}
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ol className="mt-6 space-y-3">
        {steps.map((s, index) => (
          <li
            key={s.id}
            className="flex items-center gap-4 rounded-lg border border-app-border bg-app-bg p-5 sm:p-6 transition-all duration-200"
          >
            {editId === s.id ? (
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                  className="flex-1 rounded-lg border border-app-border bg-app-bg px-3 py-2 text-app-fg focus:border-app-fg focus:outline-none focus:ring-1 focus:ring-app-fg"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-16 rounded-lg border border-app-border bg-app-bg px-2 py-2 text-center font-mono text-app-fg focus:border-app-fg focus:outline-none"
                  />
                  <span className="text-sm text-app-muted">{t.minutes}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="rounded-lg bg-app-fg px-3 py-2 text-sm font-medium text-app-bg"
                  >
                    {t.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(s.id)}
                    className="rounded-lg p-2 text-app-muted hover:bg-app-border hover:text-app-fg"
                    aria-label={t.remove}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`flex-1 min-w-0 transition-opacity duration-200 ${
                    completed[s.id] ? "opacity-40" : "opacity-100"
                  }`}
                >
                  <p className="font-sans text-app-fg">{s.label}</p>
                  <p className="mt-0.5 font-mono text-sm text-app-muted">
                    {s.minutes > 0 ? `${s.minutes} ${t.minutes}` : "—"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(s)}
                      className="rounded-lg p-2 text-app-muted transition-colors hover:bg-app-border hover:text-app-fg"
                      aria-label={`${t.edit_principle}: ${s.label}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(s.id)}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-app-fg focus:ring-offset-2 focus:ring-offset-app-bg ${
                      completed[s.id]
                        ? "border-app-fg bg-app-fg"
                        : "border-app-muted hover:border-app-fg"
                    }`}
                    aria-label={completed[s.id] ? `Mark ${s.label} incomplete` : `Mark ${s.label} complete`}
                  >
                    {completed[s.id] ? (
                      <Check className="h-3.5 w-3.5 text-app-bg" strokeWidth={2.5} />
                    ) : (
                      <span className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>

      {isEditMode && (
        isAdding ? (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-app-border bg-app-bg p-5 sm:flex-row sm:items-center sm:p-6">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder={t.protocol_step_placeholder}
              className="flex-1 rounded-lg border border-app-border bg-app-bg px-3 py-2 text-app-fg placeholder:text-app-muted focus:border-app-fg focus:outline-none focus:ring-1 focus:ring-app-fg"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={newMinutes}
                onChange={(e) => setNewMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-16 rounded-lg border border-app-border bg-app-bg px-2 py-2 text-center font-mono text-app-fg focus:border-app-fg focus:outline-none"
              />
              <span className="text-sm text-app-muted">{t.minutes}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAdd}
                className="rounded-lg bg-app-fg px-4 py-2 font-medium text-app-bg"
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
                className="rounded-lg border border-app-border px-4 py-2 text-app-muted hover:bg-app-border hover:text-app-fg"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-app-border px-4 py-3 text-app-muted transition-colors hover:border-app-fg hover:text-app-fg"
          >
            <Plus className="h-4 w-4" />
            {t.add_step}
          </button>
        )
      )}
    </section>
  );
}
