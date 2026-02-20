"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, LogIn } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/utils/supabase/client";
import { PaywallBanner } from "@/components/PaywallBanner";
import type { SupportedLocale } from "@/locales";

export default function SettingsPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale>(locale);
  const [email, setEmail] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    setSelectedLocale(locale);
  }, [locale]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
      setAuthLoaded(true);
    };
    load();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
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

        <PaywallBanner />

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
