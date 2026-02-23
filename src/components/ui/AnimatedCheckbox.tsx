"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CHECK_BEZIER = [0.34, 1.56, 0.64, 1] as const;

export interface AnimatedCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  /** Primary style: 44px tap target; unchecked uses white/8 bg + white/15 border; orange only on hover and when checked */
  variant?: "default" | "primary";
  /** Optional aria-label for the button */
  "aria-label"?: string;
}

export function AnimatedCheckbox({
  checked,
  onToggle,
  size,
  variant = "default",
  "aria-label": ariaLabel,
}: AnimatedCheckboxProps) {
  const resolvedSize = size ?? (variant === "primary" ? 44 : 40);
  const prevCheckedRef = useRef(checked);
  const uncheckKeyRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  if (prevCheckedRef.current && !checked) {
    uncheckKeyRef.current += 1;
  }
  prevCheckedRef.current = checked;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  // Unchecked: white/8 bg, white/15 border. Hover: orange border 40% + scale(1.05). Checked: unchanged.
  const uncheckedBg = "rgba(255,255,255,0.08)";
  const uncheckedBorder =
    !checked && isHovered
      ? "2px solid rgba(249,115,22,0.4)"
      : "2px solid rgba(255,255,255,0.15)";
  const uncheckedBoxShadow = "none";

  return (
    <motion.button
      key={checked ? "checked" : `uncheck-${uncheckKeyRef.current}`}
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex shrink-0 cursor-pointer items-center justify-center border-0 p-0 touch-target"
      style={{
        width: resolvedSize,
        height: resolvedSize,
        minWidth: resolvedSize,
        minHeight: resolvedSize,
        borderRadius: 12,
        border: checked ? "none" : uncheckedBorder,
        background: checked ? "rgb(249 115 22)" : uncheckedBg,
        boxShadow: checked ? "0 0 12px rgba(249,115,22,0.35)" : uncheckedBoxShadow,
        transition: "border-color 150ms ease-out, background-color 150ms ease-out, box-shadow 150ms ease-out",
      }}
      initial={checked ? false : { scale: 1 }}
      animate={{
        scale: checked ? [1, 1.15, 1] : (isHovered ? 1.05 : 1),
      }}
      transition={{
        duration: checked ? 0.45 : 0.15,
        ease: checked ? CHECK_BEZIER : "easeOut",
      }}
      aria-label={ariaLabel}
      aria-checked={checked}
    >
      <AnimatePresence initial={false}>
        {checked && (
          <motion.svg
            width={resolvedSize >= 44 ? 22 : 18}
            height={resolvedSize >= 44 ? 22 : 18}
            viewBox="0 0 20 20"
            fill="none"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 22,
            }}
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
