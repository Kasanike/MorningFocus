"use client";

const PROFESSION_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "creative", label: "Creative" },
  { value: "developer", label: "Developer" },
  { value: "manager", label: "Manager" },
  { value: "educator", label: "Educator" },
  { value: "healthcare", label: "Healthcare" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "other", label: "Other" },
] as const;

const WARM_ACCENT = "#d4a67a";

interface ProfessionStepProps {
  value: string | null;
  onChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  currentStep: 2;
  totalSteps: 2;
}

export function ProfessionStep({
  value,
  onChange,
  onBack,
  onContinue,
  continueLabel = "Continue",
  currentStep,
  totalSteps,
}: ProfessionStepProps) {
  return (
    <div className="card-glass w-full max-w-md rounded-2xl border border-white/10 px-6 py-8 shadow-2xl shadow-black/20 sm:px-8 sm:py-10">
      <div className="mb-6 flex items-center gap-2 font-mono text-xs tracking-wider text-white/50">
        <span>Step {currentStep} of {totalSteps}</span>
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i + 1 <= currentStep ? "bg-white/50" : "bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>

      <h2 className="font-sans text-2xl font-semibold text-white sm:text-3xl">
        What&apos;s your profession?
      </h2>
      <p className="mt-2 text-sm text-white/60">
        Helps us suggest relevant routines.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {PROFESSION_OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="min-h-[52px] rounded-2xl border-2 px-5 py-4 text-left font-sans text-base font-medium transition-all flex items-center justify-center"
              style={{
                background: selected ? "rgba(212, 166, 122, 0.15)" : "rgba(255, 255, 255, 0.05)",
                borderColor: selected ? WARM_ACCENT : "rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.95)",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-full border border-white/30 py-3.5 font-sans text-base font-medium text-white transition-colors hover:bg-white/10"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!value}
          onClick={onContinue}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-3.5 font-sans text-base font-bold text-indigo-900 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {continueLabel}
          <span className="text-lg" aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
