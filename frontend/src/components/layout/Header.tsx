import {
  Clapperboard,
  LayoutDashboard,
  LogOut,
  Menu,
  Ticket,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { Button, ButtonLink } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeMobileMenu, toggleMobileMenu } from '@/store/uiSlice'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-accent/10 text-accent'
      : 'text-zinc-400 hover:bg-panel-soft hover:text-white',
  )

export function Header() {
  const { user, isAdmin, logout } = useAuth()
  const dispatch = useAppDispatch()
  const menuOpen = useAppSelector((state) => state.ui.mobileMenuOpen)
  const location = useLocation()

  useEffect(() => {
    dispatch(closeMobileMenu())
  }, [location.pathname, dispatch])

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/movies" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-black">
            <Clapperboard className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            КиноБилет
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/movies" className={navLinkClass}>
            Афиша
          </NavLink>
          {user && (
            <NavLink to="/my/tickets" className={navLinkClass}>
              Мои билеты
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              <span className="inline-flex items-center gap-1.5">
                <LayoutDashboard className="size-4" />
                Админка
              </span>
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <UserRound className="size-4" />
                <span className="max-w-40 truncate">{user.full_name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="size-4" />
                Выйти
              </Button>
            </>
          ) : (
            <>
              <ButtonLink to="/login" variant="ghost" size="sm">
                Войти
              </ButtonLink>
              <ButtonLink to="/register" size="sm">
                Регистрация
              </ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-zinc-300 hover:bg-panel-soft md:hidden"
          onClick={() => dispatch(toggleMobileMenu())}
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-panel px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            <NavLink to="/movies" className={navLinkClass}>
              Афиша
            </NavLink>
            {user && (
              <NavLink to="/my/tickets" className={navLinkClass}>
                Мои билеты
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                Админка
              </NavLink>
            )}
          </nav>

          <div className="mt-4 border-t border-line pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <UserRound className="size-4" />
                  <span>{user.full_name}</span>
                  <span className="text-xs text-zinc-600">({user.role})</span>
                </div>
                <Button variant="secondary" size="sm" onClick={logout}>
                  <LogOut className="size-4" />
                  Выйти
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <ButtonLink to="/login" variant="secondary" size="sm">
                  Войти
                </ButtonLink>
                <ButtonLink to="/register" size="sm">
                  Регистрация
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line py-8">
      <div className="container-page flex flex-col items-center justify-between gap-2 text-sm text-zinc-600 sm:flex-row">
        <p className="flex items-center gap-2">
          <Ticket className="size-4" />
          КиноБилет — финальный проект по React
        </p>
        <p>Django REST + React + TypeScript</p>
      </div>
    </footer>
  )
}
