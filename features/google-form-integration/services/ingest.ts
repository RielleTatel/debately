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
  switch (phase) {
    case 'INSTITUTIONS': return ingestInstitutions(sourceId, tournamentId, columnMapping)
    case 'TEAMS':        return ingestTeams(sourceId, tournamentId, columnMapping)
    case 'ADJUDICATORS': return ingestAdjudicators(sourceId, tournamentId, columnMapping)
  }
}
