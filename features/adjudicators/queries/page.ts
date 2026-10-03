import { prisma } from '@/lib/prisma'
import { readPage, type SearchParams } from '@/lib/pagination'
import type { AdjudicatorStatus, Prisma } from '@prisma/client'
import { cache } from 'react'

export function readAdjudicatorStatus(params: SearchParams): AdjudicatorStatus | undefined {
  return params.status === 'ACTIVE' || params.status === 'WITHDRAWN' ? params.status : undefined
}

export const getAdjudicatorCountForInstitution = cache(
  async (institutionId: string, status?: AdjudicatorStatus) =>
    prisma.adjudicator.count({ where: { tournamentInstitutionId: institutionId, status } }),
)

export async function getAdjudicatorPage(
  scope: { tournamentId: string } | { institutionId: string },
  params: SearchParams = {},
) {
  const paging = readPage(params)
  const where: Prisma.AdjudicatorWhereInput =
    'institutionId' in scope
      ? { tournamentInstitutionId: scope.institutionId }
      : { tournamentId: scope.tournamentId }
  const status = readAdjudicatorStatus(params)
  const count = (status?: AdjudicatorStatus) =>
    'institutionId' in scope
      ? getAdjudicatorCountForInstitution(scope.institutionId, status)
      : prisma.adjudicator.count({ where: { ...where, status } })
  const [rows, total, active, withdrawn] = await Promise.all([
    prisma.adjudicator.findMany({
      where: { ...where, status },
      take: paging.pageSize,
      skip: paging.skip,
      orderBy: [{ status: 'asc' }, { displayName: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        displayName: true,
        status: true,
        institution: { select: { id: true, name: true } },
      },
    }),
    count(status),
    count('ACTIVE'),
    count('WITHDRAWN'),
  ])
  return { rows, total, active, withdrawn, paging }
}
