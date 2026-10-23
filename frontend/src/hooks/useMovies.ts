import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createMovie,
  deleteMovie,
  getGenres,
  getMovie,
  getMovies,
  updateMovie,
  type MoviePayload,
  type MoviesQuery,
} from '@/api/movies'

export function useMovies(query: MoviesQuery) {
  return useQuery({
    queryKey: ['movies', query],
    queryFn: () => getMovies(query),
    placeholderData: keepPreviousData,
  })
}

export function useMovie(id: number | string | undefined) {
  return useQuery({
    queryKey: ['movies', 'detail', id],
    queryFn: () => getMovie(id as number | string),
    enabled: Boolean(id),
  })
}

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
    staleTime: 1000 * 60 * 30,
  })
}

export function useCreateMovie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: MoviePayload) => createMovie(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['movies'] }),
  })
}

export function useUpdateMovie(id: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: MoviePayload) => updateMovie(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] })
    },
  })
}

export function useDeleteMovie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteMovie(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['movies'] }),
  })
}
