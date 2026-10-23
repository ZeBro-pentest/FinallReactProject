import axios from 'axios'

export function getErrorMessage(error: unknown, fallback = 'Что-то пошло не так') {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Сервер недоступен. Проверьте, что бэкенд запущен.'
    }

    const data = error.response.data
    if (typeof data === 'string') {
      return data
    }
    if (data && typeof data === 'object') {
      if (typeof data.detail === 'string') {
        return data.detail
      }
      const first = Object.values(data)[0]
      if (Array.isArray(first) && first.length > 0) {
        return String(first[0])
      }
      if (typeof first === 'string') {
        return first
      }
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
