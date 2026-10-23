import { api } from './client'
import type { Dashboard } from '@/types'

export async function getDashboard(days: number) {
  const { data } = await api.get<Dashboard>('/admin/dashboard/', {
    params: { days },
  })
  return data
}
