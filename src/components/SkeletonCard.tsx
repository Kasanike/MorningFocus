"use client";

/**
 * Animated skeleton loader matching the glass-card style.
 * Pulsing dark rectangles on dark background — no white flash or spinner.
 * Use while fetching data from Supabase; swap to real content when loaded.
 */
interface SkeletonCardProps {
  /** "card" = title + lines (default). "list" = title + list rows. "keystone" = title + input bar. "banner" = compact. */
  variant?: "card" | "list" | "keystone" | "banner";
  /** Number of content lines/bars (card: default 4, list: default 5). */
  lines?: number;
  className?: string;
}

const barClass =
  "rounded-lg bg-white/[0.12] animate-skeleton-pulse";

export function SkeletonCard({
  variant = "card",
  lines = variant === "list" ? 5 : 4,
  className = "",
}: SkeletonCardProps) {
  if (variant === "banner") {
    return (
      <div
        className={
          "rounded-xl border border-app-border bg-app-card/90 p-4 sm:p-5 " +
          className
        }
        aria-hidden
      >
        <div className={`h-4 w-3/4 max-w-[280px] ${barClass}`} />
        <div className={`mt-2 h-3 w-1/2 max-w-[180px] ${barClass}`} />
        <div className="mt-4 flex gap-3">
          <div className={`h-10 w-24 rounded-lg ${barClass}`} />
          <div className={`h-10 w-28 rounded-lg ${barClass}`} />
        </div>
      </div>
    );
  }

  const baseCardClass =
    "card-glass rounded-2xl border border-white/10 shadow-2xl shadow-black/20 px-4 py-10 sm:px-10 sm:py-12 " +
    className;

  if (variant === "keystone") {
    return (
      <section className={baseCardClass} aria-hidden>
        <div className="flex items-center gap-3">
          <div className={`h-5 w-5 rounded ${barClass}`} />
          <div className={`h-6 w-40 ${barClass}`} />
        </div>
        <div className={`mt-2 h-3 w-full max-w-[200px] ${barClass}`} />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className={`h-12 flex-1 rounded-full ${barClass}`} />
          <div className={`h-12 w-full rounded-full sm:w-24 ${barClass}`} />
        </div>
      </section>
    );
  }

  if (variant === "list") {
    return (
      <section className={baseCardClass} aria-hidden>
        <div className={`h-6 w-44 ${barClass}`} />
        <div className={`mt-1 h-3 w-32 ${barClass}`} />
        <ul className="mt-6 space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <li
              key={i}
              className="flex items-center gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 sm:p-6"
            >
              <div className={`min-w-0 flex-1 ${barClass}`} style={{ height: 20 }} />
              <div className={`h-4 w-4 shrink-0 rounded-full ${barClass}`} />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className={baseCardClass} aria-hidden>
      <div className={`h-6 w-44 ${barClass}`} />
      <div className={`mt-1 h-3 w-36 ${barClass}`} />
      <div className="mt-6 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-5 rounded-lg ${barClass}`}
            style={{ width: i === lines - 1 ? "60%" : "100%" }}
          />
        ))}
      </div>
    </section>
  );
}
