import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from './Button'

interface PaginationProps {
  page: number
  count: number
  pageSize?: number
  onChange: (page: number) => void
}

export function Pagination({
  page,
  count,
  pageSize = 12,
  onChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  if (count === 0) {
    return null
  }

  return (
    <nav
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
      aria-label="Пагинация"
    >
      <p className="text-sm text-zinc-500">
        Страница {page} из {totalPages} · всего {count}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          Назад
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Вперёд
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  )
}
