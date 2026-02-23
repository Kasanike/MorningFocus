'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface CircleCheckboxProps {
  completed: boolean
  onToggle: () => void
  ariaLabel?: string
}

export function CircleCheckbox({ completed, onToggle, ariaLabel }: CircleCheckboxProps) {
  const [pressing, setPressing] = useState(false)

  return (
    <button
      type="button"
      onMouseDown={() => setPressing(true)}
      onMouseUp={() => setPressing(false)}
      onMouseLeave={() => setPressing(false)}
      onTouchStart={() => setPressing(true)}
      onTouchEnd={() => setPressing(false)}
      onClick={onToggle}
      className={cn(
        'shrink-0 w-7 h-7 rounded-full border-2',
        'flex items-center justify-center',
        'transition-all duration-150',
        pressing && 'scale-90',
        completed
          ? 'bg-white border-white'
          : 'bg-transparent border-zinc-600 hover:border-zinc-400'
      )}
      aria-label={ariaLabel ?? (completed ? 'Mark incomplete' : 'Mark complete')}
    >
      {completed && (
        <Check size={14} strokeWidth={3} className="text-zinc-950" />
      )}
    </button>
  )
}
