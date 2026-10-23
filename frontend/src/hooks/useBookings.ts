import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  cancelAdminBooking,
  cancelBooking,
  createBooking,
  getAdminBookings,
  getMyBookings,
  type BookingsQuery,
} from '@/api/bookings'

export function useMyBookings(query: BookingsQuery) {
  return useQuery({
    queryKey: ['bookings', 'my', query],
    queryFn: () => getMyBookings(query),
    placeholderData: keepPreviousData,
  })
}

export function useAdminBookings(query: BookingsQuery) {
  return useQuery({
    queryKey: ['bookings', 'admin', query],
    queryFn: () => getAdminBookings(query),
    placeholderData: keepPreviousData,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useCancelAdminBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelAdminBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
