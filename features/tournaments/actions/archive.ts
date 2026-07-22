'use server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { requireOrgOwner } from '@/features/organizations/permissions'
import { TOURNAMENT_TAG } from '@/features/tournaments/queries/tournaments'
import { archiveTournamentSchema } from '@/features/tournaments/schemas'
import { err, ok, type ActionResult } from '@/types/api'
import { isAppError } from '@/lib/errors'

export async function archiveTournamentAction(fd: FormData): Promise<ActionResult<void>> {
  const tournamentId = String(fd.get('tournamentId') ?? '')
  if (!tournamentId) return err('Missing tournament id', 'VALIDATION_ERROR')
  const parsed = archiveTournamentSchema.safeParse({ confirmName: fd.get('confirmName') })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')

  try {
    const { tournament } = await requireTournamentDirector(tournamentId)
    if (parsed.data.confirmName !== tournament.name) {
      return err('Type the tournament name exactly to confirm.', 'VALIDATION_ERROR')
    }
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'ARCHIVED', archivedAt: new Date() },
    })
    revalidatePath(`/tournaments/${tournamentId}`)
    revalidatePath(`/tournaments/${tournamentId}/settings`)
    revalidatePath('/tournaments')
    revalidateTag(TOURNAMENT_TAG(tournamentId))
    return ok(undefined)
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}

export async function unarchiveTournamentAction(fd: FormData): Promise<ActionResult<void>> {
  const tournamentId = String(fd.get('tournamentId') ?? '')
  if (!tournamentId) return err('Missing tournament id', 'VALIDATION_ERROR')
  try {
    const existing = await prisma.tournament.findUnique({ where: { id: tournamentId } })
    if (!existing) return err('Tournament not found', 'NOT_FOUND')
    if (existing.status !== 'ARCHIVED') return err('Tournament is not archived', 'CONFLICT')
    await requireOrgOwner(existing.orgId)
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'COMPLETED', archivedAt: null },
    })
    revalidatePath(`/tournaments/${tournamentId}`)
    revalidatePath(`/tournaments/${tournamentId}/settings`)
    revalidatePath('/tournaments')
    revalidateTag(TOURNAMENT_TAG(tournamentId))
    return ok(undefined)
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}
