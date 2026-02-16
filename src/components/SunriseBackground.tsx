"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

interface SunriseBackgroundProps {
  currentStep: number;
  totalSteps: number;
}

/**
 * Interpolates RGB values between two colors.
 * progress: 0 = start, 1 = end
 */
function lerpColor(
  start: [number, number, number],
  end: [number, number, number],
  progress: number
): string {
  const r = Math.round(start[0] + (end[0] - start[0]) * progress);
  const g = Math.round(start[1] + (end[1] - start[1]) * progress);
  const b = Math.round(start[2] + (end[2] - start[2]) * progress);
  return `rgb(${r},${g},${b})`;
}

/**
 * Dawn: deep warm dark orange/purple
 * Middle: warm orange/gold
 * Daylight: bright yellow/white/cyan
 */
function getGradientColors(progress: number): {
  center: string;
  mid: string;
  outer: string;
} {
  const clamped = Math.max(0, Math.min(1, progress));

  // Color stops: dawn (0) -> middle (0.5) -> daylight (1)
  // Brighter dawn so sunrise is visible from step 0
  const dawnCenter: [number, number, number] = [255, 120, 80]; // warm coral/orange
  const dawnMid: [number, number, number] = [180, 80, 120]; // deep rose/purple
  const dawnOuter: [number, number, number] = [60, 30, 80]; // rich purple

  const midCenter: [number, number, number] = [255, 180, 80]; // golden orange
  const midMid: [number, number, number] = [255, 200, 100]; // warm gold
  const midOuter: [number, number, number] = [80, 60, 100]; // soft purple

  const dayCenter: [number, number, number] = [255, 255, 240]; // ivory/white
  const dayMid: [number, number, number] = [255, 250, 205]; // lemon chiffon
  const dayOuter: [number, number, number] = [135, 206, 235]; // sky blue

  let center: string;
  let mid: string;
  let outer: string;

  if (clamped <= 0.5) {
    const t = clamped * 2; // 0..1 from dawn to middle
    center = lerpColor(dawnCenter, midCenter, t);
    mid = lerpColor(dawnMid, midMid, t);
    outer = lerpColor(dawnOuter, midOuter, t);
  } else {
    const t = (clamped - 0.5) * 2; // 0..1 from middle to daylight
    center = lerpColor(midCenter, dayCenter, t);
    mid = lerpColor(midMid, dayMid, t);
    outer = lerpColor(midOuter, dayOuter, t);
  }

  return { center, mid, outer };
}

export function SunriseBackground({ currentStep, totalSteps }: SunriseBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const progress =
    totalSteps > 0 ? Math.min(1, currentStep / Math.max(1, totalSteps)) : 0;

  const colors = getGradientColors(progress);

  const content = (
    <div className="fixed inset-0 -z-[1] overflow-hidden" aria-hidden>
      {/* Radial gradient sun */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{
          background: `radial-gradient(
            ellipse 140% 100% at 50% 85%,
            ${colors.center} 0%,
            ${colors.mid} 30%,
            ${colors.outer} 60%,
            rgb(20, 15, 35) 80%,
            rgb(9, 9, 11) 100%
          )`,
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Noise overlay - organic grain */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );

  if (!mounted) return null;

  return createPortal(content, document.body);
}
