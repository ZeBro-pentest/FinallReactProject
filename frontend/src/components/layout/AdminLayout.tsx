import {
  CalendarDays,
  Clapperboard,
  Film,
  LayoutDashboard,
  LogOut,
  Menu,
  Ticket,
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeAdminSidebar, toggleAdminSidebar } from '@/store/uiSlice'

const items = [
  { to: '/admin', label: 'Дашборд', icon: LayoutDashboard, end: true },
  { to: '/admin/movies', label: 'Фильмы', icon: Film, end: false },
  { to: '/admin/sessions', label: 'Сеансы', icon: CalendarDays, end: false },
  { to: '/admin/bookings', label: 'Брони', icon: Ticket, end: false },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-accent/10 text-accent'
      : 'text-zinc-400 hover:bg-panel-soft hover:text-white',
  )

function SidebarContent() {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-2.5 px-2 py-1">
        <span className="grid size-9 place-items-center rounded-xl bg-accent text-black">
          <Clapperboard className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-white">КиноБилет</p>
          <p className="text-xs text-zinc-500">Админ-панель</p>
        </div>
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
            <item.icon className="size-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-line pt-4">
        <div className="px-3 pb-2">
          <p className="truncate text-sm text-zinc-300">{user?.full_name}</p>
          <p className="truncate text-xs text-zinc-600">{user?.email}</p>
        </div>
        <Link
          to="/movies"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-panel-soft hover:text-white"
        >
          <Clapperboard className="size-4.5" />
          На сайт
        </Link>
        <Button variant="ghost" className="w-full justify-start px-3" onClick={logout}>
          <LogOut className="size-4" />
          Выйти
        </Button>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const dispatch = useAppDispatch()
  const sidebarOpen = useAppSelector((state) => state.ui.adminSidebarOpen)

  return (
    <div className="min-h-dvh bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-panel p-4 lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur lg:justify-end">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => dispatch(toggleAdminSidebar())}
              className="rounded-lg p-2 text-zinc-300 hover:bg-panel-soft"
              aria-label="Открыть меню"
            >
              <Menu className="size-6" />
            </button>
            <span className="text-sm font-semibold text-white">Админ-панель</span>
          </div>
          <Link to="/movies" className="text-sm text-zinc-400 hover:text-accent">
            Перейти на сайт →
          </Link>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => dispatch(closeAdminSidebar())}
            role="presentation"
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-line bg-panel p-4">
            <button
              type="button"
              onClick={() => dispatch(closeAdminSidebar())}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-400 hover:bg-panel-soft"
              aria-label="Закрыть меню"
            >
              <X className="size-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </div>
  )
}
