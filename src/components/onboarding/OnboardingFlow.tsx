"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingFlow } from "@/lib/db";
import { useBootstrap } from "@/context/BootstrapContext";
import { AgeStep } from "./AgeStep";
import { ProfessionStep } from "./ProfessionStep";
import { BuildingScreen } from "./BuildingScreen";

const GRADIENT =
  "linear-gradient(170deg, #2a1b3d 0%, #44254a 15%, #5e3352 28%, #7a4058 40%, #8f4d5c 50%, #a66b62 62%, #bf8a6e 75%, #d4a67a 88%, #e0bd8a 100%)";

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const router = useRouter();
  const bootstrap = useBootstrap();
  const refresh = bootstrap?.refresh;
  const markOnboardingCompleted = bootstrap?.markOnboardingCompleted;
  const [step, setStep] = useState<1 | 2 | "loading">(1);
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [profession, setProfession] = useState<string | null>(null);

  const handleBuildingComplete = useCallback(async () => {
    if (!ageRange || !profession) return;
    try {
      // 1. Update UI immediately so next render shows dashboard (no refetch = no loop)
      markOnboardingCompleted?.();
      await saveOnboardingFlow({ age_range: ageRange, profession });
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("onboarding_just_completed", "1");
      }
      // 2. Sync bootstrap in background (refresh never overwrites completed → incomplete)
      refresh?.().catch(() => {});
      onComplete();
      router.replace("/home");
    } catch (e) {
      console.error("Onboarding flow save failed:", e);
      setStep(2);
    }
  }, [ageRange, profession, refresh, markOnboardingCompleted, onComplete, router]);

  if (step === "loading") {
    return <BuildingScreen onComplete={handleBuildingComplete} />;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: GRADIENT }}
    >
      {step === 1 && (
        <AgeStep
          value={ageRange}
          onChange={setAgeRange}
          onContinue={() => setStep(2)}
          currentStep={1}
          totalSteps={2}
        />
      )}
      {step === 2 && (
        <ProfessionStep
          value={profession}
          onChange={setProfession}
          onBack={() => setStep(1)}
          onContinue={() => setStep("loading")}
          continueLabel="Finish"
          currentStep={2}
          totalSteps={2}
        />
      )}
    </div>
  );
}
