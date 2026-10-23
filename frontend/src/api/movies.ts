import { api } from './client'
import type { Genre, Movie, Paginated } from '@/types'

export interface MoviesQuery {
  search?: string
  genre?: string
  age_rating?: string
  ordering?: string
  page?: number
}

export interface MoviePayload {
  title: string
  description: string
  poster_url: string
  duration_min: number
  age_rating: string
  release_date: string | null
  genre_ids: number[]
  is_active: boolean
}

export async function getMovies(query: MoviesQuery) {
  const { data } = await api.get<Paginated<Movie>>('/movies/', {
    params: {
      search: query.search || undefined,
      genres: query.genre || undefined,
      age_rating: query.age_rating || undefined,
      ordering: query.ordering || undefined,
      page: query.page || undefined,
    },
  })
  return data
}

export async function getMovie(id: number | string) {
  const { data } = await api.get<Movie>(`/movies/${id}/`)
  return data
}

export async function getGenres() {
  const { data } = await api.get<Genre[]>('/genres/')
  return data
}

export async function createMovie(payload: MoviePayload) {
  const { data } = await api.post<Movie>('/movies/', payload)
  return data
}

export async function updateMovie(id: number | string, payload: MoviePayload) {
  const { data } = await api.put<Movie>(`/movies/${id}/`, payload)
  return data
}

export async function deleteMovie(id: number) {
  await api.delete(`/movies/${id}/`)
}
