'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireTournamentDirector, assertTournamentEditable } from '@/features/tournaments/permissions'
import { tournamentRulesStorage } from '@/services/storage/tournament-rules'
import { err, ok, type ActionResult } from '@/types/api'
import { isAppError } from '@/lib/errors'

export async function uploadRulesPdfAction(fd: FormData): Promise<ActionResult<{ url: string }>> {
  const tournamentId = String(fd.get('tournamentId') ?? '')
  const file = fd.get('file')
  if (!tournamentId) return err('Missing tournament id', 'VALIDATION_ERROR')
  if (!(file instanceof File)) return err('No file provided', 'VALIDATION_ERROR')
  const v = tournamentRulesStorage.validate(file); if (!v.ok) return err(v.message, 'VALIDATION_ERROR')
  try {
    const { tournament } = await requireTournamentDirector(tournamentId)
    assertTournamentEditable(tournament)
    const url = await tournamentRulesStorage.upload(tournament.id, file)
    await prisma.tournament.update({ where: { id: tournament.id }, data: { rulesUrl: url } })
    revalidatePath(`/tournaments/${tournamentId}`)
    revalidatePath(`/tournaments/${tournamentId}/settings`)
    return ok({ url })
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}
