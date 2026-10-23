import { Clapperboard } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="container-page flex min-h-[calc(100dvh-4rem)] items-center justify-center py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to="/movies"
            className="inline-flex items-center gap-2.5 text-xl font-bold"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-black">
              <Clapperboard className="size-5" />
            </span>
            КиноБилет
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">{title}</h1>
          <p className="mt-1.5 text-sm text-zinc-500">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-line bg-panel p-6 shadow-xl shadow-black/20 sm:p-8">
          {children}
        </div>

        <div className="mt-6 text-center text-sm text-zinc-500">{footer}</div>
      </div>
    </div>
  )
}
