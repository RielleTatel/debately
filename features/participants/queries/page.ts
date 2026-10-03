import { prisma } from '@/lib/prisma'
import { readPage, type SearchParams } from '@/lib/pagination'
import { cache } from 'react'

export const getParticipantCountForInstitution = cache(async (institutionId: string) =>
  prisma.participant.count({ where: { tournamentInstitutionId: institutionId } }),
)

export async function getParticipantPage(institutionId: string, params: SearchParams = {}) {
  const paging = readPage(params)
  const where = { tournamentInstitutionId: institutionId }
  const [rows, total] = await Promise.all([
    prisma.participant.findMany({
      where,
      take: paging.pageSize,
      skip: paging.skip,
      orderBy: [{ displayName: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        displayName: true,
        email: true,
        eligibility: true,
        ineligibilityReason: true,
        team: { select: { name: true } },
      },
    }),
    getParticipantCountForInstitution(institutionId),
  ])
  return { rows, total, paging }
}
