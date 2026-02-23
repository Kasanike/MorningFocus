'use client'

import { cn } from '@/lib/utils'
import { CircleCheckbox } from '@/components/ui/circle-checkbox'

interface TaskCardProps {
  stepNumber: number
  title: string
  duration?: string
  completed: boolean
  onToggle: () => void
}

export function TaskCard({ stepNumber, title, duration, completed, onToggle }: TaskCardProps) {
  return (
    <div className={cn(
      'flex items-center gap-4 px-4 py-4 rounded-2xl',
      'border border-zinc-800/80 bg-zinc-900/50',
      'transition-all duration-150',
      completed && 'opacity-60'
    )}>
      
      {/* Step Number */}
      <span className={cn(
        'text-sm font-semibold tabular-nums w-6 shrink-0',
        completed ? 'text-zinc-600' : 'text-zinc-500'
      )}>
        {String(stepNumber).padStart(2, '0')}
      </span>

      {/* Title + Duration */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium text-zinc-100 leading-snug',
          completed && 'line-through text-zinc-500'
        )}>
          {title}
        </p>
        {duration && (
          <p className="text-xs text-zinc-500 mt-0.5">{duration}</p>
        )}
      </div>

      <CircleCheckbox completed={completed} onToggle={onToggle} />
    </div>
  )
}
