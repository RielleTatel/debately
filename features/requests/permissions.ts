import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/errors'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { requireInstitutionRep } from '@/features/portal/permissions'

export async function requireDirectorForRequest(requestId: string) {
  const r = await prisma.request.findUnique({ where: { id: requestId }, select: { id: true, tournamentId: true, tournamentInstitutionId: true, type: true, status: true, payload: true, description: true, submitterId: true, sequenceNumber: true } })
  if (!r) throw new AppError('NOT_FOUND', 'Request not found')
  const ctx = await requireTournamentDirector(r.tournamentId)
  return { request: r, ...ctx }
}

export async function requireRepForRequest(requestId: string) {
  const r = await prisma.request.findUnique({ where: { id: requestId }, select: { id: true, tournamentId: true, tournamentInstitutionId: true, status: true, type: true, submitterId: true, description: true, payload: true, sequenceNumber: true } })
  if (!r) throw new AppError('NOT_FOUND', 'Request not found')
  const ctx = await requireInstitutionRep(r.tournamentInstitutionId)
  return { request: r, ...ctx }
}
