'use server'

import { tournamentService } from '@/features/tournaments/services'
import { createTournamentSchema, updateTournamentSchema } from '@/features/tournaments/schemas'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/types/api'
import type { ActionResult } from '@/types/api'
import type { Tournament } from '@/features/tournaments/types'

export async function createTournamentAction(
  formData: FormData
): Promise<ActionResult<Tournament>> {
  await requireAuth()

  const parsed = createTournamentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')

  try {
    const tournament = await tournamentService.create({
      ...parsed.data,
      organizationId: String(formData.get('organizationId')),
    })
    return ok(tournament)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Failed to create tournament')
  }
}

export async function deleteTournamentAction(id: string): Promise<ActionResult> {
  await requireAuth()
  try {
    await tournamentService.delete(id)
    return ok(undefined)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Failed to delete tournament')
  }
}
