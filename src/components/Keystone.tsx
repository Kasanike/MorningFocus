"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Target } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { STORAGE_KEYS, setHasEditedContent } from "@/lib/constants";
import { fetchKeystone, saveKeystoneDb } from "@/lib/db";
import { createClient } from "@/utils/supabase/client";
import { SkeletonCard } from "@/components/SkeletonCard";
import { SectionSuccessCard } from "@/components/ui/SectionSuccessCard";
import { trackKeystoneSet } from "@/lib/analytics";
import { getDailyReflectionQuote } from "@/lib/dailyQuote";

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getStoredKeystone(): string {
  if (typeof window === "undefined") return "";
  try {
    const data = localStorage.getItem(STORAGE_KEYS.KEYSTONE);
    if (!data) return "";
    const parsed = JSON.parse(data);
    if (parsed?.date === getTodayKey() && typeof parsed?.text === "string") {
      return parsed.text;
    }
    return "";
  } catch {
    return "";
  }
}

function saveKeystoneLocal(text: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEYS.KEYSTONE,
    JSON.stringify({ date: getTodayKey(), text: text.trim() })
  );
}

export function Keystone() {
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showKeystoneSuccess, setShowKeystoneSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dailyQuote = useMemo(() => getDailyReflectionQuote(), []);

  useEffect(() => {
    setMounted(true);
    const load = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const text = await fetchKeystone(getTodayKey());
          if (text !== "") {
            setValue(text);
          }
          if (text !== "") return;
        }
      } catch {
        // ignore
      }
      setValue(getStoredKeystone());
    };
    load();
  }, []);

  const handleSave = async () => {
    const date = getTodayKey();
    saveKeystoneLocal(value);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await saveKeystoneDb(value.trim(), date);
      }
      if (value.trim()) {
        trackKeystoneSet();
        setHasEditedContent();
      }
      setSaved(true);
      setShowKeystoneSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Save keystone failed:", e);
    }
  };

  if (!mounted) {
    return <SkeletonCard variant="keystone" />;
  }

  const hasSetKeystone = value.trim() !== "";
  const showLockedCard = hasSetKeystone && !isEditing;

  return (
    <>
      {/* Section header card */}
      <div className="mx-4 mb-3 px-4 py-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden />
            <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">
              {t.keystone_title}
            </h2>
          </div>
          {showLockedCard && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full
                             bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ✓ {t.keystone_locked_badge}
            </span>
          )}
        </div>
      </div>

      <div className="mx-4">
      <AnimatePresence mode="wait">
        {showKeystoneSuccess ? (
          <SectionSuccessCard
            key="keystone-success"
            label={t.keystone_success_label}
            title={t.keystone_success_title}
            contentCard={{
              label: t.keystone_todays_commitment,
              text: value.trim() || "—",
            }}
            quote={dailyQuote}
            primaryButton={{
              label: t.keystone_success_cta,
              onClick: () => setShowKeystoneSuccess(false),
            }}
          />
        ) : (
          <>
      {showLockedCard ? (
        <div
          className="animate-fade-scale-in mt-6 rounded-[14px] border"
          style={{
            padding: "14px 16px",
            background: "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {t.keystone_todays_commitment}
            </span>
            <span
              className="animate-slide-in-right shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{
                background: "rgba(34,197,94,0.2)",
                color: "rgba(74,222,128,0.9)",
              }}
            >
              {t.keystone_locked_badge}
            </span>
          </div>
          <p className="mt-2 text-[15px] font-medium text-white/95">{value.trim()}</p>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex min-h-[40px] items-center gap-2 rounded-[10px] px-3 py-2 text-sm transition-colors"
              style={{
                color: "rgba(255,255,255,0.7)",
                background: "rgba(255,255,255,0.06)",
              }}
              aria-label={t.keystone_edit}
            >
              <Pencil className="h-4 w-4" />
              {t.keystone_edit}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setSaved(false); }}
            onKeyDown={(e) => e.key === "Enter" && value.trim() && handleSave()}
            placeholder={t.keystone_placeholder}
            className="min-w-0 flex-1 bg-zinc-900/50 border-2 border-zinc-800 text-white placeholder-zinc-500 focus:border-orange-500 focus:ring-0 rounded-xl px-4 py-4 outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => value.trim() && handleSave()}
            disabled={!value.trim()}
            className="w-full py-4 rounded-xl bg-orange-500 text-white font-bold text-lg hover:bg-orange-600 shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 sm:w-auto"
          >
            {saved ? t.keystone_locked_badge : t.keystone_lock_button}
          </button>
        </div>
      )}
          </>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}
