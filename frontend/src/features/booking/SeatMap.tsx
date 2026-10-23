import { memo, useMemo } from 'react'

import { cn } from '@/lib/utils'
import type { Seat } from '@/types'

interface SeatMapProps {
  seats: Seat[]
  selectedIds: Set<number>
  onToggle: (seat: Seat) => void
}

const SeatButton = memo(function SeatButton({
  seat,
  selected,
  onToggle,
}: {
  seat: Seat
  selected: boolean
  onToggle: (seat: Seat) => void
}) {
  return (
    <button
      type="button"
      disabled={seat.is_booked}
      onClick={() => onToggle(seat)}
      aria-label={`Ряд ${seat.row_number}, место ${seat.seat_number}${seat.is_vip ? ', VIP' : ''}`}
      aria-pressed={selected}
      className={cn(
        'h-7 w-7 rounded-t-md border text-[10px] font-semibold transition-colors sm:h-8 sm:w-8',
        seat.is_booked &&
          'cursor-not-allowed border-line bg-panel-soft text-zinc-700',
        !seat.is_booked &&
          !selected &&
          'border-line bg-panel text-zinc-400 hover:border-accent/60 hover:text-white',
        !seat.is_booked &&
          selected &&
          'border-accent bg-accent text-black',
        seat.is_vip && !seat.is_booked && !selected && 'border-violet-500/40',
      )}
    >
      {seat.seat_number}
    </button>
  )
})

export function SeatMap({ seats, selectedIds, onToggle }: SeatMapProps) {
  const rows = useMemo(() => {
    const grouped = new Map<number, Seat[]>()
    for (const seat of seats) {
      const list = grouped.get(seat.row_number) ?? []
      list.push(seat)
      grouped.set(seat.row_number, list)
    }
    return [...grouped.entries()]
      .sort(([a], [b]) => a - b)
      .map(([row, items]) => ({
        row,
        items: items.sort((a, b) => a.seat_number - b.seat_number),
      }))
  }, [seats])

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mx-auto h-1.5 w-2/3 rounded-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        <p className="mt-2 text-[11px] tracking-[0.25em] text-zinc-600 uppercase">
          Экран
        </p>
      </div>

      <div className="overflow-x-auto pb-3">
        <div className="mx-auto w-max space-y-1.5">
          {rows.map(({ row, items }) => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-5 text-right text-[11px] text-zinc-600">{row}</span>
              <div className="flex gap-1.5">
                {items.map((seat) => (
                  <SeatButton
                    key={seat.id}
                    seat={seat}
                    selected={selectedIds.has(seat.id)}
                    onToggle={onToggle}
                  />
                ))}
              </div>
              <span className="w-5 text-[11px] text-zinc-600">{row}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="size-3.5 rounded-t-sm border border-line bg-panel" />
          Свободно
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3.5 rounded-t-sm bg-accent" />
          Выбрано
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3.5 rounded-t-sm bg-panel-soft" />
          Занято
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3.5 rounded-t-sm border border-violet-500/50 bg-panel" />
          VIP
        </span>
      </div>
    </div>
  )
}
