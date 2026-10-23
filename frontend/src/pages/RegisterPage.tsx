import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthShell } from '@/features/auth/AuthShell'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/errors'
import { registerSchema, type RegisterFormValues } from '@/schemas/auth'

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError('')
    try {
      await registerUser({
        email: values.email,
        full_name: values.full_name,
        phone: values.phone,
        password: values.password,
      })
      toast.success('Аккаунт создан. Добро пожаловать!')
      navigate('/movies', { replace: true })
    } catch (error) {
      const message = getErrorMessage(error, 'Не удалось зарегистрироваться')
      setServerError(message)
      toast.error(message)
    }
  }

  return (
    <AuthShell
      title="Регистрация"
      subtitle="Создайте аккаунт зрителя, чтобы бронировать места"
      footer={
        <>
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Войти
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Имя и фамилия"
          autoComplete="name"
          placeholder="Алия Смагулова"
          error={errors.full_name?.message}
          {...register('full_name')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Телефон"
          autoComplete="tel"
          placeholder="+7 700 000 00 00"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Пароль"
          type="password"
          autoComplete="new-password"
          placeholder="Минимум 6 символов"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Повторите пароль"
          type="password"
          autoComplete="new-password"
          placeholder="Ещё раз"
          error={errors.confirm_password?.message}
          {...register('confirm_password')}
        />

        {serverError && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Зарегистрироваться
        </Button>
      </form>
    </AuthShell>
  )
}
