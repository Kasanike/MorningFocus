"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/** Set to true to skip login and go straight to /home (e.g. for local dev). */
const BYPASS_AUTH = false;

const PROTECTED_ROUTES = ["/home", "/settings"];
const AUTH_ROUTES = ["/login"];

function isProtected(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeout = 3000; // Don't block render for more than 3s (e.g. slow/unreachable Supabase)

    async function check() {
      const timeoutId = setTimeout(() => {
        if (!cancelled) setChecked(true);
      }, timeout);

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        clearTimeout(timeoutId);
        if (cancelled) return;

        if (!BYPASS_AUTH && isProtected(pathname) && !user) {
          const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
          router.replace(loginUrl);
          return;
        }

        if (BYPASS_AUTH && isAuthRoute(pathname)) {
          router.replace("/home");
          return;
        }

        if (!BYPASS_AUTH && isAuthRoute(pathname) && user) {
          const redirect =
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("redirect") ?? "/home"
              : "/home";
          router.replace(redirect);
          return;
        }
      } catch {
        // If Supabase fails, allow through (e.g. env vars missing)
      } finally {
        clearTimeout(timeoutId);
        if (!cancelled) setChecked(true);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!checked && (isProtected(pathname) || isAuthRoute(pathname))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded border-2 border-app-border border-t-app-fg" />
      </div>
    );
  }

  return <>{children}</>;
}
