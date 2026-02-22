"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { trackOnboardingCompleted } from "@/lib/analytics";
import {
  upsertPrinciple,
  upsertProtocolStep,
  saveKeystoneDb,
  setOnboardingCompleted,
} from "@/lib/db";

const DEFAULT_PRINCIPLES = [
  { text: "I choose discomfort over regret", subtitle: "Growth lives on the other side of what feels hard." },
  { text: "I protect my mornings for deep work", subtitle: "My best energy goes to my most critical goals." },
  { text: "I prioritize execution over planning", subtitle: "One imperfect step beats hours of perfect plans." },
];

const DEFAULT_PROTOCOL = [
  { label: "Meditate", minutes: 5 },
  { label: "Exercise", minutes: 10 },
  { label: "Journal", minutes: 5 },
];

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [principles, setPrinciples] = useState(() =>
    DEFAULT_PRINCIPLES.map((p, i) => ({
      id: `onboarding-p-${i}`,
      text: p.text,
      subtitle: p.subtitle,
    }))
  );

  const [protocolSteps, setProtocolSteps] = useState(() =>
    DEFAULT_PROTOCOL.map((s, i) => ({
      id: `onboarding-s-${i}`,
      label: s.label,
      minutes: s.minutes,
    }))
  );

  const [keystone, setKeystone] = useState("");

  const handlePrincipleChange = (index: number, field: "text" | "subtitle", value: string) => {
    setPrinciples((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const handleProtocolChange = (
    index: number,
    field: "label" | "minutes",
    value: string | number
  ) => {
    setProtocolSteps((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, [field]: field === "minutes" ? Number(value) || 0 : value }
          : s
      )
    );
  };

  const saveStep1 = async () => {
    setSaving(true);
    try {
      await Promise.all(
        principles.map((p, i) =>
          upsertPrinciple({
            id: p.id,
            text: p.text.trim(),
            subtitle: p.subtitle?.trim() || undefined,
            order_index: i,
          })
        )
      );
      setStep(2);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const saveStep2 = async () => {
    setSaving(true);
    try {
      await Promise.all(
        protocolSteps.map((s, i) =>
          upsertProtocolStep({
            id: s.id,
            label: s.label.trim(),
            minutes: s.minutes,
            order_index: i,
          })
        )
      );
      setStep(3);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const saveStep3 = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await saveKeystoneDb(keystone.trim() || "—", today);
      await setOnboardingCompleted();
      trackOnboardingCompleted();
      onComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-8">
      <div className="flex items-center gap-2 font-mono text-xs tracking-wider text-white/50">
        <span>Step {step} of 3</span>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 w-8 rounded-full ${
                s <= step ? "bg-white/40" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="card-glass rounded-2xl border border-white/10 px-4 py-10 shadow-2xl shadow-black/20 sm:px-10 sm:py-12">
          <h2 className="font-mono text-xl font-semibold tracking-tight text-white/95">
            Write your principles
          </h2>
          <p className="mt-1 font-mono text-xs tracking-wider text-white/50">
            These are the values you’ll read every morning. Edit or replace the examples below.
          </p>
          <div className="mt-6 space-y-4">
            {principles.map((p, i) => (
              <div
                key={p.id}
                className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm"
              >
                <input
                  type="text"
                  value={p.text}
                  onChange={(e) => handlePrincipleChange(i, "text", e.target.value)}
                  placeholder="Principle"
                  className="min-h-[44px] w-full rounded-lg border border-white/20 bg-black/20 px-4 py-2.5 font-sans text-base text-white/95 placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
                />
                <input
                  type="text"
                  value={p.subtitle ?? ""}
                  onChange={(e) => handlePrincipleChange(i, "subtitle", e.target.value)}
                  placeholder="Subtitle (optional)"
                  className="mt-2 min-h-[44px] w-full rounded-lg border border-white/20 bg-black/20 px-4 py-2 font-mono text-base text-white/80 placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={saveStep1}
            disabled={saving}
            className="mt-8 flex min-h-[44px] items-center gap-2 rounded-xl bg-white/20 px-5 py-3 font-medium text-white/95 transition-colors hover:bg-white/30 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="card-glass rounded-2xl border border-white/10 px-4 py-10 shadow-2xl shadow-black/20 sm:px-10 sm:py-12">
          <h2 className="font-mono text-xl font-semibold tracking-tight text-white/95">
            Build your protocol
          </h2>
          <p className="mt-1 font-mono text-xs tracking-wider text-white/50">
            Your morning routine in order. You can change labels and minutes.
          </p>
          <div className="mt-6 space-y-4">
            {protocolSteps.map((s, i) => (
              <div
                key={s.id}
                className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm sm:flex-row sm:items-center"
              >
                <input
                  type="text"
                  value={s.label}
                  onChange={(e) => handleProtocolChange(i, "label", e.target.value)}
                  placeholder="Activity"
                  className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-white/20 bg-black/20 px-4 py-2.5 font-sans text-base text-white/95 placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
                />
                <div className="flex items-center gap-2 sm:w-28">
                  <input
                    type="number"
                    min={0}
                    value={s.minutes}
                    onChange={(e) =>
                      handleProtocolChange(i, "minutes", e.target.value)
                    }
                    className="min-h-[44px] w-16 min-w-[64px] rounded-lg border border-white/20 bg-black/20 px-2 py-2 text-center font-mono text-base text-white/95 focus:border-white/40 focus:outline-none"
                  />
                  <span className="text-sm text-white/60">min</span>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={saveStep2}
            disabled={saving}
            className="mt-8 flex min-h-[44px] items-center gap-2 rounded-xl bg-white/20 px-5 py-3 font-medium text-white/95 transition-colors hover:bg-white/30 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="card-glass rounded-2xl border border-white/10 px-4 py-10 shadow-2xl shadow-black/20 sm:px-10 sm:py-12">
          <h2 className="font-mono text-xl font-semibold tracking-tight text-white/95">
            Name today’s Keystone
          </h2>
          <p className="mt-1 font-mono text-xs tracking-wider text-white/50">
            What is the one action that would create the biggest impact on your day?
          </p>
          <input
            type="text"
            value={keystone}
            onChange={(e) => setKeystone(e.target.value)}
            placeholder="e.g. Ship the report, call Mum, finish the proposal"
            className="mt-6 min-h-[44px] w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 font-sans text-base text-white/95 placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
            autoFocus
          />
          <button
            type="button"
            onClick={saveStep3}
            disabled={saving}
            className="mt-8 flex min-h-[44px] items-center gap-2 rounded-xl bg-white/20 px-5 py-3 font-medium text-white/95 transition-colors hover:bg-white/30 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Finish"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
