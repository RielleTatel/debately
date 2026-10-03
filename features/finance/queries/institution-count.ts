import { cache } from 'react'
import { prisma } from '@/lib/prisma'

// Shared only within this Server Component render; never cached across sessions.
export const getFinanceInstitutionCount = cache(async (tournamentId: string) =>
  prisma.tournamentInstitution.count({ where: { tournamentId } }),
)
