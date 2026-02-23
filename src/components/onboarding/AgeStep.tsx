"use client";

const AGE_OPTIONS = [
  { value: "18-24", label: "18–24" },
  { value: "25-34", label: "25–34" },
  { value: "35-44", label: "35–44" },
  { value: "45+", label: "45+" },
] as const;

const WARM_ACCENT = "#d4a67a";

interface AgeStepProps {
  value: string | null;
  onChange: (value: string) => void;
  onContinue: () => void;
  currentStep: 1;
  totalSteps: 2;
}

export function AgeStep({
  value,
  onChange,
  onContinue,
  currentStep,
  totalSteps,
}: AgeStepProps) {
  return (
    <div className="card-glass w-full max-w-md rounded-2xl border border-white/10 px-6 py-8 shadow-2xl shadow-black/20 sm:px-8 sm:py-10">
      <div className="mb-6 flex items-center gap-2 text-xs tracking-wider text-white/50">
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

      <h2 className="font-sans text-xl font-semibold text-white sm:text-2xl">
        What&apos;s your age range?
      </h2>
      <p className="mt-2 text-sm text-white/60">
        We use this to tailor your experience.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {AGE_OPTIONS.map((opt) => {
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

      <button
        type="button"
        disabled={!value}
        onClick={onContinue}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 font-sans text-base font-bold text-zinc-900 transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Continue
        <span className="text-lg" aria-hidden>→</span>
      </button>
    </div>
  );
}
