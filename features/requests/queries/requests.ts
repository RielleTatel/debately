import { prisma } from '@/lib/prisma'
import type { RequestStatus, RequestType } from '@prisma/client'

export async function listRequestsForTournament(tournamentId: string, filters?: { status?: RequestStatus; type?: RequestType; institutionId?: string }) {
  return prisma.request.findMany({
    where: { tournamentId, ...(filters?.status ? { status: filters.status } : {}), ...(filters?.type ? { type: filters.type } : {}), ...(filters?.institutionId ? { tournamentInstitutionId: filters.institutionId } : {}) },
    include: { institution: { select: { id: true, name: true } }, submitter: { select: { displayName: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getRequestById(requestId: string) {
  return prisma.request.findUnique({ where: { id: requestId }, include: { institution: { select: { id: true, name: true } }, submitter: { select: { displayName: true, avatarUrl: true } }, resolvedBy: { select: { displayName: true } } } })
}

export async function listRequestsForInstitution(tournamentInstitutionId: string) {
  return prisma.request.findMany({ where: { tournamentInstitutionId }, include: { submitter: { select: { displayName: true } } }, orderBy: { createdAt: 'desc' } })
}
