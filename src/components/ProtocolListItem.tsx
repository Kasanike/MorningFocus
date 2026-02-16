"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2, Check } from "lucide-react";

const MotionDiv = motion.div;
const MotionP = motion.p;

export interface ProtocolStep {
  id: string;
  label: string;
  minutes: number;
}

interface ProtocolListItemProps {
  step: ProtocolStep;
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
          className="flex-1 rounded-lg border border-white/20 bg-black/20 px-4 py-2.5 font-sans text-app-fg placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
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
            className="w-16 rounded-lg border border-white/20 bg-black/20 px-2 py-2 text-center font-mono text-app-fg focus:border-white/40 focus:outline-none"
          />
          <span className="text-sm text-white/60">{minutesLabel}</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSaveEdit}
            className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-app-fg transition-colors hover:bg-white/30"
          >
            {saveLabel}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
            aria-label={removeLabel}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </motion.li>
    );
  }

  return (
    <motion.li
      layout
      onClick={handleRowClick}
      className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm transition-colors hover:bg-black/30 sm:p-6"
      whileTap={{ scale: 0.995 }}
    >
      <div className="min-w-0 flex-1">
        <MotionP
          className="font-sans text-base font-normal leading-relaxed drop-shadow-md"
          initial={false}
          animate={{
            opacity: isCompleted ? 0.4 : 1,
            textDecorationLine: isCompleted ? "line-through" : "none",
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {step.label}
        </MotionP>
        <MotionP
          className="mt-0.5 font-mono text-sm text-white/60 drop-shadow-md"
          initial={false}
          animate={{
            opacity: isCompleted ? 0.4 : 1,
            textDecorationLine: isCompleted ? "line-through" : "none",
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
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
            className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
            aria-label={`${editPrincipleLabel}: ${step.label}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
        {/* Custom circular checkbox - right side, same as Personal Constitution */}
        <MotionDiv
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
          initial={false}
          animate={{
            borderColor: isCompleted ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
            backgroundColor: isCompleted ? "rgba(255,255,255,0.95)" : "transparent",
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <MotionDiv
            initial={false}
            animate={{ opacity: isCompleted ? 1 : 0, scale: isCompleted ? 1 : 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Check className="h-3.5 w-3.5 text-black" strokeWidth={2.5} />
          </MotionDiv>
        </MotionDiv>
      </div>
    </motion.li>
  );
}
