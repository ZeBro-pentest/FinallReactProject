import { Film, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Loaders'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useDebounce } from '@/hooks/useDebounce'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useDeleteMovie, useMovies } from '@/hooks/useMovies'
import { getErrorMessage } from '@/lib/errors'
import { formatDuration, getPageFromParams } from '@/lib/utils'

const fallbackPoster =
  'https://placehold.co/80x120/14141b/f5a524?text=%D0%9A'

export function AdminMoviesPage() {
  const [params, setParams] = useSearchParams()
  const search = params.get('search') ?? ''
  const page = getPageFromParams(params)
  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounce(searchInput, 400)
  const { data, isLoading, isError, refetch } = useMovies({
    search,
    page,
  })
  const deleteMovie = useDeleteMovie()
  const confirm = useDisclosure()
  const [deleteId, setDeleteId] = useState<number | null>(null)

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
      await deleteMovie.mutateAsync(deleteId)
      toast.success('Фильм удалён')
      confirm.close()
      setDeleteId(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось удалить фильм'))
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Фильмы</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Добавление, редактирование и удаление фильмов
          </p>
        </div>
        <ButtonLink to="/admin/movies/new">
          <Plus className="size-4" />
          Добавить фильм
        </ButtonLink>
      </div>

      <div className="relative mt-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Поиск по названию"
          className="pl-9"
          aria-label="Поиск фильмов"
        />
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        )}

        {isError && (
          <ErrorState
            message="Не удалось загрузить фильмы."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && data && data.results.length === 0 && (
          <EmptyState
            icon={Film}
            title="Фильмов нет"
            description="Добавьте первый фильм в афишу."
            action={
              <ButtonLink to="/admin/movies/new">
                <Plus className="size-4" />
                Добавить фильм
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
                    <th className="px-4 py-3 font-medium">Жанры</th>
                    <th className="px-4 py-3 font-medium">Рейтинг</th>
                    <th className="px-4 py-3 font-medium">Длительность</th>
                    <th className="px-4 py-3 font-medium">Статус</th>
                    <th className="px-4 py-3 text-right font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel">
                  {data.results.map((movie) => (
                    <tr key={movie.id} className="hover:bg-panel-soft/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={movie.poster_url || fallbackPoster}
                            alt=""
                            className="h-14 w-10 rounded object-cover"
                            onError={(event) => {
                              event.currentTarget.src = fallbackPoster
                            }}
                          />
                          <span className="font-medium text-white">
                            {movie.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {movie.genres.map((genre) => genre.name).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{movie.age_rating}</td>
                      <td className="px-4 py-3 text-zinc-400">
                        {formatDuration(movie.duration_min)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={movie.is_active ? 'success' : 'muted'}>
                          {movie.is_active ? 'В прокате' : 'Скрыт'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/movies/${movie.id}/edit`}
                            className="rounded-lg p-2 text-zinc-400 hover:bg-panel-soft hover:text-accent"
                            aria-label="Редактировать"
                          >
                            <Pencil className="size-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteId(movie.id)
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
              {data.results.map((movie) => (
                <div
                  key={movie.id}
                  className="rounded-2xl border border-line bg-panel p-4"
                >
                  <div className="flex gap-3">
                    <img
                      src={movie.poster_url || fallbackPoster}
                      alt=""
                      className="h-20 w-14 rounded object-cover"
                      onError={(event) => {
                        event.currentTarget.src = fallbackPoster
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">{movie.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {movie.genres.map((genre) => genre.name).join(', ') || '—'}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge>{movie.age_rating}</Badge>
                        <Badge variant={movie.is_active ? 'success' : 'muted'}>
                          {movie.is_active ? 'В прокате' : 'Скрыт'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-line pt-3">
                    <Link
                      to={`/admin/movies/${movie.id}/edit`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line py-2 text-xs text-zinc-300"
                    >
                      <Pencil className="size-3.5" />
                      Изменить
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteId(movie.id)
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
        title="Удалить фильм?"
        description="Фильм и его сеансы будут удалены. Действие нельзя отменить."
        loading={deleteMovie.isPending}
        onConfirm={handleDelete}
        onClose={() => {
          confirm.close()
          setDeleteId(null)
        }}
      />
    </div>
  )
}
