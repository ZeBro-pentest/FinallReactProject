import { Film } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { EmptyState, ErrorState } from '@/components/ui/States'
import { Skeleton } from '@/components/ui/Loaders'
import { Pagination } from '@/components/ui/Pagination'
import { MovieCard } from '@/features/movies/MovieCard'
import { MovieFilters } from '@/features/movies/MovieFilters'
import { useDebounce } from '@/hooks/useDebounce'
import { useGenres, useMovies } from '@/hooks/useMovies'
import { getPageFromParams } from '@/lib/utils'

export function MoviesPage() {
  const [params, setParams] = useSearchParams()
  const search = params.get('search') ?? ''
  const genre = params.get('genre') ?? ''
  const age = params.get('age') ?? ''
  const ordering = params.get('ordering') ?? '-release_date'
  const page = getPageFromParams(params)

  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounce(searchInput, 400)
  const { data: genres } = useGenres()

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    if (debouncedSearch === search) {
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
    (key: string, value: string, defaultValue = '') => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value && value !== defaultValue) {
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
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [setParams],
  )

  const query = useMemo(
    () => ({
      search,
      genre,
      age_rating: age,
      ordering,
      page,
    }),
    [search, genre, age, ordering, page],
  )

  const { data, isLoading, isError, refetch } = useMovies(query)

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Афиша</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Выберите фильм, сеанс и места в зале
        </p>
      </div>

      <MovieFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        genre={genre}
        onGenreChange={(value) => updateParam('genre', value)}
        age={age}
        onAgeChange={(value) => updateParam('age', value)}
        ordering={ordering}
        onOrderingChange={(value) => updateParam('ordering', value, '-release_date')}
        genres={genres ?? []}
      />

      <div className="mt-8">
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-2/3 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <ErrorState
            message="Не удалось загрузить афишу. Проверьте подключение к серверу."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && data && data.results.length === 0 && (
          <EmptyState
            icon={Film}
            title="Фильмы не найдены"
            description="Попробуйте изменить поисковый запрос или сбросить фильтры."
          />
        )}

        {!isLoading && !isError && data && data.results.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {data.results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            <div className="mt-8">
              <Pagination
                page={page}
                count={data.count}
                onChange={changePage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
