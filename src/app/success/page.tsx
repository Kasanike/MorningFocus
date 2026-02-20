"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "missing">(
    "loading"
  );

  useEffect(() => {
    if (sessionId) {
      setStatus("success");
    } else {
      setStatus("missing");
    }
  }, [sessionId]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-16">
      <div className="w-full rounded-xl border border-app-border bg-app-card p-8 text-center shadow-lg">
        {status === "loading" && (
          <p className="font-sans text-app-muted">Confirming your purchase…</p>
        )}
        {status === "success" && (
          <>
            <div className="mb-6 text-4xl" aria-hidden>
              ✓
            </div>
            <h1 className="font-sans text-2xl font-semibold text-app-fg">
              Thank you for your purchase
            </h1>
            <p className="mt-3 font-sans text-app-muted">
              Your account is now upgraded. You have full access to Better
              Morning.
            </p>
            <Link
              href="/home"
              className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-app-fg px-6 py-3 font-sans text-sm font-medium text-app-bg transition-opacity hover:opacity-90"
            >
              Go to your morning
            </Link>
          </>
        )}
        {status === "missing" && (
          <>
            <h1 className="font-sans text-2xl font-semibold text-app-fg">
              No session found
            </h1>
            <p className="mt-3 font-sans text-app-muted">
              If you just completed a purchase, your upgrade may take a moment to
              apply. Try going home and refreshing.
            </p>
            <Link
              href="/home"
              className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-lg border border-app-border bg-app-card px-6 py-3 font-sans text-sm font-medium text-app-fg transition-colors hover:bg-app-bg"
            >
              Back to home
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

function SuccessFallback() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-16">
      <div className="w-full rounded-xl border border-app-border bg-app-card p-8 text-center shadow-lg">
        <p className="font-sans text-app-muted">Confirming your purchase…</p>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
