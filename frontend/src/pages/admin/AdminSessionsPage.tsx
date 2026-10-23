import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Loaders'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useMovies } from '@/hooks/useMovies'
import { useDeleteSession, useSessions } from '@/hooks/useSessions'
import { formatDateTime } from '@/lib/dates'
import { getErrorMessage } from '@/lib/errors'
import { formatPrice, getPageFromParams } from '@/lib/utils'

export function AdminSessionsPage() {
  const [params, setParams] = useSearchParams()
  const movie = params.get('movie') ?? ''
  const date = params.get('date') ?? ''
  const page = getPageFromParams(params)
  const { data: movies } = useMovies({ ordering: 'title', page: 1 })
  const { data, isLoading, isError, refetch } = useSessions({
    movie,
    date,
    page,
  })
  const deleteSession = useDeleteSession()
  const confirm = useDisclosure()
  const [deleteId, setDeleteId] = useState<number | null>(null)

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

  const handleDelete = async () => {
    if (!deleteId) {
      return
    }
    try {
      await deleteSession.mutateAsync(deleteId)
      toast.success('Сеанс удалён')
      confirm.close()
      setDeleteId(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось удалить сеанс'))
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Сеансы</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Расписание показов по залам и фильмам
          </p>
        </div>
        <ButtonLink to="/admin/sessions/new">
          <Plus className="size-4" />
          Добавить сеанс
        </ButtonLink>
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl border border-line bg-panel p-4 sm:grid-cols-2">
        <Select
          label="Фильм"
          value={movie}
          onChange={(event) => updateParam('movie', event.target.value)}
        >
          <option value="">Все фильмы</option>
          {(movies?.results ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </Select>
        <Input
          label="Дата"
          type="date"
          value={date}
          onChange={(event) => updateParam('date', event.target.value)}
        />
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        )}

        {isError && (
          <ErrorState
            message="Не удалось загрузить сеансы."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && data && data.results.length === 0 && (
          <EmptyState
            icon={CalendarDays}
            title="Сеансов нет"
            description="Измените фильтры или добавьте новый сеанс."
            action={
              <ButtonLink to="/admin/sessions/new">
                <Plus className="size-4" />
                Добавить сеанс
              </ButtonLink>
            }
          />
        )}

        {!isLoading && !isError && data && data.results.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-panel-soft text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Фильм</th>
                    <th className="px-4 py-3 font-medium">Зал</th>
                    <th className="px-4 py-3 font-medium">Дата и время</th>
                    <th className="px-4 py-3 font-medium">Цены</th>
                    <th className="px-4 py-3 font-medium">Свободно</th>
                    <th className="px-4 py-3 text-right font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {data.results.map((session) => (
                    <tr key={session.id} className="hover:bg-panel-soft/50">
                      <td className="px-4 py-3 font-medium text-white">
                        {session.movie.title}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {session.hall.name}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {formatDateTime(session.starts_at)}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {formatPrice(session.base_price)} /{' '}
                        {formatPrice(session.vip_price)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={session.tickets_left > 0 ? 'success' : 'danger'}
                        >
                          {session.tickets_left} мест
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/sessions/${session.id}/edit`}
                            className="rounded-lg p-2 text-zinc-400 hover:bg-panel-soft hover:text-accent"
                            aria-label="Редактировать"
                          >
                            <Pencil className="size-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteId(session.id)
                              confirm.open()
                            }}
                            className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                            aria-label="Удалить"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {data.results.map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-line bg-panel p-4"
                >
                  <p className="font-medium text-white">{session.movie.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatDateTime(session.starts_at)} · {session.hall.name}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge>{formatPrice(session.base_price)}</Badge>
                    <Badge variant={session.tickets_left > 0 ? 'success' : 'danger'}>
                      {session.tickets_left} мест
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-line pt-3">
                    <Link
                      to={`/admin/sessions/${session.id}/edit`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line py-2 text-xs text-zinc-300"
                    >
                      <Pencil className="size-3.5" />
                      Изменить
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteId(session.id)
                        confirm.open()
                      }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-500/30 py-2 text-xs text-red-400"
                    >
                      <Trash2 className="size-3.5" />
                      Удалить
                    </button>
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
        title="Удалить сеанс?"
        description="Сеанс и все связанные брони будут удалены. Действие нельзя отменить."
        loading={deleteSession.isPending}
        onConfirm={handleDelete}
        onClose={() => {
          confirm.close()
          setDeleteId(null)
        }}
      />
    </div>
  )
}
