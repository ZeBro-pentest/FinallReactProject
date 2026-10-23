import axios from 'axios'

import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '@/lib/tokens'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isRefreshRequest = original?.url?.includes('/auth/refresh')
    const isAuthRequest =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/register')

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isRefreshRequest ||
      isAuthRequest
    ) {
      return Promise.reject(error)
    }

    const refresh = getRefreshToken()
    if (!refresh) {
      clearTokens()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    original._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${baseURL}/auth/refresh/`, { refresh })
          .then((response) => {
            saveTokens(response.data.access, response.data.refresh)
            return response.data.access as string
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      const access = await refreshPromise
      original.headers.Authorization = `Bearer ${access}`
      return api(original)
    } catch (refreshError) {
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    }
  },
)
