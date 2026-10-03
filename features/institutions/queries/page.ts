import { prisma } from '@/lib/prisma'
import { readPage, type SearchParams } from '@/lib/pagination'

export async function getInstitutionPage(tournamentId: string, params: SearchParams = {}) {
  const paging = readPage(params)
  const where = { tournamentId }
  const [rows, total, claimed] = await Promise.all([
    prisma.tournamentInstitution.findMany({
      where,
      take: paging.pageSize,
      skip: paging.skip,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        name: true,
        contactEmail: true,
        claim: { select: { tournamentInstitutionId: true } },
        _count: { select: { teams: true, adjudicators: true } },
      },
    }),
    prisma.tournamentInstitution.count({ where }),
    prisma.tournamentInstitution.count({ where: { ...where, claim: { isNot: null } } }),
  ])
  return { rows, total, claimed, paging }
}
