import { prisma } from '@/lib/prisma'
import { resolveInstitutionByName } from '@/features/institutions/queries/institutions'
import { pick, toMinor, type SubmissionPayload } from './_utils'

const IMPORT_PHASE = 'sheet-sync'

export async function ingestAdjudicators(
  sourceId: string,
  tournamentId: string,
  columnMapping: Record<string, string>,
): Promise<number> {
  const submissions = await prisma.googleFormSubmission.findMany({
    where: { sourceId, processedAt: null },
    orderBy: { rowIndex: 'asc' },
  })

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { currency: true },
  })
  const currency = tournament?.currency ?? 'PHP'

  let ingested = 0
  for (const sub of submissions) {
    const payload = sub.payload as SubmissionPayload
    const adjName = pick(payload, columnMapping, 'adjudicatorName')

    if (!adjName) {
      await prisma.googleFormSubmission.update({
        where: { id: sub.id },
        data: { processedAt: new Date() },
      })
      continue
    }

    const instName = pick(payload, columnMapping, 'institutionName')
    let inst = instName ? await resolveInstitutionByName(tournamentId, instName) : null

    if (instName && !inst) {
      inst = await prisma.tournamentInstitution.create({
        data: { tournamentId, name: instName },
      })
    }

    const adjEmail = pick(payload, columnMapping, 'adjudicatorEmail') ?? undefined
    const adjPhone = pick(payload, columnMapping, 'adjudicatorContact') ?? undefined

    const existing = adjEmail
      ? await prisma.adjudicator.findFirst({ where: { tournamentId, email: adjEmail } })
      : null

    if (existing) {
      await prisma.adjudicator.update({
        where: { id: existing.id },
        data: {
          displayName: adjName,
          phone: adjPhone,
          tournamentInstitutionId: inst?.id ?? existing.tournamentInstitutionId,
          importPhase: IMPORT_PHASE,
        },
      })
    } else {
      await prisma.adjudicator.create({
        data: {
          tournamentId,
          tournamentInstitutionId: inst?.id ?? null,
          displayName: adjName,
          email: adjEmail,
          phone: adjPhone,
          status: 'ACTIVE',
          importPhase: IMPORT_PHASE,
        },
      })
    }

    // Upsert payment record if paymentAmount is mapped and institution is known
    const amountMinor = toMinor(pick(payload, columnMapping, 'paymentAmount'))
    if (amountMinor != null && inst) {
      await prisma.tournamentPayment.upsert({
        where: {
          tournamentInstitutionId_sourceSubmissionId: {
            tournamentInstitutionId: inst.id,
            sourceSubmissionId: sub.id,
          },
        },
        create: {
          tournamentId,
          tournamentInstitutionId: inst.id,
          phase: 'ADJUDICATORS',
          amountMinor,
          currency,
          paymentSource: 'GOOGLE_FORM',
          sourceSubmissionId: sub.id,
        },
        update: { amountMinor },
      })
    }

    await prisma.googleFormSubmission.update({
      where: { id: sub.id },
      data: { processedAt: new Date() },
    })
    ingested++
  }

  return ingested
}
