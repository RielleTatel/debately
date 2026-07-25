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

  console.log(`[ingest-teams] ${submissions.length} unprocessed submissions for source ${sourceId}`)
  console.log(`[ingest-teams] columnMapping keys:`, Object.keys(columnMapping))

  let ingested = 0
  for (const sub of submissions) {
    const payload = sub.payload as SubmissionPayload
    let didWork = false

    const instName = pick(payload, columnMapping, 'institutionName')
    let inst = instName ? await resolveInstitutionByName(tournamentId, instName) : null

    // Auto-create institution if name is present but not yet in the DB
    if (instName && !inst) {
      inst = await prisma.tournamentInstitution.create({
        data: { tournamentId, name: instName },
      })
    }

    const teamName = pick(payload, columnMapping, 'teamName')
    console.log(`[ingest-teams] row ${sub.id}: instName=${JSON.stringify(instName)} inst=${inst?.id ?? 'null'} teamName=${JSON.stringify(teamName)}`)

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

      // Collect new speakers from this row
      const newSpeakers: { name: string; email?: string; phone?: string }[] = []
      for (const i of [1, 2, 3] as const) {
        const speakerName = pick(payload, columnMapping, `speaker${i}Name`)
        if (!speakerName) continue
        newSpeakers.push({
          name: speakerName,
          email: pick(payload, columnMapping, `speaker${i}Email`) ?? undefined,
          phone: pick(payload, columnMapping, `speaker${i}Contact`) ?? undefined,
        })
      }

      // Reconcile: remove sheet-sync speakers no longer in the row
      const existingSheetSyncParticipants = await prisma.participant.findMany({
        where: { teamId: team.id, importPhase: IMPORT_PHASE },
      })
      const newEmails = new Set(newSpeakers.map((s) => s.email).filter(Boolean))
      const newNames = new Set(newSpeakers.map((s) => s.name))
      for (const p of existingSheetSyncParticipants) {
        const stillPresent = p.email ? newEmails.has(p.email) : newNames.has(p.displayName)
        if (!stillPresent) {
          await prisma.participant.delete({ where: { id: p.id } })
        }
      }

      // Upsert current speakers
      for (const speaker of newSpeakers) {
        const existing = speaker.email
          ? await prisma.participant.findFirst({ where: { tournamentInstitutionId: inst.id, email: speaker.email } })
          : null

        if (existing) {
          await prisma.participant.update({
            where: { id: existing.id },
            data: { displayName: speaker.name, phone: speaker.phone, teamId: team.id, importPhase: IMPORT_PHASE },
          })
        } else {
          await prisma.participant.create({
            data: {
              tournamentInstitutionId: inst.id,
              teamId: team.id,
              displayName: speaker.name,
              email: speaker.email,
              phone: speaker.phone,
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
      let adjInst = adjInstName ? await resolveInstitutionByName(tournamentId, adjInstName) : null
      if (adjInstName && !adjInst) {
        adjInst = await prisma.tournamentInstitution.create({
          data: { tournamentId, name: adjInstName },
        })
      }
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
