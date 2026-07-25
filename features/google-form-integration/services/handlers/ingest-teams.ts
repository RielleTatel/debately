import { prisma } from '@/lib/prisma'
import { resolveInstitutionByName } from '@/features/institutions/queries/institutions'
import { pick, toBool, type SubmissionPayload } from './_utils'

const IMPORT_PHASE = 'sheet-sync'

export async function ingestTeams(
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
    let didWork = false

    const instName = pick(payload, columnMapping, 'institutionName')
    const inst = instName ? await resolveInstitutionByName(tournamentId, instName) : null
    const teamName = pick(payload, columnMapping, 'teamName')

    if (inst && teamName) {
      const team = await prisma.team.upsert({
        where: { tournamentInstitutionId_name: { tournamentInstitutionId: inst.id, name: teamName } },
        update: { isNovice: toBool(pick(payload, columnMapping, 'teamIsNovice')), importPhase: IMPORT_PHASE },
        create: {
          tournamentInstitutionId: inst.id,
          name: teamName,
          isNovice: toBool(pick(payload, columnMapping, 'teamIsNovice')),
          importPhase: IMPORT_PHASE,
        },
      })
      didWork = true

      for (const i of [1, 2, 3] as const) {
        const speakerName = pick(payload, columnMapping, `speaker${i}Name`)
        if (!speakerName) continue
        const email = pick(payload, columnMapping, `speaker${i}Email`) ?? undefined
        const phone = pick(payload, columnMapping, `speaker${i}Contact`) ?? undefined

        const existing = email
          ? await prisma.participant.findFirst({ where: { tournamentInstitutionId: inst.id, email } })
          : null

        if (existing) {
          await prisma.participant.update({
            where: { id: existing.id },
            data: { displayName: speakerName, phone, teamId: team.id, importPhase: IMPORT_PHASE },
          })
        } else {
          await prisma.participant.create({
            data: {
              tournamentInstitutionId: inst.id,
              teamId: team.id,
              displayName: speakerName,
              email,
              phone,
              eligibility: 'ELIGIBLE',
              importPhase: IMPORT_PHASE,
            },
          })
        }
      }
    } else if (instName && !inst) {
      console.warn(`[ingest-teams] Institution not found: "${instName}" (tournamentId=${tournamentId})`)
    }

    const adjName = pick(payload, columnMapping, 'adjudicatorName')
    if (adjName) {
      const adjInstName = pick(payload, columnMapping, 'adjudicatorInstitution')
      const adjInst = adjInstName ? await resolveInstitutionByName(tournamentId, adjInstName) : null
      const adjInstitutionId = adjInst?.id ?? inst?.id ?? null

      const adjEmail = pick(payload, columnMapping, 'adjudicatorEmail') ?? undefined
      const adjPhone = pick(payload, columnMapping, 'adjudicatorContact') ?? undefined

      const existing = adjEmail
        ? await prisma.adjudicator.findFirst({ where: { tournamentId, email: adjEmail } })
        : null

      if (existing) {
        await prisma.adjudicator.update({
          where: { id: existing.id },
          data: { displayName: adjName, phone: adjPhone, importPhase: IMPORT_PHASE },
        })
      } else {
        await prisma.adjudicator.create({
          data: {
            tournamentId,
            tournamentInstitutionId: adjInstitutionId,
            displayName: adjName,
            email: adjEmail,
            phone: adjPhone,
            status: 'ACTIVE',
            importPhase: IMPORT_PHASE,
          },
        })
      }
      didWork = true
    }

    await prisma.googleFormSubmission.update({
      where: { id: sub.id },
      data: { processedAt: new Date() },
    })
    if (didWork) ingested++
  }

  return ingested
}
