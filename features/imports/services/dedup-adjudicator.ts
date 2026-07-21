import { prisma } from '@/lib/prisma'
import type { Adjudicator } from '@prisma/client'

export async function matchAdjudicator(tournamentId: string, email: string | null): Promise<Adjudicator | null> {
  if (!email) return null
  return prisma.adjudicator.findFirst({ where: { tournamentId, email } })
}
