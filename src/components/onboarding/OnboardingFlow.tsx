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
  const refresh = useBootstrap()?.refresh;
  const [step, setStep] = useState<1 | 2 | "loading">(1);
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [profession, setProfession] = useState<string | null>(null);

  const handleBuildingComplete = useCallback(async () => {
    if (!ageRange || !profession) return;
    try {
      await saveOnboardingFlow({ age_range: ageRange, profession });
      await refresh?.();
      onComplete();
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("onboarding_just_completed", "1");
      }
      router.replace("/home");
    } catch (e) {
      console.error(e);
      setStep(2);
    }
  }, [ageRange, profession, refresh, onComplete, router]);

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
