import { invalidateTournamentViews } from '@/features/tournaments/services/invalidate-views'
import type { RegistrationPhase } from '@prisma/client'
import { ingestInstitutions } from './handlers/ingest-institutions'
import { ingestTeams } from './handlers/ingest-teams'
import { ingestAdjudicators } from './handlers/ingest-adjudicators'

export async function ingestSource(
  sourceId: string,
  tournamentId: string,
  phase: RegistrationPhase,
  columnMapping: Record<string, string>,
): Promise<number> {
  try {
    switch (phase) {
      case 'INSTITUTIONS':
        return await ingestInstitutions(sourceId, tournamentId, columnMapping)
      case 'TEAMS':
        return await ingestTeams(sourceId, tournamentId, columnMapping)
      case 'ADJUDICATORS':
        return await ingestAdjudicators(sourceId, tournamentId, columnMapping)
    }
  } finally {
    // Ingestion can commit some rows before a later row fails.
    invalidateTournamentViews(tournamentId)
  }
}
