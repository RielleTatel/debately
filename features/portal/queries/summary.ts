import { prisma } from '@/lib/prisma'

export async function getInstitutionSummary(institutionId: string) {
  const where = { tournamentInstitutionId: institutionId }
  const [teamsTotal, teamsWithIssues, participantsTotal, adjudicatorsTotal] = await Promise.all([
    prisma.team.count({ where }),
    prisma.team.count({ where: { ...where, validationFlags: { some: {} } } }),
    prisma.participant.count({ where }),
    prisma.adjudicator.count({ where }),
  ])
  return { teamsTotal, teamsWithIssues, participantsTotal, adjudicatorsTotal }
}
