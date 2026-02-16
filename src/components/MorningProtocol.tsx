"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { STORAGE_KEYS } from "@/lib/constants";

export interface ProtocolStep {
  id: string;
  label: string;
  minutes: number;
}

const DEFAULT_STEPS: ProtocolStep[] = [
  { id: "1", label: "Wake & no snooze", minutes: 0 },
  { id: "2", label: "Cold shower", minutes: 5 },
  { id: "3", label: "Hydrate & stretch", minutes: 5 },
  { id: "4", label: "Mindfulness / journaling", minutes: 10 },
  { id: "5", label: "Review priorities", minutes: 5 },
];

function getStoredSteps(): ProtocolStep[] {
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
  return DEFAULT_STEPS.map((s, i) => ({ ...s, id: `default-${i}` }));
}

function saveSteps(steps: ProtocolStep[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.MORNING_PROTOCOL, JSON.stringify(steps));
}

export function MorningProtocol() {
  const { t } = useLanguage();
  const [steps, setSteps] = useState<ProtocolStep[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editMinutes, setEditMinutes] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newMinutes, setNewMinutes] = useState(5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSteps(getStoredSteps());
  }, []);

  const persist = useCallback((next: ProtocolStep[]) => {
    setSteps(next);
    saveSteps(next);
  }, []);

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
      <section className="rounded-2xl border border-app-border bg-app-card px-6 py-8 sm:px-8 sm:py-10 shadow-xl shadow-black/20">
        <h2 className="font-serif text-xl font-semibold text-app-fg">
          {t.morning_protocol_title}
        </h2>
        <p className="mt-3 text-app-muted animate-pulse">{t.loading}</p>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border border-app-border bg-app-card px-6 py-8 sm:px-8 sm:py-10 shadow-xl shadow-black/20"
      aria-label={t.morning_protocol_aria}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-xl font-semibold text-app-fg">
          {t.morning_protocol_title}
        </h2>
        {totalMinutes > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-app-muted">
            <Clock className="h-4 w-4" />
            <span>{t.total_minutes.replace("{{total}}", String(totalMinutes))}</span>
          </div>
        )}
      </div>

      <ol className="mt-6 space-y-3">
        {steps.map((s, index) => (
          <li
            key={s.id}
            className="flex items-center gap-4 rounded-xl border border-app-border/60 bg-app-bg/40 p-4 transition-colors hover:bg-app-border/30"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-app-border font-mono text-xs text-app-muted">
              {index + 1}
            </span>

            {editId === s.id ? (
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                  className="flex-1 rounded-lg border border-app-border bg-app-bg px-3 py-2 text-app-fg focus:border-app-fg/50 focus:outline-none focus:ring-1 focus:ring-app-fg/30"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-16 rounded-lg border border-app-border bg-app-bg px-2 py-2 text-center font-mono text-app-fg focus:border-app-fg/50 focus:outline-none"
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
                    className="rounded-lg p-2 text-red-400/90 hover:bg-red-950/40"
                    aria-label={t.remove}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-app-fg">{s.label}</p>
                  {s.minutes > 0 && (
                    <p className="mt-0.5 text-sm text-app-muted">
                      {s.minutes} {t.minutes}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleStartEdit(s)}
                  className="shrink-0 rounded-lg p-2 text-app-muted hover:bg-app-border hover:text-app-fg"
                  aria-label={`${t.edit_principle}: ${s.label}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </>
            )}
          </li>
        ))}
      </ol>

      {isAdding ? (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-app-border/60 bg-app-bg/40 p-4 sm:flex-row sm:items-center">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={t.protocol_step_placeholder}
            className="flex-1 rounded-lg border border-app-border bg-app-bg px-3 py-2 text-app-fg placeholder:text-app-muted focus:border-app-fg/50 focus:outline-none focus:ring-1 focus:ring-app-fg/30"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={newMinutes}
              onChange={(e) => setNewMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-16 rounded-lg border border-app-border bg-app-bg px-2 py-2 text-center font-mono text-app-fg focus:border-app-fg/50 focus:outline-none"
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
          className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-app-border px-4 py-3 text-app-muted transition-colors hover:border-app-fg/50 hover:text-app-fg"
        >
          <Plus className="h-4 w-4" />
          {t.add_step}
        </button>
      )}
    </section>
  );
}
