"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
      <section className="card-glass rounded-2xl border border-white/10 px-8 py-10 shadow-2xl shadow-black/20 sm:px-10 sm:py-12">
        <h2 className="font-mono text-xl font-semibold text-white/95">
          {t.principles_title}
        </h2>
        <p className="mt-3 text-white/60 animate-pulse">{t.loading}</p>
      </section>
    );
  }

  return (
    <section
      className="card-glass rounded-2xl border border-white/10 px-8 py-10 shadow-2xl shadow-black/20 sm:px-10 sm:py-12"
      aria-label={t.principles_title}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="drop-shadow-md">
          <h2 className="font-mono text-xl font-semibold tracking-tight text-white/95">
            {t.principles_title}
          </h2>
          <p className="mt-1 font-mono text-xs tracking-wider text-white/50">
            {t.principles_subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="rounded-xl p-2.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
          aria-label={isEditing ? t.done_editing : t.edit_principles}
        >
          <Pencil className="h-5 w-5" />
        </button>
      </div>

      <ul className="mt-6 space-y-3">
                {principles.map((p) => (
                  <motion.li
                    key={p.id}
                    layout
                    className="flex items-start gap-4 rounded-xl border border-white/10 bg-black/20 p-5 backdrop-blur-sm transition-colors hover:bg-black/30 sm:p-6"
                  >
                    {editId === p.id ? (
                      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                          className="flex-1 rounded-lg border border-white/20 bg-black/20 px-4 py-2.5 font-sans text-white/95 placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white/95 transition-colors hover:bg-white/30"
                          >
                            {t.save}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(p.id)}
                            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
                            aria-label={t.remove}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-1 items-start justify-between gap-4">
                        <p
                          className={`font-sans text-base font-normal leading-relaxed drop-shadow-md ${
                            acknowledged[p.id] ? "opacity-40 line-through text-white/95" : "text-white/95"
                          }`}
                        >
                          {p.text}
                        </p>
                        <div className="flex shrink-0 items-center gap-2">
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(p)}
                              className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
                              aria-label={`${t.edit_principle}: ${p.text}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCheck(p.id)}
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors hover:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 ${
                              acknowledged[p.id]
                                ? "border-white/90 bg-white/95"
                                : "border-white/40"
                            }`}
                            aria-label={`${t.acknowledge}: ${p.text}`}
                          >
                            {acknowledged[p.id] ? (
                              <Check className="h-3.5 w-3.5 text-black" strokeWidth={2.5} />
                            ) : null}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.li>
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
            className="flex-1 rounded-xl border border-white/20 bg-black/20 px-4 py-2.5 font-sans text-white/95 placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 font-medium text-white/95 transition-colors hover:bg-white/30"
          >
            <Plus className="h-4 w-4" />
            {t.add}
          </button>
        </div>
      )}
    </section>
  );
}
