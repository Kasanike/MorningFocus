'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Timer, BookOpen, Target, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'protocol',     label: 'PROTOCOL',     icon: Timer,    href: '/protocol'     },
  { id: 'constitution', label: 'CONSTITUTION',  icon: BookOpen, href: '/constitution' },
  { id: 'keystone',     label: 'KEYSTONE',      icon: Target,   href: '/keystone'     },
  { id: 'reflect',      label: 'REFLECT',       icon: Moon,     href: '/reflect'      },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center 
                    bg-zinc-950 border-t border-zinc-800/60 px-2">
      {tabs.map(({ id, label, icon: Icon, href }) => {
        const isActive = pathname.startsWith(href)
        return (
          <button
            key={id}
            onClick={() => router.push(href)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2',
              'transition-colors duration-150',
              isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'
            )}
          >
            <Icon 
              size={20} 
              strokeWidth={isActive ? 2 : 1.5} 
            />
            <span className="text-[9px] font-medium tracking-widest">
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
