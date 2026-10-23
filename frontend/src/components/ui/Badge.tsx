import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type BadgeVariant = 'accent' | 'success' | 'danger' | 'muted' | 'vip'

const variants: Record<BadgeVariant, string> = {
  accent: 'bg-accent/15 text-amber-300 border-accent/30',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  danger: 'bg-red-500/15 text-red-300 border-red-500/30',
  muted: 'bg-panel-soft text-zinc-400 border-line',
  vip: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
}

export function Badge({
  children,
  variant = 'muted',
  className,
}: {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
