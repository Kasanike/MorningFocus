"use client";

import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

function LoginContent() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-12 sm:px-6">
      <div className="fixed inset-0 -z-10 bg-app-bg" />

      <div
        className="w-full max-w-[420px] shrink-0 overflow-hidden rounded-lg border border-app-border bg-app-card p-8 sm:p-10"
        style={{ minWidth: "min(320px, calc(100vw - 2rem))" }}
      >
        <div className="mb-10 flex flex-col items-center">
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-app-muted">
            MORNING FOCUS
          </span>
        </div>

        <div className="mb-10 text-center">
          <h1 className="font-sans text-2xl font-semibold tracking-tighter text-app-fg sm:text-3xl">
            Command Your Morning.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-app-muted">
            Sign in to access your personal constitution and daily battle plan.
          </p>
        </div>

        <div className="w-full min-w-0">
          <AuthForm />
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-app-muted">
        Start each day with discipline and purpose.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-app-bg">
          <div className="h-8 w-8 animate-spin rounded border-2 border-app-border border-t-app-fg" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
