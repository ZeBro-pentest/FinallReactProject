import { api } from './client'
import type { AuthResponse, User } from '@/types'

export interface RegisterPayload {
  email: string
  full_name: string
  phone?: string
  password: string
}

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<AuthResponse>('/auth/login/', { email, password })
  return data
}

export async function registerRequest(payload: RegisterPayload) {
  const { data } = await api.post<AuthResponse>('/auth/register/', payload)
  return data
}

export async function meRequest() {
  const { data } = await api.get<User>('/auth/me/')
  return data
}

export async function logoutRequest(refresh: string) {
  await api.post('/auth/logout/', { refresh })
}
