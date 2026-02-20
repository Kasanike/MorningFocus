"use client";

import { Suspense } from "react";
import { DM_Serif_Display } from "next/font/google";
import { AuthForm } from "@/components/AuthForm";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
});

const AUTH_GRADIENT =
  "linear-gradient(170deg, #2a1b3d 0%, #44254a 15%, #5e3352 28%, #7a4058 40%, #8f4d5c 50%, #a66b62 62%, #bf8a6e 75%, #d4a67a 88%, #e0bd8a 100%)";

function LoginContent() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-12 sm:px-6">
      <div
        className="fixed inset-0 -z-10"
        style={{ background: AUTH_GRADIENT }}
      />

      <div
        className="w-full max-w-[420px] shrink-0 overflow-hidden p-8 sm:p-10"
        style={{
          minWidth: "min(320px, calc(100vw - 2rem))",
          background: "rgba(30, 15, 25, 0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 16,
        }}
      >
        <div className="mb-10 flex flex-col items-center">
          <span
            className={`text-xs uppercase tracking-[0.2em] text-white/70 ${dmSerif.className}`}
          >
            Better Morning.
          </span>
        </div>

        <div className="w-full min-w-0">
          <AuthForm />
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-white/60">
        Start each day with discipline and purpose.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: AUTH_GRADIENT }}
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
