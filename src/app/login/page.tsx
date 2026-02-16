"use client";

import { Suspense } from "react";
import { Flame } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";

function LoginContent() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-12 sm:px-6">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-zinc-950" />
      <div
        className="fixed inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 80, 40, 0.15), transparent)",
        }}
      />

      {/* Glassmorphism card */}
      <div className="w-full max-w-[420px] shrink-0 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-10" style={{ minWidth: "min(320px, calc(100vw - 2rem))" }}>
        {/* Logo / Branding */}
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-800/60">
            <Flame className="h-6 w-6 text-amber-500/90" strokeWidth={1.5} />
          </div>
          <span className="font-sans text-xs tracking-[0.3em] text-zinc-500">
            MORNING FOCUS
          </span>
        </div>

        {/* Hook */}
        <div className="mb-10 text-center">
          <h1 className="font-serif-display text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
            Command Your Morning.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            Sign in to access your personal constitution and daily battle plan.
          </p>
        </div>

        {/* Form */}
        <div className="w-full min-w-0">
          <AuthForm />
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-zinc-600">
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-amber-500" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
