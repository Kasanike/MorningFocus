"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";

const MotionDiv = motion.div;
const MotionP = motion.p;

export interface ProtocolStep {
  id: string;
  label: string;
  minutes: number;
}

/** Cool → warm step colors: row bg/border + 48px number pill (frosted container + darker number) */
const STEP_COLORS = [
  { bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.12)", pillBg: "rgba(167,139,250,0.18)", pillBorder: "rgba(167,139,250,0.25)", num: "rgba(167,139,250,0.95)" },
  { bg: "rgba(110,195,244,0.07)", border: "rgba(110,195,244,0.10)", pillBg: "rgba(110,195,244,0.16)", pillBorder: "rgba(110,195,244,0.22)", num: "rgba(110,195,244,0.95)" },
  { bg: "rgba(180,210,140,0.06)", border: "rgba(180,210,140,0.10)", pillBg: "rgba(180,210,140,0.16)", pillBorder: "rgba(180,210,140,0.22)", num: "rgba(180,210,140,0.95)" },
  { bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.12)", pillBg: "rgba(251,146,60,0.18)", pillBorder: "rgba(251,146,60,0.25)", num: "rgba(251,146,60,0.95)" },
];

function getStepColor(index: number) {
  return STEP_COLORS[index % STEP_COLORS.length] ?? STEP_COLORS[0];
}

interface ProtocolListItemProps {
  step: ProtocolStep;
  stepIndex: number;
  isCompleted: boolean;
  isEditing: boolean;
  isEditMode: boolean;
  editLabel: string;
  editMinutes: number;
  onToggle: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onRemove: () => void;
  onEditLabelChange: (v: string) => void;
  onEditMinutesChange: (v: number) => void;
  minutesLabel: string;
  saveLabel: string;
  removeLabel: string;
  editPrincipleLabel: string;
}

export function ProtocolListItem({
  step,
  stepIndex,
  isCompleted,
  isEditing,
  editLabel,
  editMinutes,
  onToggle,
  onStartEdit,
  onSaveEdit,
  onRemove,
  onEditLabelChange,
  onEditMinutesChange,
  minutesLabel,
  saveLabel,
  removeLabel,
  editPrincipleLabel,
  isEditMode,
}: ProtocolListItemProps) {
  const color = getStepColor(stepIndex);
  const handleRowClick = (e: React.MouseEvent) => {
    if (isEditing) return;
    const target = e.target as HTMLElement;
    if (target.closest("button[data-edit]") || target.closest("input")) return;
    onToggle();
  };

  if (isEditing) {
    return (
      <motion.li
        layout
        className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm sm:flex-row sm:items-center"
      >
        <input
          type="text"
          value={editLabel}
          onChange={(e) => onEditLabelChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSaveEdit()}
          className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-white/20 bg-black/20 px-4 py-2.5 font-sans text-base text-app-fg placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
          autoFocus
        />
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={editMinutes}
            onChange={(e) =>
              onEditMinutesChange(Math.max(0, parseInt(e.target.value, 10) || 0))
            }
            className="min-h-[44px] w-16 min-w-[64px] rounded-lg border border-white/20 bg-black/20 px-2 py-2 text-center font-mono text-base text-app-fg focus:border-white/40 focus:outline-none"
          />
          <span className="text-sm text-white/60">{minutesLabel}</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSaveEdit}
            className="min-h-[44px] rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-app-fg transition-colors hover:bg-white/30"
          >
            {saveLabel}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="touch-target flex items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
            aria-label={removeLabel}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </motion.li>
    );
  }

  const itemTransition = { duration: 0.2, ease: "easeOut" as const };

  return (
    <motion.li
      layout
      onClick={handleRowClick}
      className="flex cursor-pointer items-center gap-3 rounded-[14px] border transition-all duration-300"
      style={{
        padding: "14px",
        background: isCompleted ? "rgba(255,255,255,0.02)" : color.bg,
        borderColor: isCompleted ? "rgba(255,255,255,0.04)" : color.border,
        opacity: isCompleted ? 0.5 : 1,
      }}
      whileTap={{ scale: 0.995 }}
    >
      <span
        className="flex shrink-0 items-center justify-center rounded-[12px] font-mono font-bold transition-colors"
        style={{
          width: 48,
          height: 48,
          background: isCompleted ? "rgba(255,255,255,0.06)" : color.pillBg,
          border: `1px solid ${isCompleted ? "rgba(255,255,255,0.08)" : color.pillBorder}`,
          color: isCompleted ? "rgba(255,255,255,0.2)" : color.num,
          boxShadow: isCompleted ? "none" : "0 0 0 1px rgba(255,255,255,0.04) inset",
          fontSize: 20,
        }}
      >
        {String(stepIndex + 1).padStart(2, "0")}
      </span>

      <div className="min-w-0 flex-1 overflow-hidden">
        <MotionP
          className="break-words text-[15px] font-medium transition-all duration-300"
          initial={false}
          animate={{
            color: isCompleted ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.85)",
            textDecoration: isCompleted ? "line-through" : "none",
            textDecorationColor: "rgba(255,255,255,0.15)",
          }}
          transition={itemTransition}
        >
          {step.label}
        </MotionP>
        <MotionP
          className="text-xs transition-colors duration-300"
          initial={false}
          animate={{
            color: isCompleted ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.3)",
          }}
          style={{ margin: "2px 0 0" }}
          transition={itemTransition}
        >
          {step.minutes > 0 ? `${step.minutes} ${minutesLabel}` : "—"}
        </MotionP>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isEditMode && (
          <button
            type="button"
            data-edit
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
            className="touch-target flex items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
            aria-label={`${editPrincipleLabel}: ${step.label}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
        <AnimatedCheckbox checked={isCompleted} onToggle={onToggle} />
      </div>
    </motion.li>
  );
}
