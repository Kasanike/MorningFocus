"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, LogIn } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/utils/supabase/client";
import { fetchTrialInfo } from "@/lib/db";
import { getAccessStatus } from "@/lib/subscription";
import VoiceSelector from "@/components/settings/VoiceSelector";
import type { SupportedLocale } from "@/locales";

function planLabel(
  plan: string,
  trialEnds: string | null
): string {
  if (plan === "pro") return "Pro";
  const access = getAccessStatus({
    plan: plan as "trial" | "expired" | "pro",
    trial_ends: trialEnds ?? new Date(0).toISOString(),
  });
  if (access === "pro") return "Pro";
  if (typeof access === "object" && access.status === "trial") {
    return `Free trial (${access.daysLeft} day${access.daysLeft === 1 ? "" : "s"} left)`;
  }
  return "Trial expired";
}

export default function SettingsPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale>(locale);
  const [email, setEmail] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [trialInfo, setTrialInfo] = useState<Awaited<ReturnType<typeof fetchTrialInfo>>>(null);
  const [trialLoaded, setTrialLoaded] = useState(false);
  const [ttsVoice, setTtsVoice] = useState<string>("onyx");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedLocale(locale);
  }, [locale]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("tts_voice")
          .eq("id", user.id)
          .single();
        if (profile?.tts_voice) setTtsVoice(profile.tts_voice);
      }
      setAuthLoaded(true);
    };
    load();
  }, []);

  useEffect(() => {
    fetchTrialInfo()
      .then((info) => setTrialInfo(info))
      .catch(() => {})
      .finally(() => setTrialLoaded(true));
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: "annual" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoreLoading(true);
    setRestoreMessage(null);
    try {
      const res = await fetch("/api/restore", { method: "POST" });
      const data = await res.json();
      if (data.restored) {
        await fetchTrialInfo().then(setTrialInfo);
      } else {
        setRestoreMessage(data.message || "No purchase found for this account.");
      }
    } catch {
      setRestoreMessage("Something went wrong. Try again.");
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleSaveLanguage = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({ language_preference: selectedLocale })
          .eq("id", user.id);
      }

      setLocale(selectedLocale);
    } catch {
      // Fallback: still update local state
      setLocale(selectedLocale);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl pb-8">
      <header className="border-b border-app-border bg-app-bg/95 px-4 py-8 sm:px-8">
        <Link
          href="/home"
          className="mb-6 inline-flex items-center gap-2 text-sm text-app-muted transition-colors hover:text-app-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="font-sans text-2xl font-semibold text-app-fg sm:text-3xl">
          {t.settings_title}
        </h1>
      </header>

      <div className="space-y-8 px-4 pt-8 sm:px-8">
        <section
          className="rounded-lg border border-app-border bg-app-card px-6 py-8 sm:px-8"
          aria-label={t.account_label}
        >
          <h2 className="font-sans text-xl font-semibold text-app-fg">
            {t.account_label}
          </h2>
          {!authLoaded ? (
            <p className="mt-2 font-sans text-sm text-app-muted">…</p>
          ) : email ? (
            <>
              <p className="mt-2 font-sans text-sm text-app-muted">
                {t.signed_in_as} {email}
              </p>
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-app-border bg-transparent px-4 py-2.5 font-sans text-sm font-medium text-app-fg transition-colors hover:bg-app-bg"
              >
                <LogOut className="h-4 w-4" />
                {t.sign_out}
              </button>
            </>
          ) : (
            <Link
              href="/login?redirect=/settings"
              className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-app-border bg-transparent px-4 py-2.5 font-sans text-sm font-medium text-app-fg transition-colors hover:bg-app-bg"
            >
              <LogIn className="h-4 w-4" />
              {t.sign_in}
            </Link>
          )}
        </section>

        <section
          id="subscription"
          className="rounded-lg border border-app-border bg-app-card px-6 py-8 sm:px-8"
          aria-label="Subscription"
        >
          <h2 className="font-sans text-xl font-semibold text-app-fg">
            Subscription
          </h2>
          {!trialLoaded ? (
            <p className="mt-2 font-sans text-sm text-app-muted">…</p>
          ) : (() => {
            const label = trialInfo
              ? planLabel(trialInfo.plan, trialInfo.trial_ends)
              : "Free trial";
            const isPro = trialInfo?.plan === "pro";

            return (
              <>
                <div className="mt-3 flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-xs font-semibold ${
                      isPro
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {isPro ? "Pro" : "Trial"}
                  </span>
                  <span className="font-sans text-sm text-app-muted">
                    {label}
                  </span>
                </div>

                {!isPro && (
                  <div className="mt-5 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleUpgrade}
                      disabled={checkoutLoading}
                      className="min-h-[44px] w-full rounded-xl bg-gradient-to-r from-[#d4856a] to-[#c46b6b] px-5 py-3 font-sans text-sm font-semibold text-white shadow-lg shadow-[#c46b6b]/20 transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto sm:min-w-[240px]"
                    >
                      {checkoutLoading ? "Redirecting…" : "Upgrade to Pro — €29.99/year"}
                    </button>
                    <button
                      type="button"
                      onClick={handleRestore}
                      disabled={restoreLoading}
                      className="font-sans text-sm text-app-muted underline decoration-app-border underline-offset-2 transition-colors hover:text-app-fg disabled:opacity-60"
                    >
                      {restoreLoading ? "Checking…" : "Restore purchase"}
                    </button>
                    {restoreMessage && (
                      <p className="font-sans text-xs text-app-muted">{restoreMessage}</p>
                    )}
                  </div>
                )}

                {isPro && (
                  <p className="mt-3 font-sans text-xs text-app-muted">
                    You have full access to all features.
                  </p>
                )}
              </>
            );
          })()}
        </section>

        <section
          className="rounded-lg border border-app-border bg-app-card px-6 py-8 sm:px-8"
          aria-label="Reading voice"
        >
          <h2 className="font-sans text-xl font-semibold text-app-fg">
            Reading voice
          </h2>
          <div className="mt-6">
            <VoiceSelector currentVoice={ttsVoice} />
          </div>
        </section>

        <section
          className="rounded-lg border border-app-border bg-app-card px-6 py-8 sm:px-8"
          aria-label={t.language_label}
        >
          <h2 className="font-sans text-xl font-semibold text-app-fg">
            {t.language_label}
          </h2>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <select
              value={selectedLocale}
              onChange={(e) =>
                setSelectedLocale(e.target.value as SupportedLocale)
              }
              className="min-h-[44px] w-full rounded-lg border border-app-border bg-app-bg px-4 py-2.5 font-sans text-base text-app-fg focus:border-app-fg focus:outline-none focus:ring-1 focus:ring-app-fg sm:w-auto"
            >
              <option value="en">{t.language_english}</option>
              <option value="sk">{t.language_slovak}</option>
            </select>
            <button
              type="button"
              onClick={handleSaveLanguage}
              disabled={saving || selectedLocale === locale}
              className="min-h-[44px] rounded-lg bg-app-fg px-4 py-2.5 font-medium text-app-bg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? t.loading : t.save_settings}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
