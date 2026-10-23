import { api } from './client'
import type { Hall, Paginated, Session, SessionDetail } from '@/types'

export interface SessionsQuery {
  movie?: string
  date?: string
  page?: number
  pageSize?: number
}

export interface SessionPayload {
  movie: number
  hall: number
  starts_at: string
  base_price: number
  vip_price: number
}

export async function getSessions(query: SessionsQuery = {}) {
  const { data } = await api.get<Paginated<Session>>('/sessions/', {
    params: {
      movie: query.movie || undefined,
      date: query.date || undefined,
      page: query.page || undefined,
      page_size: query.pageSize || undefined,
    },
  })
  return data
}

export async function getSession(id: number | string) {
  const { data } = await api.get<SessionDetail>(`/sessions/${id}/`)
  return data
}

export async function getHalls() {
  const { data } = await api.get<Hall[]>('/halls/')
  return data
}

export async function createSession(payload: SessionPayload) {
  const { data } = await api.post<Session>('/sessions/', payload)
  return data
}

export async function updateSession(id: number | string, payload: SessionPayload) {
  const { data } = await api.put<Session>(`/sessions/${id}/`, payload)
  return data
}

export async function deleteSession(id: number) {
  await api.delete(`/sessions/${id}/`)
}
