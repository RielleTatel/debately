'use client'

import { useQuery } from '@tanstack/react-query'
import type { DashboardStats } from '@/features/dashboard/types'

export const dashboardKeys = {
  stats: (orgId: string) => ['dashboard', 'stats', orgId] as const,
}

export function useDashboardStats(organizationId: string) {
  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats(organizationId),
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/stats?orgId=${organizationId}`)
      return res.json()
    },
    enabled: !!organizationId,
  })
}
