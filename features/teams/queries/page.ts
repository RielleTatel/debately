import { prisma } from '@/lib/prisma'
import { readPage, type SearchParams } from '@/lib/pagination'
import type { Prisma } from '@prisma/client'
import { cache } from 'react'

export const getTeamCountForInstitution = cache(async (institutionId: string) =>
  prisma.team.count({ where: { tournamentInstitutionId: institutionId } }),
)

export async function getTeamPage(
  scope: { tournamentId: string } | { institutionId: string },
  params: SearchParams = {},
) {
  const paging = readPage(params)
  const where: Prisma.TeamWhereInput =
    'institutionId' in scope
      ? { tournamentInstitutionId: scope.institutionId }
      : { institution: { tournamentId: scope.tournamentId } }
  const [rows, total, institutionCount] = await Promise.all([
    prisma.team.findMany({
      where,
      take: paging.pageSize,
      skip: paging.skip,
      orderBy: [
        { institution: { name: 'asc' } },
        { tournamentInstitutionId: 'asc' },
        { name: 'asc' },
        { id: 'asc' },
      ],
      select: {
        id: true,
        tournamentInstitutionId: true,
        name: true,
        isNovice: true,
        warningFlags: true,
        institution: { select: { id: true, name: true, _count: { select: { teams: true } } } },
        validationFlags: { select: { id: true, kind: true, note: true } },
        _count: { select: { participants: true } },
      },
    }),
    'institutionId' in scope
      ? getTeamCountForInstitution(scope.institutionId)
      : prisma.team.count({ where }),
    prisma.tournamentInstitution.count({
      where: {
        ...('institutionId' in scope
          ? { id: scope.institutionId }
          : { tournamentId: scope.tournamentId }),
        teams: { some: {} },
      },
    }),
  ])
  return { rows, total, institutionCount, paging }
}
