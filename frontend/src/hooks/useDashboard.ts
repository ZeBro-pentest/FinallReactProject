import { useQuery } from '@tanstack/react-query'

import { getDashboard } from '@/api/dashboard'

export function useDashboard(days: number) {
  return useQuery({
    queryKey: ['dashboard', days],
    queryFn: () => getDashboard(days),
  })
}
