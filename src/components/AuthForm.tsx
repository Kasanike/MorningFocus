"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Mode = "signin" | "signup";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
      }

      router.push(redirect);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      const isConfigError = message.toLowerCase().includes("supabase") && message.toLowerCase().includes("env");
      setError(isConfigError ? "setup" : message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${redirect}`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign in with Google.";
      const isConfigError = message.toLowerCase().includes("supabase") && message.toLowerCase().includes("env");
      setError(isConfigError ? "setup" : message);
      setLoading(false);
    }
  };

  const inputBase =
    "block w-full min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-4 py-3 pl-11 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-amber-600/50 focus:outline-none focus:ring-1 focus:ring-amber-600/30 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-5">
      <div className="flex w-full min-w-0 shrink-0 rounded-lg border border-zinc-700/60 bg-zinc-900/40 p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 min-w-0 rounded-md py-3 text-sm font-medium transition-colors ${
            mode === "signin"
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 min-w-0 rounded-md py-3 text-sm font-medium transition-colors ${
            mode === "signup"
              ? "bg-zinc-800 text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Create Account
        </button>
      </div>

      <div className="relative w-full min-w-0">
        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-zinc-500" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          disabled={loading}
          className={inputBase}
          autoComplete="email"
        />
      </div>

      <div className="relative w-full min-w-0">
        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-zinc-500" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          disabled={loading}
          minLength={mode === "signup" ? 6 : undefined}
          className={inputBase}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
        />
      </div>

      {error && (
        <div
          className={`rounded-lg px-3 py-2.5 text-sm ${
            error === "setup"
              ? "border border-amber-600/40 bg-amber-950/30 text-amber-200"
              : "bg-red-950/50 text-red-400"
          }`}
        >
          {error === "setup" ? (
            <div className="space-y-2">
              <p className="font-medium">Supabase is not configured</p>
              <ol className="list-inside list-decimal space-y-1 text-amber-200/90">
                <li>Create a <code className="rounded bg-zinc-800 px-1">.env.local</code> file in the project root</li>
                <li>Add: <code className="block rounded bg-zinc-800/80 p-2 text-xs">NEXT_PUBLIC_SUPABASE_URL=your-url<br />NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key</code></li>
                <li>Get these from <a href="https://supabase.com/dashboard/project/_/settings/api" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Supabase Dashboard → Project Settings → API</a></li>
                <li>Restart the dev server (<code className="rounded bg-zinc-800 px-1">npm run dev</code>)</li>
              </ol>
            </div>
          ) : (
            error
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-amber-600/90 px-6 py-4 text-base font-semibold text-zinc-950 transition-colors hover:bg-amber-500 disabled:opacity-70"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "ENTER THE ARENA"
        )}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700/60" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-zinc-950/80 px-3 text-zinc-500">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-zinc-600/80 bg-zinc-800/30 px-6 py-3.5 text-base font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800/50 disabled:opacity-50"
      >
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>
    </form>
  );
}
