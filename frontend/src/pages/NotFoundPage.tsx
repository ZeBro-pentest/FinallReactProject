import { Clapperboard } from 'lucide-react'

import { ButtonLink } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <Clapperboard className="size-14 text-zinc-700" />
      <p className="mt-6 text-6xl font-black text-accent">404</p>
      <h1 className="mt-2 text-2xl font-bold text-white">Страница не найдена</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-500">
        Возможно, ссылка устарела или страница была удалена.
      </p>
      <ButtonLink to="/movies" className="mt-6">
        На главную
      </ButtonLink>
    </div>
  )
}
