import { Clapperboard, Database, Layers, ShieldCheck } from 'lucide-react'

const stack = [
  'React 19 + TypeScript',
  'Vite + Tailwind CSS',
  'React Router + Redux Toolkit',
  'TanStack Query + Axios',
  'React Hook Form + Zod',
  'Recharts + Sonner',
  'Django REST Framework',
]

function App() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <section className="w-full max-w-2xl rounded-3xl border border-line bg-panel p-8 shadow-2xl shadow-black/40 sm:p-10">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl bg-accent text-surface">
            <Clapperboard className="size-7" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium tracking-widest text-accent uppercase">
              Финальный проект
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              КиноБилет
            </h1>
          </div>
        </div>

        <p className="mt-6 text-base leading-relaxed text-zinc-400">
          Сервис бронирования билетов в кино: афиша, выбор сеанса и мест,
          электронные билеты, админ-панель с аналитикой. Каркас проекта готов —
          дальше авторизация и основные страницы.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel-soft p-4">
            <Layers className="size-5 text-accent" aria-hidden="true" />
            <span className="text-sm text-zinc-300">Frontend + Backend</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel-soft p-4">
            <ShieldCheck className="size-5 text-accent" aria-hidden="true" />
            <span className="text-sm text-zinc-300">JWT и роли</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel-soft p-4">
            <Database className="size-5 text-accent" aria-hidden="true" />
            <span className="text-sm text-zinc-300">Django + SQLite</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel-soft p-4">
            <Clapperboard className="size-5 text-accent" aria-hidden="true" />
            <span className="text-sm text-zinc-300">2 роли, 3+ графика</span>
          </div>
        </div>

        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Технологии">
          {stack.map((item) => (
            <li
              key={item}
              className="rounded-full border border-line bg-panel-soft px-3 py-1 text-xs text-zinc-400"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
