import { prisma } from '@/lib/prisma'
import { resolveInstitutionByName } from '@/features/institutions/queries/institutions'
import { pick, toInt, type SubmissionPayload } from './_utils'

export async function ingestInstitutions(
  sourceId: string,
  tournamentId: string,
  columnMapping: Record<string, string>,
): Promise<number> {
  const submissions = await prisma.googleFormSubmission.findMany({
    where: { sourceId, processedAt: null },
    orderBy: { rowIndex: 'asc' },
  })

  let ingested = 0
  for (const sub of submissions) {
    const payload = sub.payload as SubmissionPayload
    const name = pick(payload, columnMapping, 'institutionName')

    if (!name) {
      await prisma.googleFormSubmission.update({
        where: { id: sub.id },
        data: { processedAt: new Date() },
      })
      continue
    }

    const existing = await resolveInstitutionByName(tournamentId, name)

    if (existing) {
      await prisma.tournamentInstitution.update({
        where: { id: existing.id },
        data: {
          contactEmail: pick(payload, columnMapping, 'email') ?? undefined,
          contactName: pick(payload, columnMapping, 'representativeName') ?? undefined,
          contactPhone: pick(payload, columnMapping, 'contactNumber') ?? undefined,
          teamsIntended: toInt(pick(payload, columnMapping, 'numberOfTeams')) ?? undefined,
          adjudicatorsIntended: toInt(pick(payload, columnMapping, 'numberOfAdjudicators')) ?? undefined,
        },
      })
    } else {
      await prisma.tournamentInstitution.create({
        data: {
          tournamentId,
          name,
          contactEmail: pick(payload, columnMapping, 'email'),
          contactName: pick(payload, columnMapping, 'representativeName'),
          contactPhone: pick(payload, columnMapping, 'contactNumber'),
          teamsIntended: toInt(pick(payload, columnMapping, 'numberOfTeams')),
          adjudicatorsIntended: toInt(pick(payload, columnMapping, 'numberOfAdjudicators')),
        },
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
