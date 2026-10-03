import { prisma } from '@/lib/prisma'
import { RequestStatus, RequestType } from '@prisma/client'
import { readPage, type SearchParams } from '@/lib/pagination'

export async function listRequestsForTournament(
  tournamentId: string,
  filters?: { status?: RequestStatus; type?: RequestType; institutionId?: string },
) {
  return prisma.request.findMany({
    where: {
      tournamentId,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.institutionId ? { tournamentInstitutionId: filters.institutionId } : {}),
    },
    include: {
      institution: { select: { id: true, name: true } },
      submitter: { select: { displayName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getRequestById(requestId: string) {
  return prisma.request.findUnique({
    where: { id: requestId },
    include: {
      institution: { select: { id: true, name: true } },
      submitter: { select: { displayName: true, avatarUrl: true } },
      resolvedBy: { select: { displayName: true } },
    },
  })
}

export async function listRequestsForInstitution(tournamentInstitutionId: string) {
  return prisma.request.findMany({
    where: { tournamentInstitutionId },
    include: { submitter: { select: { displayName: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getRequestPage(
  scope: { tournamentId: string } | { institutionId: string },
  params: SearchParams = {},
) {
  const paging = readPage(params)
  const status =
    typeof params.status === 'string' &&
    Object.values(RequestStatus).includes(params.status as RequestStatus)
      ? (params.status as RequestStatus)
      : undefined
  const type =
    typeof params.type === 'string' &&
    Object.values(RequestType).includes(params.type as RequestType)
      ? (params.type as RequestType)
      : undefined
  const where = {
    ...('tournamentId' in scope
      ? { tournamentId: scope.tournamentId }
      : { tournamentInstitutionId: scope.institutionId }),
    status,
    type,
  }
  const [rows, total] = await Promise.all([
    prisma.request.findMany({
      where,
      skip: paging.skip,
      take: paging.pageSize,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        sequenceNumber: true,
        type: true,
        status: true,
        createdAt: true,
        institution: { select: { name: true } },
        submitter: { select: { displayName: true } },
      },
    }),
    prisma.request.count({ where }),
  ])
  return { rows, total, paging }
}
