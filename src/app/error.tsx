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
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h2 className="font-mono text-lg font-semibold text-white/90">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-md font-mono text-sm text-white/50">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-mono text-sm text-white/80 backdrop-blur transition-colors hover:bg-white/10"
      >
        Try again
      </button>
    </div>
  );
}
