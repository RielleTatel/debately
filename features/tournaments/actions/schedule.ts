'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireTournamentDirector, assertTournamentEditable } from '@/features/tournaments/permissions'
import { scheduleEntrySchema } from '@/features/tournaments/schemas'
import { err, ok, type ActionResult } from '@/types/api'
import { isAppError, Errors } from '@/lib/errors'

function parseEntry(fd: FormData) {
  return scheduleEntrySchema.safeParse({
    label: fd.get('label'),
    kind: fd.get('kind'),
    startAt: fd.get('startAt'),
    endAt: fd.get('endAt') || undefined,
    description: fd.get('description') ?? '',
  })
}

export async function createScheduleEntryAction(fd: FormData): Promise<ActionResult<{ id: string }>> {
  const tournamentId = String(fd.get('tournamentId') ?? '')
  if (!tournamentId) return err('Missing tournament id', 'VALIDATION_ERROR')
  const parsed = parseEntry(fd)
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  try {
    const { tournament } = await requireTournamentDirector(tournamentId)
    assertTournamentEditable(tournament)
    const created = await prisma.tournamentScheduleEntry.create({
      data: {
        tournamentId: tournament.id,
        label: parsed.data.label,
        kind: parsed.data.kind,
        startAt: parsed.data.startAt,
        endAt: parsed.data.endAt ?? null,
        description: parsed.data.description || null,
      },
    })
    revalidatePath(`/tournaments/${tournamentId}/settings`)
    return ok({ id: created.id })
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}

export async function updateScheduleEntryAction(fd: FormData): Promise<ActionResult<void>> {
  const tournamentId = String(fd.get('tournamentId') ?? '')
  const entryId = String(fd.get('entryId') ?? '')
  if (!tournamentId || !entryId) return err('Missing ids', 'VALIDATION_ERROR')
  const parsed = parseEntry(fd)
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  try {
    const { tournament } = await requireTournamentDirector(tournamentId)
    assertTournamentEditable(tournament)
    const existing = await prisma.tournamentScheduleEntry.findUnique({ where: { id: entryId } })
    if (!existing) throw Errors.notFound('Schedule entry')
    if (existing.tournamentId !== tournament.id) return err('Schedule entry does not belong to this tournament', 'FORBIDDEN')
    await prisma.tournamentScheduleEntry.update({
      where: { id: entryId },
      data: {
        label: parsed.data.label,
        kind: parsed.data.kind,
        startAt: parsed.data.startAt,
        endAt: parsed.data.endAt ?? null,
        description: parsed.data.description || null,
      },
    })
    revalidatePath(`/tournaments/${tournamentId}/settings`)
    return ok(undefined)
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}

export async function deleteScheduleEntryAction(fd: FormData): Promise<ActionResult<void>> {
  const tournamentId = String(fd.get('tournamentId') ?? '')
  const entryId = String(fd.get('entryId') ?? '')
  if (!tournamentId || !entryId) return err('Missing ids', 'VALIDATION_ERROR')
  try {
    const { tournament } = await requireTournamentDirector(tournamentId)
    assertTournamentEditable(tournament)
    const existing = await prisma.tournamentScheduleEntry.findUnique({ where: { id: entryId } })
    if (!existing) throw Errors.notFound('Schedule entry')
    if (existing.tournamentId !== tournament.id) return err('Schedule entry does not belong to this tournament', 'FORBIDDEN')
    await prisma.tournamentScheduleEntry.delete({ where: { id: entryId } })
    revalidatePath(`/tournaments/${tournamentId}/settings`)
    return ok(undefined)
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}
