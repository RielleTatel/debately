import { distance } from 'fastest-levenshtein'
import { prisma } from '@/lib/prisma'
import type { Participant } from '@prisma/client'

const FUZZY = 2

export async function matchParticipant(
  tournamentInstitutionId: string,
  displayName: string,
  email: string | null,
): Promise<{ match: Participant; reason: 'email' | 'fuzzy' } | null> {
  if (email) {
    const byEmail = await prisma.participant.findFirst({ where: { tournamentInstitutionId, email } })
    if (byEmail) return { match: byEmail, reason: 'email' }
  }
  const roster = await prisma.participant.findMany({ where: { tournamentInstitutionId } })
  const target = displayName.trim().toLowerCase()
  for (const p of roster) {
    const d = distance(p.displayName.trim().toLowerCase(), target)
    if (d <= FUZZY) return { match: p, reason: 'fuzzy' }
  }
  return null
}
