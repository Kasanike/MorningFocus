"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-6 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-2xl border border-white/20 bg-black/80 px-5 py-4 shadow-2xl backdrop-blur-md sm:left-auto sm:right-6 sm:max-w-sm"
      style={{
        borderColor: "rgba(42, 27, 61, 0.6)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(42, 27, 61, 0.3)",
      }}
    >
      <div className="min-w-0">
        <p className="font-mono text-sm font-medium text-white/95">
          Install Better Morning
        </p>
        <p className="mt-0.5 font-mono text-xs text-white/50">
          Add to home screen for the best experience
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={handleInstall}
          className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-white/20 px-4 py-2 font-mono text-sm font-medium text-white/95 transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-[#2a1b3d]/50"
        >
          <Download className="h-4 w-4" />
          Install
        </button>
        <button
          onClick={() => setShow(false)}
          className="touch-target flex items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
