import { LogOut, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'

export function ProfilePage() {
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className="container-page max-w-2xl py-8">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Профиль</h1>
      <p className="mt-1 text-sm text-zinc-500">Данные вашего аккаунта</p>

      <Card className="mt-6">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl bg-accent/15 text-accent">
            <UserRound className="size-7" />
          </span>
          <div>
            <p className="text-lg font-semibold text-white">{user.full_name}</p>
            <Badge variant={user.role === 'admin' ? 'accent' : 'muted'}>
              {user.role === 'admin' ? 'Администратор' : 'Зритель'}
            </Badge>
          </div>
        </div>

        <dl className="mt-6 space-y-4 border-t border-line pt-6">
          <div className="flex items-center gap-3">
            <Mail className="size-4 text-zinc-500" />
            <dt className="w-20 text-sm text-zinc-500">Email</dt>
            <dd className="text-sm text-zinc-200">{user.email}</dd>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="size-4 text-zinc-500" />
            <dt className="w-20 text-sm text-zinc-500">Телефон</dt>
            <dd className="text-sm text-zinc-200">{user.phone || 'Не указан'}</dd>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-4 text-zinc-500" />
            <dt className="w-20 text-sm text-zinc-500">Роль</dt>
            <dd className="text-sm text-zinc-200">{user.role}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/my/tickets" variant="secondary">
            Мои билеты
          </ButtonLink>
          {user.role === 'admin' && (
            <ButtonLink to="/admin" variant="secondary">
              Админ-панель
            </ButtonLink>
          )}
          <Button variant="ghost" onClick={logout}>
            <LogOut className="size-4" />
            Выйти
          </Button>
        </div>
      </Card>
    </div>
  )
}
