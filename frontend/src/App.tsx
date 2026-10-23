import { Clapperboard } from 'lucide-react'
import { useEffect } from 'react'
import { Toaster } from 'sonner'

import { meRequest } from '@/api/auth'
import { clearTokens, getAccessToken } from '@/lib/tokens'
import { AppRoutes } from '@/router'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setGuest, setUser } from '@/store/authSlice'

function App() {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.auth.status)

  useEffect(() => {
    let active = true

    async function bootstrap() {
      if (!getAccessToken()) {
        dispatch(setGuest())
        return
      }

      try {
        const user = await meRequest()
        if (active) {
          dispatch(setUser(user))
        }
      } catch {
        clearTokens()
        if (active) {
          dispatch(setGuest())
        }
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [dispatch])

  if (status === 'loading') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <span className="grid size-14 animate-pulse place-items-center rounded-2xl bg-accent text-black">
          <Clapperboard className="size-7" />
        </span>
        <p className="text-sm text-zinc-500">Загружаем КиноБилет…</p>
      </div>
    )
  }

  return (
    <>
      <AppRoutes />
      <Toaster theme="dark" richColors position="top-right" closeButton />
    </>
  )
}

export default App
