"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "onboarding_just_completed";

export function OnboardingSuggestionsBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    setShow(sessionStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const dismiss = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="status"
      className="animate-fade-in mx-4 mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur sm:mx-8 sm:mt-6"
    >
      <p className="font-sans text-sm text-white/90">
        These are suggestions. Tap <span className="font-semibold">✎</span> to make them yours.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
      >
        <span className="text-lg leading-none">×</span>
      </button>
    </div>
  );
}
