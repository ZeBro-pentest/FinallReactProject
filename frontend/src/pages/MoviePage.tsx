import { ArrowLeft, CalendarDays, Clock, MapPin, Ticket } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loaders'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useMovie } from '@/hooks/useMovies'
import { useSessions } from '@/hooks/useSessions'
import { formatDayLabel, formatSessionTime } from '@/lib/dates'
import { formatDuration, formatPrice } from '@/lib/utils'
import type { Session } from '@/types'

const fallbackPoster =
  'https://placehold.co/400x600/14141b/f5a524?text=%D0%9A%D0%B8%D0%BD%D0%BE'

export function MoviePage() {
  const { id } = useParams()
  const movieQuery = useMovie(id)
  const sessionsQuery = useSessions({ movie: id, pageSize: 100 })

  const groupedSessions = useMemo(() => {
    const groups = new Map<string, Session[]>()
    for (const session of sessionsQuery.data?.results ?? []) {
      const key = session.starts_at.slice(0, 10)
      const list = groups.get(key) ?? []
      list.push(session)
      groups.set(key, list)
    }
    return [...groups.entries()]
  }, [sessionsQuery.data])

  if (movieQuery.isLoading) {
    return (
      <div className="container-page py-8">
        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <Skeleton className="aspect-2/3 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (movieQuery.isError || !movieQuery.data) {
    return (
      <div className="container-page py-8">
        <ErrorState
          message="Фильм не найден или сервер недоступен."
          onRetry={() => movieQuery.refetch()}
        />
      </div>
    )
  }

  const movie = movieQuery.data

  return (
    <div className="container-page py-8">
      <Link
        to="/movies"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-accent"
      >
        <ArrowLeft className="size-4" />
        Назад к афише
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[280px_1fr]">
        <img
          src={movie.poster_url || fallbackPoster}
          alt={`Постер фильма «${movie.title}»`}
          className="mx-auto aspect-2/3 w-full max-w-[280px] rounded-2xl border border-line object-cover"
          onError={(event) => {
            event.currentTarget.src = fallbackPoster
          }}
        />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{movie.age_rating}</Badge>
            {movie.genres.map((genre) => (
              <Badge key={genre.id}>{genre.name}</Badge>
            ))}
          </div>

          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            {movie.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {formatDuration(movie.duration_min)}
            </span>
            {movie.release_date && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {new Date(movie.release_date).getFullYear()}
              </span>
            )}
          </div>

          <p className="mt-5 max-w-2xl leading-relaxed text-zinc-400">
            {movie.description}
          </p>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white">Сеансы</h2>

            {sessionsQuery.isLoading && (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}

            {sessionsQuery.isError && (
              <div className="mt-4">
                <ErrorState
                  message="Не удалось загрузить сеансы."
                  onRetry={() => sessionsQuery.refetch()}
                />
              </div>
            )}

            {!sessionsQuery.isLoading &&
              !sessionsQuery.isError &&
              groupedSessions.length === 0 && (
                <div className="mt-4">
                  <EmptyState
                    icon={Ticket}
                    title="Сеансов пока нет"
                    description="Для этого фильма ещё не назначены сеансы. Загляните позже."
                  />
                </div>
              )}

            <div className="mt-4 space-y-6">
              {groupedSessions.map(([day, sessions]) => (
                <div key={day}>
                  <h3 className="mb-3 text-sm font-medium text-zinc-400">
                    {formatDayLabel(day)}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {sessions.map((session) => (
                      <Link
                        key={session.id}
                        to={`/sessions/${session.id}/seats`}
                        className="rounded-xl border border-line bg-panel p-3 transition hover:border-accent/60 hover:bg-panel-soft"
                      >
                        <div className="flex items-baseline justify-between">
                          <span className="text-lg font-bold text-white">
                            {formatSessionTime(session.starts_at)}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {formatPrice(session.base_price)}
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                          <MapPin className="size-3" />
                          {session.hall.name}
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          Осталось {session.tickets_left} мест
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
