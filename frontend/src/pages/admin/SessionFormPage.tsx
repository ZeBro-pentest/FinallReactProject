import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button, buttonClass } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Field'
import { PageLoader } from '@/components/ui/Loaders'
import { ErrorState } from '@/components/ui/States'
import { useMovies } from '@/hooks/useMovies'
import {
  useCreateSession,
  useHalls,
  useSession,
  useUpdateSession,
} from '@/hooks/useSessions'
import { toDateTimeInput } from '@/lib/dates'
import { getErrorMessage } from '@/lib/errors'
import { sessionSchema, type SessionFormValues } from '@/schemas/forms'

const defaultValues: SessionFormValues = {
  movie: 0,
  hall: 0,
  starts_at: '',
  base_price: 2500,
  vip_price: 4000,
}

export function SessionFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const sessionQuery = useSession(id)
  const { data: movies } = useMovies({ ordering: 'title', page: 1 })
  const { data: halls } = useHalls()
  const createSession = useCreateSession()
  const updateSession = useUpdateSession(id ?? 0)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!sessionQuery.data) {
      return
    }
    reset({
      movie: sessionQuery.data.movie.id,
      hall: sessionQuery.data.hall.id,
      starts_at: toDateTimeInput(sessionQuery.data.starts_at),
      base_price: sessionQuery.data.base_price,
      vip_price: sessionQuery.data.vip_price,
    })
  }, [sessionQuery.data, reset])

  const onSubmit = async (values: SessionFormValues) => {
    setServerError('')
    const payload = {
      movie: Number(values.movie),
      hall: Number(values.hall),
      starts_at: new Date(values.starts_at).toISOString(),
      base_price: Number(values.base_price),
      vip_price: Number(values.vip_price),
    }
    try {
      if (isEdit) {
        await updateSession.mutateAsync(payload)
        toast.success('Сеанс обновлён')
      } else {
        await createSession.mutateAsync(payload)
        toast.success('Сеанс добавлен')
      }
      navigate('/admin/sessions')
    } catch (error) {
      const message = getErrorMessage(error, 'Не удалось сохранить сеанс')
      setServerError(message)
      toast.error(message)
    }
  }

  if (isEdit && sessionQuery.isLoading) {
    return <PageLoader />
  }

  if (isEdit && (sessionQuery.isError || !sessionQuery.data)) {
    return (
      <ErrorState
        message="Сеанс не найден."
        onRetry={() => sessionQuery.refetch()}
      />
    )
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/admin/sessions"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-accent"
      >
        <ArrowLeft className="size-4" />
        К списку сеансов
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-white">
        {isEdit ? 'Редактирование сеанса' : 'Новый сеанс'}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-4 rounded-2xl border border-line bg-panel p-5"
        noValidate
      >
        <Select
          label="Фильм"
          error={errors.movie?.message}
          {...register('movie', { valueAsNumber: true })}
        >
          <option value={0}>Выберите фильм</option>
          {(movies?.results ?? []).map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title}
            </option>
          ))}
        </Select>

        <Select label="Зал" error={errors.hall?.message} {...register('hall', { valueAsNumber: true })}>
          <option value={0}>Выберите зал</option>
          {(halls ?? []).map((hall) => (
            <option key={hall.id} value={hall.id}>
              {hall.name} · {hall.capacity} мест
            </option>
          ))}
        </Select>

        <Input
          label="Дата и время начала"
          type="datetime-local"
          error={errors.starts_at?.message}
          {...register('starts_at')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Цена обычного места, ₸"
            type="number"
            min={0}
            error={errors.base_price?.message}
            {...register('base_price', { valueAsNumber: true })}
          />
          <Input
            label="Цена VIP-места, ₸"
            type="number"
            min={0}
            error={errors.vip_price?.message}
            {...register('vip_price', { valueAsNumber: true })}
          />
        </div>

        {serverError && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {serverError}
          </p>
        )}

        <div className="flex gap-3 border-t border-line pt-4">
          <Button
            type="submit"
            loading={createSession.isPending || updateSession.isPending}
          >
            <Save className="size-4" />
            {isEdit ? 'Сохранить' : 'Добавить сеанс'}
          </Button>
          <Link to="/admin/sessions" className={buttonClass('secondary')}>
            Отмена
          </Link>
        </div>
      </form>
    </div>
  )
}
