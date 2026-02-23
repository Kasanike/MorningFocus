"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export interface SectionSuccessCardProps {
  /** Small caps label above title (e.g. "Keystone locked in") */
  label: string;
  /** Big title, can include <br /> for line break */
  title: string | React.ReactNode;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Optional frosted card: { label, text } e.g. Today's keystone */
  contentCard?: { label: string; text: string };
  /** Optional quote: { text, author } */
  quote?: { text: string; author: string };
  /** Primary CTA */
  primaryButton: { label: string; onClick: () => void };
  /** Optional secondary action (e.g. Redo, Review) */
  secondaryButton?: { label: string; onClick: () => void };
}

const rise = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } };
const stagger = (delay: number) => ({ ...rise, transition: { ...rise.transition, delay } });

export function SectionSuccessCard({
  label,
  title,
  subtitle,
  contentCard,
  quote,
  primaryButton,
  secondaryButton,
}: SectionSuccessCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 text-center"
      style={{
        padding: "28px 24px",
      }}
    >
      {/* Decorative circle */}
      <div
        className="pointer-events-none absolute left-1/2 top-[18%] h-64 w-64 -translate-x-1/2 rounded-full bg-zinc-800/30"
        aria-hidden
      />

      {/* Concentric circles icon */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 24, delay: 0.05 }}
        className="relative mb-5 flex items-center justify-center"
      >
        <motion.div
          className="absolute h-[90px] w-[90px] rounded-full bg-zinc-700/30"
          animate={{ scale: [1, 2.2, 2.2], opacity: [0.5, 0, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.2 }}
        />
        <motion.div
          className="relative"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
        >
          <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="58" fill="rgba(160,85,112,0.3)" />
            <circle cx="60" cy="60" r="45" fill="rgba(193,122,90,0.42)" />
            <circle cx="60" cy="60" r="33" fill="rgba(220,185,160,0.58)" />
            <circle cx="60" cy="60" r="22" fill="rgba(250,240,225,0.9)" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Label */}
      <motion.p
        {...stagger(0.12)}
        className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/40"
      >
        {label}
      </motion.p>

      {/* Title */}
      <motion.h2
        {...stagger(0.18)}
        className="mb-3 text-center text-[26px] font-extrabold leading-tight tracking-tight text-zinc-100"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          {...stagger(0.24)}
          className="mb-4 text-[14px] leading-relaxed text-white/50"
        >
          {subtitle}
        </motion.p>
      )}

      {contentCard && (
        <motion.div
          {...stagger(0.3)}
          className="mb-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 px-5 py-4 text-center"
          style={{
            background: "rgba(255,255,255,0.06)",
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">
            {contentCard.label}
          </p>
          <p className="text-[17px] font-semibold leading-snug text-white/90">
            {contentCard.text}
          </p>
        </motion.div>
      )}

      {quote && (
        <motion.div {...stagger(0.36)} className="mb-5 px-1">
          <p className="mb-1.5 text-[15px] italic leading-relaxed text-white/40">
            {quote.text}
          </p>
          <p className="text-[11px] tracking-wide text-white/25">— {quote.author}</p>
        </motion.div>
      )}

      <motion.div {...stagger(0.42)} className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={primaryButton.onClick}
          className="relative flex min-h-[48px] min-w-[44px] items-center justify-center gap-2 rounded-2xl bg-zinc-600 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-zinc-500 active:scale-[0.98]"
        >
          <span className="relative">{primaryButton.label}</span>
          <ChevronRight className="relative h-5 w-5" />
        </button>
        {secondaryButton && (
          <button
            type="button"
            onClick={secondaryButton.onClick}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white/75"
          >
            {secondaryButton.label}
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
