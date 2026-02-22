"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SunriseBackgroundProps {
  currentStep: number;
  totalSteps: number;
}

/** Reference gradient: cool purple → warm (no radial). */
const REFERENCE_GRADIENT =
  "linear-gradient(165deg, #1a0a2e 0%, #2d1245 25%, #3d1a4a 45%, #4a2040 60%, #5c2a3a 80%, #2a1520 100%)";

export function SunriseBackground(_props: SunriseBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <div
      className="fixed inset-0 -z-[1] overflow-hidden"
      aria-hidden
      style={{ background: REFERENCE_GRADIENT }}
    >
      {/* Noise overlay */}
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
