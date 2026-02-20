"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const BYPASS_AUTH =
  process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" &&
  process.env.NODE_ENV === "development";

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

    async function check() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (!BYPASS_AUTH && isProtected(pathname) && !user) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
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

        if (!cancelled) setChecked(true);
      } catch {
        if (cancelled) return;
        if (isProtected(pathname)) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        } else {
          setChecked(true);
        }
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
