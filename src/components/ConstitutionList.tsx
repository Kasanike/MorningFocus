"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Plus, Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { STORAGE_KEYS } from "@/lib/constants";

export interface Principle {
  id: string;
  text: string;
}

function getStoredPrinciples(defaultPrinciples: readonly string[]): Principle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRINCIPLES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return defaultPrinciples.map((text, i) => ({
    id: `default-${i}`,
    text,
  }));
}

function getAcknowledgementDate(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.ACKNOWLEDGED_DATE);
}

function isAcknowledgedToday(): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return getAcknowledgementDate() === today;
}

export function ConstitutionList() {
  const { t } = useLanguage();
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [newPrinciple, setNewPrinciple] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const defaults = t.default_principles;
    setPrinciples(getStoredPrinciples(defaults));
    const ackToday = isAcknowledgedToday();
    if (ackToday) {
      const stored = getStoredPrinciples(defaults);
      const allChecked: Record<string, boolean> = {};
      stored.forEach((p) => {
        allChecked[p.id] = true;
      });
      setAcknowledged(allChecked);
    }
  }, [t.default_principles]);

  const savePrinciples = useCallback((next: Principle[]) => {
    setPrinciples(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PRINCIPLES, JSON.stringify(next));
    }
  }, []);

  const handleCheck = (id: string) => {
    setAcknowledged((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const allChecked = principles.every((p) => next[p.id]);
      if (allChecked && typeof window !== "undefined") {
        localStorage.setItem(
          STORAGE_KEYS.ACKNOWLEDGED_DATE,
          new Date().toISOString().slice(0, 10)
        );
      }
      return next;
    });
  };

  const handleAdd = () => {
    const trimmed = newPrinciple.trim();
    if (!trimmed) return;
    const id = `principle-${Date.now()}`;
    const next = [...principles, { id, text: trimmed }];
    savePrinciples(next);
    setNewPrinciple("");
  };

  const handleRemove = (id: string) => {
    savePrinciples(principles.filter((p) => p.id !== id));
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
    return (
      <section className="card-glass rounded-lg border border-app-border px-6 py-8 sm:px-8 sm:py-10">
        <h2 className="font-mono text-xl font-semibold text-app-fg">
          {t.principles_title}
        </h2>
        <p className="mt-3 text-app-muted animate-pulse">{t.loading}</p>
      </section>
    );
  }

  return (
    <section
      className="card-glass rounded-lg border border-app-border px-6 py-8 sm:px-8 sm:py-10"
      aria-label={t.principles_title}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-mono text-xl font-semibold text-app-fg">
            {t.principles_title}
          </h2>
          <p className="mt-1 text-sm text-app-muted">
            {t.principles_subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="rounded-lg p-2.5 text-app-muted transition-colors hover:bg-app-border hover:text-app-fg"
          aria-label={isEditing ? t.done_editing : t.edit_principles}
        >
          <Pencil className="h-5 w-5" />
        </button>
      </div>

      <ul className="mt-6 space-y-3">
        {principles.map((p) => (
          <li
            key={p.id}
            className="flex items-start gap-4 rounded-lg border border-app-border bg-app-bg p-4 transition-colors hover:border-app-muted/50"
          >
            {editId === p.id ? (
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                  className="flex-1 rounded-lg border border-app-border bg-app-bg px-3 py-2 font-sans text-app-fg placeholder:text-app-muted focus:border-app-fg focus:outline-none focus:ring-1 focus:ring-app-fg"
                  autoFocus
                />
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
                    onClick={() => handleRemove(p.id)}
                    className="rounded-lg p-2 text-app-muted hover:bg-app-border hover:text-app-fg"
                    aria-label={t.remove}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-start justify-between gap-2">
                <p
                  className={`font-sans text-base font-normal leading-relaxed ${
                    acknowledged[p.id] ? "text-app-muted line-through" : "text-app-fg"
                  }`}
                >
                  {p.text}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(p)}
                      className="rounded-lg p-2 text-app-muted hover:bg-app-border hover:text-app-fg"
                      aria-label={`${t.edit_principle}: ${p.text}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCheck(p.id)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-app-muted transition-colors hover:border-app-fg focus:outline-none focus:ring-2 focus:ring-app-fg"
                    aria-label={`${t.acknowledge}: ${p.text}`}
                  >
                    {acknowledged[p.id] ? (
                      <Check className="h-3.5 w-3.5 text-app-fg" strokeWidth={2.5} />
                    ) : (
                      <span className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {isEditing && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newPrinciple}
            onChange={(e) => setNewPrinciple(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={t.add_principle_placeholder}
            className="flex-1 rounded-lg border border-app-border bg-app-bg px-3 py-2 font-sans text-app-fg placeholder:text-app-muted focus:border-app-fg focus:outline-none focus:ring-1 focus:ring-app-fg"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-lg bg-app-fg px-4 py-2 font-medium text-app-bg transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t.add}
          </button>
        </div>
      )}
    </section>
  );
}
