'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const tournamentKeys = {
  all: (orgId: string) => ['tournaments', orgId] as const,
  detail: (id: string) => ['tournaments', 'detail', id] as const,
}

export function useTournaments(organizationId: string) {
  return useQuery({
    queryKey: tournamentKeys.all(organizationId),
    queryFn: async () => {
      const res = await fetch(`/api/tournaments?orgId=${organizationId}`)
      return res.json()
    },
    enabled: !!organizationId,
  })
}
