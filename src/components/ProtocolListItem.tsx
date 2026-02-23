"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";

const MotionDiv = motion.div;
const MotionP = motion.p;

export interface ProtocolStep {
  id: string;
  label: string;
  minutes: number;
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
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
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
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  onEditLabelChange,
  onEditMinutesChange,
  minutesLabel,
  saveLabel,
  removeLabel,
  editPrincipleLabel,
  isEditMode,
}: ProtocolListItemProps) {
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
        className="flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 sm:flex-row sm:items-center sm:p-6"
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
            className="min-h-[44px] w-16 min-w-[64px] rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-center text-base text-zinc-100 focus:border-zinc-500 focus:outline-none"
          />
          <span className="text-sm text-white/60">{minutesLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {onMoveUp != null && onMoveDown != null && (
            <div className="flex flex-col">
              <button
                type="button"
                disabled={!canMoveUp}
                onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={!canMoveDown}
                onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onSaveEdit}
            className="min-h-[44px] min-w-[44px] rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-app-fg transition-colors hover:bg-white/30"
          >
            {saveLabel}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
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
      className={`flex cursor-pointer items-center gap-3 rounded-[14px] border transition-all duration-300 ${
        isCompleted ? "border-orange-500/50" : "border-zinc-800"
      }`}
      style={{
        padding: "14px",
        background: isCompleted ? "rgba(249,115,22,0.06)" : "rgba(255,255,255,0.02)",
        opacity: isCompleted ? 0.95 : 1,
      }}
      whileTap={{ scale: 0.995 }}
    >
      <span
        className="flex shrink-0 items-center justify-center rounded-xl text-sm font-semibold tabular-nums text-zinc-500"
        style={{
          width: 48,
          height: 48,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
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
            color: isCompleted ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.85)",
            textDecoration: isCompleted ? "line-through" : "none",
            textDecorationColor: "rgba(255,255,255,0.35)",
          }}
          transition={itemTransition}
          style={isCompleted ? { opacity: 0.4 } : {}}
        >
          {step.label}
        </MotionP>
        <MotionP
          className="text-xs transition-colors duration-300"
          initial={false}
          animate={{
            color: isCompleted ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)",
          }}
          style={{ margin: "2px 0 0", ...(isCompleted ? { opacity: 0.4 } : {}) }}
          transition={itemTransition}
        >
          {step.minutes > 0 ? `${step.minutes} ${minutesLabel}` : "—"}
        </MotionP>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isEditMode && onMoveUp != null && onMoveDown != null && (
          <div className="flex flex-col">
            <button
              type="button"
              data-edit
              disabled={!canMoveUp}
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              data-edit
              disabled={!canMoveDown}
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        )}
        {isEditMode && (
          <button
            type="button"
            data-edit
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
            aria-label={`${editPrincipleLabel}: ${step.label}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
        <AnimatedCheckbox
          variant="primary"
          checked={isCompleted}
          onToggle={onToggle}
          aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
        />
      </div>
    </motion.li>
  );
}
