import { api } from './client'
import type { Booking, Paginated } from '@/types'

export interface BookingsQuery {
  status?: string
  search?: string
  page?: number
}

export async function getMyBookings(query: BookingsQuery = {}) {
  const { data } = await api.get<Paginated<Booking>>('/bookings/', {
    params: {
      status: query.status || undefined,
      page: query.page || undefined,
    },
  })
  return data
}

export async function createBooking(payload: {
  session: number
  seat_ids: number[]
}) {
  const { data } = await api.post<Booking>('/bookings/', payload)
  return data
}

export async function cancelBooking(id: number) {
  const { data } = await api.post<Booking>(`/bookings/${id}/cancel/`)
  return data
}

export async function getAdminBookings(query: BookingsQuery = {}) {
  const { data } = await api.get<Paginated<Booking>>('/admin/bookings/', {
    params: {
      status: query.status || undefined,
      search: query.search || undefined,
      page: query.page || undefined,
    },
  })
  return data
}

export async function cancelAdminBooking(id: number) {
  const { data } = await api.post<Booking>(`/admin/bookings/${id}/cancel/`)
  return data
}
