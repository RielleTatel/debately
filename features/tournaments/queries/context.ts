import { requireTournamentReadable } from '@/features/tournaments/permissions'
import type { TournamentContext } from '@/features/tournaments/types'

export async function getTournamentContext(tournamentId: string): Promise<TournamentContext> {
  const { tournament, org, role, isDirector } = await requireTournamentReadable(tournamentId)
  return { tournament, org, role, isDirector }
}
