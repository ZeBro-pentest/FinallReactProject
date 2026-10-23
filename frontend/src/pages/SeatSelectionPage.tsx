import { ArrowLeft, Armchair, Clock, MapPin, Ticket } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Button, ButtonLink } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Loaders'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { SeatMap } from '@/features/booking/SeatMap'
import { useSession } from '@/hooks/useSessions'
import { formatDateTime } from '@/lib/dates'
import { formatPrice } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearBooking, startSession, toggleSeat } from '@/store/bookingSlice'
import type { Seat } from '@/types'

export function SeatSelectionPage() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const sessionQuery = useSession(id)
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats)

  const session = sessionQuery.data

  useEffect(() => {
    if (session) {
      dispatch(startSession(session))
    }
  }, [session, dispatch])

  const selectedIds = useMemo(
    () => new Set(selectedSeats.map((seat) => seat.id)),
    [selectedSeats],
  )

  const handleToggle = useCallback(
    (seat: Seat) => {
      dispatch(toggleSeat(seat))
    },
    [dispatch],
  )

  const total = useMemo(() => {
    if (!session) {
      return 0
    }
    return selectedSeats.reduce(
      (sum, seat) => sum + (seat.is_vip ? session.vip_price : session.base_price),
      0,
    )
  }, [selectedSeats, session])

  if (sessionQuery.isLoading) {
    return <PageLoader />
  }

  if (sessionQuery.isError || !session) {
    return (
      <div className="container-page py-8">
        <ErrorState
          message="Сеанс не найден."
          onRetry={() => sessionQuery.refetch()}
        />
      </div>
    )
  }

  const isPast = new Date(session.starts_at).getTime() < Date.now()

  if (isPast) {
    return (
      <div className="container-page py-8">
        <EmptyState
          icon={Clock}
          title="Сеанс уже прошёл"
          description="Выберите другой сеанс в афише."
          action={<ButtonLink to="/movies">К афише</ButtonLink>}
        />
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <Link
        to={`/movies/${session.movie.id}`}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-accent"
      >
        <ArrowLeft className="size-4" />
        К фильму
      </Link>

      <div className="mt-4 flex flex-col gap-2 border-b border-line pb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {session.movie.title}
        </h1>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {formatDateTime(session.starts_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {session.hall.name}
          </span>
          <span className="flex items-center gap-1.5">
            <Ticket className="size-4" />
            Обычное место {formatPrice(session.base_price)}
          </span>
          <span className="flex items-center gap-1.5 text-violet-300">
            <Armchair className="size-4" />
            VIP {formatPrice(session.vip_price)}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-line bg-panel p-4 sm:p-6">
          <SeatMap
            seats={session.seats}
            selectedIds={selectedIds}
            onToggle={handleToggle}
          />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="text-lg font-semibold text-white">Ваш заказ</h2>

            {selectedSeats.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                Нажмите на свободные места на схеме зала.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {selectedSeats
                  .slice()
                  .sort(
                    (a, b) =>
                      a.row_number - b.row_number || a.seat_number - b.seat_number,
                  )
                  .map((seat) => (
                    <li
                      key={seat.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-zinc-300">
                        Ряд {seat.row_number}, место {seat.seat_number}
                        {seat.is_vip && (
                          <span className="ml-1.5 text-xs text-violet-400">VIP</span>
                        )}
                      </span>
                      <span className="text-zinc-400">
                        {formatPrice(
                          seat.is_vip ? session.vip_price : session.base_price,
                        )}
                      </span>
                    </li>
                  ))}
              </ul>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm text-zinc-400">
                Мест: {selectedSeats.length}
              </span>
              <span className="text-xl font-bold text-white">
                {formatPrice(total)}
              </span>
            </div>

            {selectedSeats.length > 0 ? (
              <ButtonLink to="/checkout" className="mt-5 w-full">
                Перейти к оплате
              </ButtonLink>
            ) : (
              <Button className="mt-5 w-full" disabled>
                Выберите места
              </Button>
            )}

            {selectedSeats.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => dispatch(clearBooking())}
              >
                Очистить выбор
              </Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
