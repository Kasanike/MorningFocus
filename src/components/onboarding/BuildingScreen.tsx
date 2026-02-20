"use client";

import { useEffect } from "react";

const GRADIENT =
  "linear-gradient(170deg, #2a1b3d 0%, #44254a 15%, #5e3352 28%, #7a4058 40%, #8f4d5c 50%, #a66b62 62%, #bf8a6e 75%, #d4a67a 88%, #e0bd8a 100%)";

const DELAY_MS = 1800;

interface BuildingScreenProps {
  onComplete: () => void;
}

export function BuildingScreen({ onComplete }: BuildingScreenProps) {
  useEffect(() => {
    const t = setTimeout(onComplete, DELAY_MS);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4"
      style={{ background: GRADIENT }}
    >
      <p className="font-sans text-lg text-white/90">Building your morning…</p>

      {/* Sunrise-style: 3 pulsing circles suggesting sun + glow */}
      <div className="relative mt-10 flex items-center justify-center">
        <div
          className="absolute h-20 w-20 rounded-full opacity-20"
          style={{
            background: "rgba(255, 220, 180, 0.6)",
            animation: "building-pulse 2s ease-in-out infinite",
          }}
        />
        <div
          className="absolute h-14 w-14 rounded-full opacity-40"
          style={{
            background: "rgba(255, 235, 200, 0.8)",
            animation: "building-pulse 2s ease-in-out infinite 0.2s",
          }}
        />
        <div
          className="h-10 w-10 rounded-full bg-white/90 shadow-lg"
          style={{
            animation: "building-pulse 2s ease-in-out infinite 0.4s",
          }}
        />
      </div>

      <div className="mt-8 h-1 w-32 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full w-full rounded-full bg-white/70 animate-shrink-x"
          style={{ animationDuration: `${DELAY_MS}ms` }}
        />
      </div>
    </div>
  );
}
