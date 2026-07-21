'use server'

import { prisma } from '@/lib/prisma'
import { toApi } from '@/lib/errors'
import { logger } from '@/services/logger'
import { tournamentImportsStorage } from '@/services/storage'
import {
  requireTournamentDirector,
  assertTournamentEditable,
} from '@/features/tournaments/permissions'
import { startImportSchema } from '@/features/imports/schemas'
import type { ApiResponse } from '@/types/api'

export async function startCsvImportAction(
  formData: FormData,
): Promise<ApiResponse<{ importId: string }>> {
  try {
    const parsed = startImportSchema.parse({
      tournamentId: formData.get('tournamentId'),
      phaseLabel: formData.get('phaseLabel'),
    })
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return { ok: false, error: 'CSV file is required', code: 'VALIDATION_ERROR' }
    }
    const validation = tournamentImportsStorage.validate(file)
    if (!validation.ok) {
      return { ok: false, error: validation.message, code: 'VALIDATION_ERROR' }
    }
    const { me, tournament } = await requireTournamentDirector(parsed.tournamentId)
    assertTournamentEditable(tournament)

    const importRecord = await prisma.csvImport.create({
      data: {
        tournamentId: tournament.id,
        phaseLabel: parsed.phaseLabel,
        uploaderId: me.profile.id,
        storagePath: 'pending',
        status: 'STAGING',
      },
    })
    const path = await tournamentImportsStorage.upload(tournament.id, importRecord.id, file)
    await prisma.csvImport.update({ where: { id: importRecord.id }, data: { storagePath: path } })

    logger.info('CSV import started', { importId: importRecord.id, tournamentId: tournament.id })
    return { ok: true, data: { importId: importRecord.id } }
  } catch (e) {
    return toApi(e)
  }
}
