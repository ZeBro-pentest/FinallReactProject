import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthShell } from '@/features/auth/AuthShell'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/errors'
import { loginSchema, type LoginFormValues } from '@/schemas/auth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setServerError('')
    try {
      const user = await login(values.email, values.password)
      toast.success(`Добро пожаловать, ${user.full_name}!`)

      const from = (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from && !from.startsWith('/admin') ? from : '/movies', {
          replace: true,
        })
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Неверный email или пароль')
      setServerError(message)
      toast.error(message)
    }
  }

  const fillDemo = (role: 'admin' | 'viewer') => {
    setValue('email', role === 'admin' ? 'admin@cinema.kz' : 'user@cinema.kz')
    setValue('password', role === 'admin' ? 'Admin123!' : 'User123!')
  }

  return (
    <AuthShell
      title="Вход в аккаунт"
      subtitle="Введите данные, чтобы продолжить покупку билетов"
      footer={
        <>
          Нет аккаунта?{' '}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Пароль"
          type="password"
          autoComplete="current-password"
          placeholder="••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        {serverError && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Войти
        </Button>
      </form>

      <div className="mt-6 border-t border-line pt-4">
        <p className="text-xs text-zinc-500">Тестовые аккаунты:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fillDemo('viewer')}
          >
            Зритель
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fillDemo('admin')}
          >
            Администратор
          </Button>
        </div>
        <p className="mt-2 text-xs text-zinc-600">
          user@cinema.kz / User123! · admin@cinema.kz / Admin123!
        </p>
      </div>
    </AuthShell>
  )
}
