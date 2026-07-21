'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireOrgOwner } from '@/features/organizations/permissions'
import { assignDirectorSchema, removeDirectorSchema } from '@/features/tournaments/schemas'
import { err, ok, type ActionResult } from '@/types/api'
import { isAppError, Errors } from '@/lib/errors'

async function loadTournamentOrFail(tournamentId: string) {
  const t = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!t) throw Errors.notFound('Tournament')
  return t
}

export async function assignDirectorAction(fd: FormData): Promise<ActionResult<{ profileId: string }>> {
  const tournamentId = String(fd.get('tournamentId') ?? '')
  if (!tournamentId) return err('Missing tournament id', 'VALIDATION_ERROR')
  const parsed = assignDirectorSchema.safeParse({ profileId: fd.get('profileId') })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')

  try {
    const tournament = await loadTournamentOrFail(tournamentId)
    await requireOrgOwner(tournament.orgId)
    const member = await prisma.organizationMember.findUnique({
      where: { orgId_profileId: { orgId: tournament.orgId, profileId: parsed.data.profileId } },
    })
    if (!member) return err('That profile is not a member of this organization.', 'VALIDATION_ERROR')
    const existing = await prisma.tournamentDirector.findUnique({
      where: { tournamentId_profileId: { tournamentId, profileId: parsed.data.profileId } },
    })
    if (existing) return err('That profile is already a director.', 'CONFLICT')
    await prisma.tournamentDirector.create({ data: { tournamentId, profileId: parsed.data.profileId } })
    revalidatePath(`/tournaments/${tournamentId}/settings`)
    return ok({ profileId: parsed.data.profileId })
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}

export async function removeDirectorAction(fd: FormData): Promise<ActionResult<void>> {
  const tournamentId = String(fd.get('tournamentId') ?? '')
  if (!tournamentId) return err('Missing tournament id', 'VALIDATION_ERROR')
  const parsed = removeDirectorSchema.safeParse({
    profileId: fd.get('profileId'),
    confirm: fd.get('confirm'),
  })
  if (!parsed.success) return err('Confirmation required to remove a director.', 'VALIDATION_ERROR')
  try {
    const tournament = await loadTournamentOrFail(tournamentId)
    await requireOrgOwner(tournament.orgId)
    const existing = await prisma.tournamentDirector.findUnique({
      where: { tournamentId_profileId: { tournamentId, profileId: parsed.data.profileId } },
    })
    if (!existing) return err('That profile is not a director of this tournament.', 'NOT_FOUND')
    await prisma.tournamentDirector.delete({ where: { id: existing.id } })
    revalidatePath(`/tournaments/${tournamentId}/settings`)
    return ok(undefined)
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}
