"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CHECK_BEZIER = [0.34, 1.56, 0.64, 1] as const;

export interface AnimatedCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  /** Optional aria-label for the button */
  "aria-label"?: string;
}

export function AnimatedCheckbox({
  checked,
  onToggle,
  size = 40,
  "aria-label": ariaLabel,
}: AnimatedCheckboxProps) {
  const prevCheckedRef = useRef(checked);
  const uncheckKeyRef = useRef(0);
  if (prevCheckedRef.current && !checked) {
    uncheckKeyRef.current += 1;
  }
  prevCheckedRef.current = checked;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  return (
    <motion.button
      key={checked ? "checked" : `uncheck-${uncheckKeyRef.current}`}
      type="button"
      onClick={handleClick}
      className="flex shrink-0 cursor-pointer items-center justify-center border-0 p-0 touch-target"
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        border: checked ? "none" : "1.5px solid rgba(255,255,255,0.12)",
        background: checked
          ? "linear-gradient(135deg, #f97316, #ec4899)"
          : "rgba(255,255,255,0.04)",
        boxShadow: checked ? "0 4px 16px rgba(249,115,22,0.3)" : "none",
      }}
      initial={checked ? false : { scale: 1 }}
      animate={{
        scale: checked ? [1, 1.2, 1] : [0.95, 1],
      }}
      transition={{
        duration: checked ? 0.4 : 0.2,
        ease: checked ? CHECK_BEZIER : "easeOut",
      }}
      aria-label={ariaLabel}
      aria-checked={checked}
    >
      <AnimatePresence initial={false}>
        {checked && (
          <motion.svg
            width={18}
            height={18}
            viewBox="0 0 20 20"
            fill="none"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ flexShrink: 0 }}
          >
            <path
              d="M4 10.5L8 14.5L16 6.5"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
