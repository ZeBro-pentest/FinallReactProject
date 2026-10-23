import { AlertCircle, Inbox, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Button } from './Button'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-panel/50 px-6 py-14 text-center',
        className,
      )}
    >
      <Icon className="size-10 text-zinc-600" aria-hidden="true" />
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-zinc-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({
  message = 'Не удалось загрузить данные',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center">
      <AlertCircle className="size-9 text-red-400" aria-hidden="true" />
      <h3 className="mt-3 text-base font-semibold text-white">Ошибка</h3>
      <p className="mt-1 max-w-md text-sm text-zinc-400">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          Попробовать снова
        </Button>
      )}
    </div>
  )
}
