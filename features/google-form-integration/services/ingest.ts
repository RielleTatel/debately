import { prisma } from '@/lib/prisma'
import type { RegistrationPhase } from '@prisma/client'

type SubmissionPayload = {
  responses: { question: string; answer: string }[]
}

function pick(
  payload: SubmissionPayload,
  mapping: Record<string, string>,
  field: string,
): string | null {
  const header = mapping[field]
  if (!header) return null
  const r = payload.responses.find((x) => x.question === header)
  return r?.answer?.trim() || null
}

function toInt(v: string | null): number | null {
  if (!v) return null
  const n = parseInt(v, 10)
  return isFinite(n) ? n : null
}

export async function ingestSource(
  sourceId: string,
  tournamentId: string,
  phase: RegistrationPhase,
  columnMapping: Record<string, string>,
): Promise<number> {
  if (phase !== 'INSTITUTIONS') return 0

  const submissions = await prisma.googleFormSubmission.findMany({
    where: { sourceId, processedAt: null },
    orderBy: { rowIndex: 'asc' },
  })

  let ingested = 0
  for (const submission of submissions) {
    const payload = submission.payload as SubmissionPayload

    const name = pick(payload, columnMapping, 'institutionName')
    if (!name) {
      await prisma.googleFormSubmission.update({
        where: { id: submission.id },
        data: { processedAt: new Date() },
      })
      continue
    }

    await prisma.tournamentInstitution.upsert({
      where: { tournamentId_name: { tournamentId, name } },
      create: {
        tournamentId,
        name,
        contactEmail: pick(payload, columnMapping, 'email'),
        contactName: pick(payload, columnMapping, 'representativeName'),
        contactPhone: pick(payload, columnMapping, 'contactNumber'),
        teamsIntended: toInt(pick(payload, columnMapping, 'numberOfTeams')),
        adjudicatorsIntended: toInt(pick(payload, columnMapping, 'numberOfAdjudicators')),
      },
      update: {
        contactEmail: pick(payload, columnMapping, 'email') ?? undefined,
        contactName: pick(payload, columnMapping, 'representativeName') ?? undefined,
        contactPhone: pick(payload, columnMapping, 'contactNumber') ?? undefined,
        teamsIntended: toInt(pick(payload, columnMapping, 'numberOfTeams')) ?? undefined,
        adjudicatorsIntended: toInt(pick(payload, columnMapping, 'numberOfAdjudicators')) ?? undefined,
      },
    })

    await prisma.googleFormSubmission.update({
      where: { id: submission.id },
      data: { processedAt: new Date() },
    })

    ingested++
  }

  return ingested
}
