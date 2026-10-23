import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createSession,
  deleteSession,
  getHalls,
  getSession,
  getSessions,
  updateSession,
  type SessionPayload,
  type SessionsQuery,
} from '@/api/sessions'

export function useSessions(query: SessionsQuery) {
  return useQuery({
    queryKey: ['sessions', query],
    queryFn: () => getSessions(query),
    placeholderData: keepPreviousData,
  })
}

export function useSession(id: number | string | undefined) {
  return useQuery({
    queryKey: ['sessions', 'detail', id],
    queryFn: () => getSession(id as number | string),
    enabled: Boolean(id),
  })
}

export function useHalls() {
  return useQuery({
    queryKey: ['halls'],
    queryFn: getHalls,
    staleTime: 1000 * 60 * 30,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SessionPayload) => createSession(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  })
}

export function useUpdateSession(id: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SessionPayload) => updateSession(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteSession(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  })
}
