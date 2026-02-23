"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const message =
      error instanceof Error ? error.message : typeof error === "object" && error !== null ? JSON.stringify(error) : String(error);
    console.error("Unhandled error:", message || "Unknown error");
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h2 className="text-lg font-semibold text-zinc-100">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-100 transition-colors hover:bg-zinc-800/80"
      >
        Try again
      </button>
    </div>
  );
}
