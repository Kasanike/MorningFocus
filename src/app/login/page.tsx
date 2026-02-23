"use client";

import { Suspense } from "react";
import { DM_Serif_Display } from "next/font/google";
import { AuthForm } from "@/components/AuthForm";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
});

function LoginContent() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6">
      <div
        className="w-full max-w-[420px] shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 p-8 sm:p-10"
        style={{
          minWidth: "min(320px, calc(100vw - 2rem))",
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
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-400" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
