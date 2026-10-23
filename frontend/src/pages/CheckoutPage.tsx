import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CreditCard, Lock } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button, ButtonLink } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/States'
import { useCreateBooking } from '@/hooks/useBookings'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/errors'
import { formatDateTime } from '@/lib/dates'
import { formatPrice } from '@/lib/utils'
import { checkoutSchema, type CheckoutFormValues } from '@/schemas/forms'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearBooking } from '@/store/bookingSlice'

export function CheckoutPage() {
  const session = useAppSelector((state) => state.booking.session)
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats)
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const createBooking = useCreateBooking()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      full_name: user?.full_name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      card_number: '',
      expiry: '',
      cvv: '',
    },
  })

  const total =
    session && selectedSeats.length > 0
      ? selectedSeats.reduce(
          (sum, seat) =>
            sum + (seat.is_vip ? session.vip_price : session.base_price),
          0,
        )
      : 0

  if (!session || selectedSeats.length === 0) {
    return (
      <div className="container-page py-8">
        <EmptyState
          title="Нет выбранных мест"
          description="Сначала выберите сеанс и места на схеме зала."
          action={<ButtonLink to="/movies">Перейти к афише</ButtonLink>}
        />
      </div>
    )
  }

  const onSubmit = async () => {
    setServerError('')
    try {
      const booking = await createBooking.mutateAsync({
        session: session.id,
        seat_ids: selectedSeats.map((seat) => seat.id),
      })
      dispatch(clearBooking())
      toast.success(`Билет ${booking.code} оформлен!`)
      navigate('/my/tickets', { replace: true })
    } catch (error) {
      const message = getErrorMessage(error, 'Не удалось оформить бронь')
      setServerError(message)
      toast.error(message)
    }
  }

  return (
    <div className="container-page py-8">
      <Link
        to={`/sessions/${session.id}/seats`}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-accent"
      >
        <ArrowLeft className="size-4" />
        Назад к выбору мест
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
        Оформление заказа
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-line bg-panel p-5 sm:p-6"
          noValidate
        >
          <h2 className="text-lg font-semibold text-white">Данные покупателя</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Имя и фамилия"
              error={errors.full_name?.message}
              {...register('full_name')}
            />
            <Input
              label="Телефон"
              placeholder="+7 700 000 00 00"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Email"
              type="email"
              className="sm:col-span-2"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <h2 className="mt-8 flex items-center gap-2 text-lg font-semibold text-white">
            <CreditCard className="size-5 text-accent" />
            Оплата картой
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Демонстрационная оплата — реальные деньги не списываются.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Номер карты"
              placeholder="0000 0000 0000 0000"
              inputMode="numeric"
              className="sm:col-span-2"
              error={errors.card_number?.message}
              {...register('card_number')}
            />
            <Input
              label="Срок действия"
              placeholder="ММ/ГГ"
              error={errors.expiry?.message}
              {...register('expiry')}
            />
            <Input
              label="CVV"
              placeholder="123"
              type="password"
              inputMode="numeric"
              maxLength={3}
              error={errors.cvv?.message}
              {...register('cvv')}
            />
          </div>

          {serverError && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            className="mt-6 w-full"
            loading={createBooking.isPending}
          >
            <Lock className="size-4" />
            Оплатить {formatPrice(total)}
          </Button>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="text-lg font-semibold text-white">Заказ</h2>
            <p className="mt-3 font-medium text-zinc-200">{session.movie.title}</p>
            <p className="mt-1 text-sm text-zinc-500">
              {formatDateTime(session.starts_at)}
            </p>
            <p className="text-sm text-zinc-500">{session.hall.name}</p>

            <ul className="mt-4 space-y-2 border-t border-line pt-4">
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

            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm text-zinc-400">Итого</span>
              <span className="text-xl font-bold text-white">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
