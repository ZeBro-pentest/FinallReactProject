import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  loginRequest,
  logoutRequest,
  registerRequest,
  type RegisterPayload,
} from '@/api/auth'
import { clearTokens, getRefreshToken, saveTokens } from '@/lib/tokens'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setGuest, setUser } from '@/store/authSlice'
import { clearBooking } from '@/store/bookingSlice'

export function useAuth() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAppSelector((state) => state.auth.user)
  const status = useAppSelector((state) => state.auth.status)

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginRequest(email, password)
      saveTokens(data.access, data.refresh)
      dispatch(setUser(data.user))
      return data.user
    },
    [dispatch],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const data = await registerRequest(payload)
      saveTokens(data.access, data.refresh)
      dispatch(setUser(data.user))
      return data.user
    },
    [dispatch],
  )

  const logout = useCallback(async () => {
    const refresh = getRefreshToken()
    try {
      if (refresh) {
        await logoutRequest(refresh)
      }
    } catch {
      // Токен мог уже истечь — всё равно выходим.
    } finally {
      clearTokens()
      dispatch(setGuest())
      dispatch(clearBooking())
      queryClient.clear()
      navigate('/login')
    }
  }, [dispatch, navigate, queryClient])

  return {
    user,
    status,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  }
}
