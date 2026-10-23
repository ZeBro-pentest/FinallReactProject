import { CalendarDays, Clock, MapPin, Ticket } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Skeleton } from '@/components/ui/Loaders'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useCancelBooking, useMyBookings } from '@/hooks/useBookings'
import { useDisclosure } from '@/hooks/useDisclosure'
import { formatDateTime } from '@/lib/dates'
import { getErrorMessage } from '@/lib/errors'
import { formatPrice, getPageFromParams } from '@/lib/utils'

const tabs = [
  { value: '', label: 'Все' },
  { value: 'paid', label: 'Оплаченные' },
  { value: 'cancelled', label: 'Отменённые' },
]

export function MyTicketsPage() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') ?? ''
  const page = getPageFromParams(params)
  const { data, isLoading, isError, refetch } = useMyBookings({ status, page })
  const cancelBooking = useCancelBooking()
  const confirm = useDisclosure()
  const [cancelId, setCancelId] = useState<number | null>(null)

  const changeTab = useCallback(
    (value: string) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set('status', value)
        } else {
          next.delete('status')
        }
        next.delete('page')
        return next
      })
    },
    [setParams],
  )

  const changePage = useCallback(
    (nextPage: number) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        if (nextPage > 1) {
          next.set('page', String(nextPage))
        } else {
          next.delete('page')
        }
        return next
      })
    },
    [setParams],
  )

  const handleCancel = async () => {
    if (!cancelId) {
      return
    }
    try {
      await cancelBooking.mutateAsync(cancelId)
      toast.success('Бронь отменена')
      confirm.close()
      setCancelId(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось отменить бронь'))
    }
  }

  return (
    <div className="container-page py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Мои билеты</h1>
          <p className="mt-1 text-sm text-zinc-500">
            История бронирований и электронные билеты
          </p>
        </div>
        <ButtonLink to="/movies" variant="secondary" size="sm">
          Купить ещё билет
        </ButtonLink>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => changeTab(tab.value)}
            className={
              status === tab.value
                ? 'rounded-xl bg-accent px-3.5 py-2 text-sm font-semibold text-black'
                : 'rounded-xl border border-line bg-panel px-3.5 py-2 text-sm text-zinc-400 hover:text-white'
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full" />
            ))}
          </div>
        )}

        {isError && (
          <ErrorState
            message="Не удалось загрузить билеты."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && data && data.results.length === 0 && (
          <EmptyState
            icon={Ticket}
            title="Билетов пока нет"
            description="Выберите фильм и сеанс — билет появится здесь сразу после оплаты."
            action={<ButtonLink to="/movies">Перейти к афише</ButtonLink>}
          />
        )}

        {!isLoading && !isError && data && data.results.length > 0 && (
          <>
            <div className="space-y-4">
              {data.results.map((booking) => {
                const isPast = new Date(booking.session.starts_at).getTime() < Date.now()
                return (
                  <article
                    key={booking.id}
                    className="overflow-hidden rounded-2xl border border-line bg-panel"
                  >
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-sm font-semibold text-accent">
                            {booking.code}
                          </span>
                          <Badge
                            variant={booking.status === 'paid' ? 'success' : 'danger'}
                          >
                            {booking.status_display}
                          </Badge>
                          {isPast && <Badge>Сеанс прошёл</Badge>}
                        </div>
                        <h2 className="mt-2 text-lg font-semibold text-white">
                          {booking.session.movie.title}
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-zinc-500">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="size-4" />
                            {formatDateTime(booking.session.starts_at)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-4" />
                            {booking.session.hall.name}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="size-4" />
                            Куплено{' '}
                            {formatDateTime(booking.created_at)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-400">
                          {booking.seats_snapshot.join(' · ')}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                        <span className="text-xl font-bold text-white">
                          {formatPrice(booking.total_price)}
                        </span>
                        {booking.status === 'paid' && !isPast && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setCancelId(booking.id)
                              confirm.open()
                            }}
                          >
                            Отменить
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            <div className="mt-6">
              <Pagination page={page} count={data.count} onChange={changePage} />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirm.isOpen}
        title="Отменить бронь?"
        description="Места вернутся в продажу, а билет перестанет действовать. Это действие нельзя отменить."
        confirmLabel="Да, отменить"
        loading={cancelBooking.isPending}
        onConfirm={handleCancel}
        onClose={() => {
          confirm.close()
          setCancelId(null)
        }}
      />
    </div>
  )
}
