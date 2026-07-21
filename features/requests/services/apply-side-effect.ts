import type { Prisma, Request } from '@prisma/client'
import { AppError } from '@/lib/errors'
import { REQUEST_REGISTRY } from './registry'

type Tx = Prisma.TransactionClient

export async function applyRequestSideEffect(request: Request, tx: Tx): Promise<void> {
  const registry = REQUEST_REGISTRY[request.type]
  const parsed = registry.payloadSchema.safeParse(request.payload)
  if (!parsed.success) throw new AppError('VALIDATION_ERROR', `Payload no longer valid: ${parsed.error.issues[0].message}`)
  const payload = parsed.data as any

  switch (request.type) {
    case 'TEAM_ADDITION': {
      const team = await tx.team.create({ data: { tournamentInstitutionId: request.tournamentInstitutionId, name: payload.teamName, importPhase: 'phase-3' } })
      for (const s of payload.speakers) {
        await tx.participant.create({ data: { tournamentInstitutionId: request.tournamentInstitutionId, teamId: team.id, displayName: `${s.firstName} ${s.lastName}`, email: s.email, importPhase: 'phase-3' } })
      }
      return
    }
    case 'TEAM_WITHDRAWAL': {
      return
    }
    case 'SPEAKER_REPLACEMENT': {
      const old = await tx.participant.findUnique({ where: { id: payload.outgoingParticipantId }, select: { id: true, teamId: true, tournamentInstitutionId: true, eligibility: true } })
      if (old) {
        await tx.participant.update({ where: { id: old.id }, data: { eligibility: 'INELIGIBLE', ineligibilityReason: 'Replaced' } })
        await tx.participant.create({ data: { tournamentInstitutionId: old.tournamentInstitutionId, teamId: old.teamId, displayName: `${payload.incoming.firstName} ${payload.incoming.lastName}`, email: payload.incoming.email, importPhase: 'phase-3' } })
      }
      return
    }
    case 'ADJUDICATOR_ADD': {
      await tx.adjudicator.create({ data: { tournamentInstitutionId: request.tournamentInstitutionId, tournamentId: request.tournamentId, displayName: `${payload.firstName} ${payload.lastName}`, email: payload.email, experienceLevel: payload.experience ?? null, importPhase: 'phase-3' } })
      return
    }
    case 'ADJUDICATOR_REMOVE': {
      await tx.adjudicator.update({ where: { id: payload.adjudicatorId }, data: { status: 'WITHDRAWN' } })
      return
    }
    default: return
  }
}
