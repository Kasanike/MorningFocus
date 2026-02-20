"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { enableAutoPageviews, trackPageview } from "@/lib/analytics";

/**
 * Initializes Plausible and tracks page views on route change.
 * Renders nothing.
 */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    enableAutoPageviews();
  }, []);

  useEffect(() => {
    if (pathname) trackPageview();
  }, [pathname]);

  return null;
}
