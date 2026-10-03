import { prisma } from '@/lib/prisma'
import { Errors } from '@/lib/errors'
import { canonicalInstitutionName } from '../services/normalize-institution'
import type { Prisma } from '@prisma/client'

export async function withImportReview<T>(
  importId: string,
  review: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  return prisma.$transaction(async (tx) => {
    const [record] = await tx.$queryRaw<
      Array<{ status: string }>
    >`SELECT status::text FROM csv_imports WHERE id = ${importId} FOR UPDATE`
    if (!record || record.status !== 'PROCESSED')
      throw Errors.conflict('Import is not in PROCESSED state')
    return review(tx)
  })
}

export async function recordNormalization(
  importId: string,
  tournamentId: string,
  rawName: string,
  decision: 'confirm' | 'reject',
  targetInstitutionId?: string,
) {
  await withImportReview(importId, async (tx) => {
    if (decision === 'confirm' && targetInstitutionId) {
      const target = await tx.tournamentInstitution.findFirst({
        where: { id: targetInstitutionId, tournamentId },
        select: { id: true },
      })
      if (!target) throw Errors.notFound('Institution')
      await tx.institutionAlias.upsert({
        where: { tournamentId_alias: { tournamentId, alias: canonicalInstitutionName(rawName) } },
        update: { resolvedInstitutionId: target.id },
        create: {
          tournamentId,
          alias: canonicalInstitutionName(rawName),
          resolvedInstitutionId: target.id,
        },
      })
    }
    await tx.$executeRaw`
      UPDATE csv_import_rows r SET messages = ARRAY(SELECT message FROM unnest(r.messages) AS message WHERE message NOT LIKE 'NORMALIZATION_DECISION:%') || ARRAY[${`NORMALIZATION_DECISION:${decision}`}]
      WHERE r.import_id = ${importId} AND lower(trim(regexp_replace(r.raw_json->>'institutionName', '\\s+', ' ', 'g'))) = ${canonicalInstitutionName(rawName)}
    `
  })
}
