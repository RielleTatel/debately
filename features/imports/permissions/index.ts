import { prisma } from '@/lib/prisma'
import { Errors } from '@/lib/errors'
import {
  requireTournamentDirector,
  requireTournamentReadable,
} from '@/features/tournaments/permissions'
import type { CsvImport } from '@prisma/client'

export type ImportContext = {
  import: CsvImport
  tournamentId: string
  orgId: string
  meId: string
}

export async function requireImportEditor(importId: string): Promise<ImportContext> {
  const record = await prisma.csvImport.findUnique({ where: { id: importId } })
  if (!record) throw Errors.notFound('Import not found')
  const { me, tournament, org } = await requireTournamentDirector(record.tournamentId)
  return { import: record, tournamentId: tournament.id, orgId: org.id, meId: me.profile.id }
}

export async function requireImportReadable(importId: string): Promise<ImportContext> {
  const record = await prisma.csvImport.findUnique({ where: { id: importId } })
  if (!record) throw Errors.notFound('Import not found')
  const { me, tournament, org } = await requireTournamentReadable(record.tournamentId)
  return { import: record, tournamentId: tournament.id, orgId: org.id, meId: me.profile.id }
}

export async function getImportContext(importId: string): Promise<ImportContext> {
  return requireImportReadable(importId)
}
