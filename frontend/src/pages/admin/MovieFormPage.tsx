import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button, buttonClass } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, Textarea } from '@/components/ui/Field'
import { PageLoader } from '@/components/ui/Loaders'
import { ErrorState } from '@/components/ui/States'
import {
  useCreateMovie,
  useGenres,
  useMovie,
  useUpdateMovie,
} from '@/hooks/useMovies'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'
import { movieSchema, type MovieFormValues } from '@/schemas/forms'

const defaultValues: MovieFormValues = {
  title: '',
  description: '',
  poster_url: '',
  duration_min: 90,
  age_rating: '12+',
  release_date: '',
  genre_ids: [],
  is_active: true,
}

const fallbackPoster =
  'https://placehold.co/300x450/14141b/f5a524?text=%D0%9F%D0%BE%D1%81%D1%82%D0%B5%D1%80'

export function MovieFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const movieQuery = useMovie(id)
  const { data: genres } = useGenres()
  const createMovie = useCreateMovie()
  const updateMovie = useUpdateMovie(id ?? 0)
  const [serverError, setServerError] = useState('')

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues,
  })

  const posterUrl = watch('poster_url')

  useEffect(() => {
    if (!movieQuery.data) {
      return
    }
    reset({
      title: movieQuery.data.title,
      description: movieQuery.data.description,
      poster_url: movieQuery.data.poster_url,
      duration_min: movieQuery.data.duration_min,
      age_rating: movieQuery.data.age_rating,
      release_date: movieQuery.data.release_date ?? '',
      genre_ids: movieQuery.data.genres.map((genre) => genre.id),
      is_active: movieQuery.data.is_active,
    })
  }, [movieQuery.data, reset])

  const onSubmit = async (values: MovieFormValues) => {
    setServerError('')
    const payload = {
      ...values,
      release_date: values.release_date || null,
    }
    try {
      if (isEdit) {
        await updateMovie.mutateAsync(payload)
        toast.success('Фильм обновлён')
      } else {
        await createMovie.mutateAsync(payload)
        toast.success('Фильм добавлен')
      }
      navigate('/admin/movies')
    } catch (error) {
      const message = getErrorMessage(error, 'Не удалось сохранить фильм')
      setServerError(message)
      toast.error(message)
    }
  }

  if (isEdit && movieQuery.isLoading) {
    return <PageLoader />
  }

  if (isEdit && (movieQuery.isError || !movieQuery.data)) {
    return (
      <ErrorState
        message="Фильм не найден."
        onRetry={() => movieQuery.refetch()}
      />
    )
  }

  return (
    <div className="max-w-3xl">
      <Link
        to="/admin/movies"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-accent"
      >
        <ArrowLeft className="size-4" />
        К списку фильмов
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-white">
        {isEdit ? 'Редактирование фильма' : 'Новый фильм'}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 grid gap-6 md:grid-cols-[1fr_220px]"
        noValidate
      >
        <div className="space-y-4 rounded-2xl border border-line bg-panel p-5">
          <Input
            label="Название"
            placeholder="Дюна: Часть вторая"
            error={errors.title?.message}
            {...register('title')}
          />
          <Textarea
            label="Описание"
            rows={5}
            placeholder="Короткое описание фильма"
            error={errors.description?.message}
            {...register('description')}
          />
          <Input
            label="Ссылка на постер"
            placeholder="https://..."
            error={errors.poster_url?.message}
            {...register('poster_url')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Длительность, мин"
              type="number"
              min={1}
              error={errors.duration_min?.message}
              {...register('duration_min', { valueAsNumber: true })}
            />
            <Select
              label="Возрастной рейтинг"
              error={errors.age_rating?.message}
              {...register('age_rating')}
            >
              <option value="0+">0+</option>
              <option value="6+">6+</option>
              <option value="12+">12+</option>
              <option value="16+">16+</option>
              <option value="18+">18+</option>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Дата релиза"
              type="date"
              error={errors.release_date?.message}
              {...register('release_date')}
            />
            <label className="flex items-end gap-2 pb-2.5 text-sm text-zinc-300">
              <input
                type="checkbox"
                className="size-4 accent-amber-500"
                {...register('is_active')}
              />
              В прокате
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-300">Жанры</p>
            <Controller
              control={control}
              name="genre_ids"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {(genres ?? []).map((genre) => {
                    const active = field.value.includes(genre.id)
                    return (
                      <button
                        key={genre.id}
                        type="button"
                        onClick={() =>
                          field.onChange(
                            active
                              ? field.value.filter((item) => item !== genre.id)
                              : [...field.value, genre.id],
                          )
                        }
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                          active
                            ? 'border-accent bg-accent/15 text-accent'
                            : 'border-line text-zinc-400 hover:border-accent/50',
                        )}
                      >
                        {genre.name}
                      </button>
                    )
                  })}
                </div>
              )}
            />
            {errors.genre_ids && (
              <p className="mt-1 text-xs text-red-400">
                {errors.genre_ids.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {serverError}
            </p>
          )}

          <div className="flex gap-3 border-t border-line pt-4">
            <Button
              type="submit"
              loading={createMovie.isPending || updateMovie.isPending}
            >
              <Save className="size-4" />
              {isEdit ? 'Сохранить' : 'Добавить фильм'}
            </Button>
            <Link
              to="/admin/movies"
              className={buttonClass('secondary')}
            >
              Отмена
            </Link>
          </div>
        </div>

        <aside>
          <p className="mb-2 text-sm font-medium text-zinc-400">Превью постера</p>
          <img
            src={posterUrl || fallbackPoster}
            alt="Превью постера"
            className="aspect-2/3 w-full rounded-2xl border border-line object-cover"
            onError={(event) => {
              event.currentTarget.src = fallbackPoster
            }}
          />
        </aside>
      </form>
    </div>
  )
}
