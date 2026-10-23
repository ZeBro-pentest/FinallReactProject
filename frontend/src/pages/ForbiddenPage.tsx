import { ShieldAlert } from 'lucide-react'

import { ButtonLink } from '@/components/ui/Button'

export function ForbiddenPage() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <ShieldAlert className="size-14 text-red-400" />
      <p className="mt-6 text-5xl font-black text-red-400">403</p>
      <h1 className="mt-2 text-2xl font-bold text-white">Нет доступа</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-500">
        Эта страница доступна только администраторам.
      </p>
      <ButtonLink to="/movies" className="mt-6">
        Вернуться к афише
      </ButtonLink>
    </div>
  )
}
