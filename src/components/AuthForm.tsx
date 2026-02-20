"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { trackSignupCompleted } from "@/lib/analytics";

type Mode = "signin" | "signup";

const inputBase =
  "block w-full min-w-0 rounded-[10px] border px-4 py-3 pl-11 font-sans text-base text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors";
const inputStyle = {
  background: "rgba(60, 30, 40, 0.4)",
  borderColor: "rgba(255, 255, 255, 0.06)",
};

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
        trackSignupCompleted();
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

  return (
    <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-5">
      <div className="mb-10 text-center">
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {mode === "signin" ? "Welcome back." : "Start your morning."}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Your principles, your protocol, your one thing.
        </p>
      </div>

      <div className="flex w-full min-w-0 shrink-0 rounded-lg border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 min-w-0 rounded py-3 text-sm font-medium transition-colors ${
            mode === "signin"
              ? "bg-white/20 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 min-w-0 rounded py-3 text-sm font-medium transition-colors ${
            mode === "signup"
              ? "bg-white/20 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          Create Account
        </button>
      </div>

      <div className="relative w-full min-w-0">
        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-white/50" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          disabled={loading}
          className={inputBase}
          style={inputStyle}
          autoComplete="email"
        />
      </div>

      <div className="relative w-full min-w-0">
        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-white/50" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          disabled={loading}
          minLength={mode === "signup" ? 6 : undefined}
          className={inputBase}
          style={inputStyle}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white/80">
          {error === "setup" ? (
            <div className="space-y-2">
              <p className="font-medium text-white">Supabase is not configured</p>
              <ol className="list-inside list-decimal space-y-1 text-white/70">
                <li>Create a <code className="rounded bg-white/10 px-1">.env.local</code> file in the project root</li>
                <li>Add: <code className="block rounded bg-white/10 p-2 text-xs">NEXT_PUBLIC_SUPABASE_URL=your-url<br />NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key</code></li>
                <li>Get these from <a href="https://supabase.com/dashboard/project/_/settings/api" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline text-white">Supabase Dashboard → Project Settings → API</a></li>
                <li>Restart the dev server (<code className="rounded bg-white/10 px-1">npm run dev</code>)</li>
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
        className="flex w-full min-w-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-sans text-base font-bold text-indigo-900 transition-opacity hover:opacity-90 disabled:opacity-70"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : mode === "signin" ? (
          "Sign in"
        ) : (
          "Create account"
        )}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 text-white/50" style={{ background: "rgba(30, 15, 25, 0.55)" }}>
            or
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex w-full min-w-0 items-center justify-center gap-2 rounded-[16px] border border-white/10 px-6 py-3.5 font-sans text-base font-medium text-white/95 transition-colors hover:bg-white/10 disabled:opacity-50"
        style={{
          background: "rgba(30, 15, 25, 0.4)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
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
