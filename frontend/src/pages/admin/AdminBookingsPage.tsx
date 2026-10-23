import { Ticket, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Loaders'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useAdminBookings, useCancelAdminBooking } from '@/hooks/useBookings'
import { useDebounce } from '@/hooks/useDebounce'
import { useDisclosure } from '@/hooks/useDisclosure'
import { formatDateTime } from '@/lib/dates'
import { getErrorMessage } from '@/lib/errors'
import { formatPrice, getPageFromParams } from '@/lib/utils'

export function AdminBookingsPage() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') ?? ''
  const search = params.get('search') ?? ''
  const page = getPageFromParams(params)
  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounce(searchInput, 400)
  const { data, isLoading, isError, refetch } = useAdminBookings({
    status,
    search,
    page,
  })
  const cancelBooking = useCancelAdminBooking()
  const confirm = useDisclosure()
  const [cancelId, setCancelId] = useState<number | null>(null)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    if (debouncedSearch.trim() === search) {
      return
    }
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (debouncedSearch.trim()) {
          next.set('search', debouncedSearch.trim())
        } else {
          next.delete('search')
        }
        next.delete('page')
        return next
      },
      { replace: true },
    )
  }, [debouncedSearch, search, setParams])

  const updateParam = useCallback(
    (key: string, value: string) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set(key, value)
        } else {
          next.delete(key)
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
      toast.success('Бронь отменена, места освобождены')
      confirm.close()
      setCancelId(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось отменить бронь'))
    }
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-white">Брони</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Все заказы зрителей и управление статусами
        </p>
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl border border-line bg-panel p-4 sm:grid-cols-[1fr_200px]">
        <Input
          label="Поиск"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Код билета, email или имя"
        />
        <Select
          label="Статус"
          value={status}
          onChange={(event) => updateParam('status', event.target.value)}
        >
          <option value="">Все статусы</option>
          <option value="paid">Оплачено</option>
          <option value="cancelled">Отменено</option>
        </Select>
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        )}

        {isError && (
          <ErrorState
            message="Не удалось загрузить брони."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && data && data.results.length === 0 && (
          <EmptyState
            icon={Ticket}
            title="Броней не найдено"
            description="Измените фильтр или поисковый запрос."
          />
        )}

        {!isLoading && !isError && data && data.results.length > 0 && (
          <>
            <div className="hidden overflow-x-auto rounded-2xl border border-line lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-panel-soft text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Код</th>
                    <th className="px-4 py-3 font-medium">Покупатель</th>
                    <th className="px-4 py-3 font-medium">Фильм</th>
                    <th className="px-4 py-3 font-medium">Сеанс</th>
                    <th className="px-4 py-3 font-medium">Места</th>
                    <th className="px-4 py-3 font-medium">Сумма</th>
                    <th className="px-4 py-3 font-medium">Статус</th>
                    <th className="px-4 py-3 font-medium">Куплено</th>
                    <th className="px-4 py-3 text-right font-medium">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {data.results.map((booking) => (
                    <tr key={booking.id} className="hover:bg-panel-soft/50">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-accent">
                        {booking.code}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {booking.user_email}
                      </td>
                      <td className="px-4 py-3 font-medium text-white">
                        {booking.session.movie.title}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                        {formatDateTime(booking.session.starts_at)}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {booking.seats_snapshot.length}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-300">
                        {formatPrice(booking.total_price)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={booking.status === 'paid' ? 'success' : 'danger'}
                        >
                          {booking.status_display}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
                        {formatDateTime(booking.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {booking.status === 'paid' && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelId(booking.id)
                              confirm.open()
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="size-3.5" />
                            Отменить
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {data.results.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-line bg-panel p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-accent">
                      {booking.code}
                    </span>
                    <Badge
                      variant={booking.status === 'paid' ? 'success' : 'danger'}
                    >
                      {booking.status_display}
                    </Badge>
                  </div>
                  <p className="mt-2 font-medium text-white">
                    {booking.session.movie.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatDateTime(booking.session.starts_at)} ·{' '}
                    {booking.session.hall.name}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {booking.user_email}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    {booking.seats_snapshot.join(' · ')}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                    <span className="font-semibold text-white">
                      {formatPrice(booking.total_price)}
                    </span>
                    {booking.status === 'paid' && (
                      <button
                        type="button"
                        onClick={() => {
                          setCancelId(booking.id)
                          confirm.open()
                        }}
                        className="text-xs text-red-400"
                      >
                        Отменить бронь
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
        description="Билеты будут аннулированы, а места снова поступят в продажу."
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
