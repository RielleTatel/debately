import { prisma } from '@/lib/prisma'

export async function getPortalTokenByToken(token: string): Promise<{
  institutionId: string
  tournamentId: string
  active: boolean
} | null> {
  const t = await prisma.institutionPortalToken.findUnique({ where: { token } })
  if (!t) return null
  const inst = await prisma.tournamentInstitution.findUnique({
    where: { id: t.tournamentInstitutionId },
    select: { tournamentId: true },
  })
  if (!inst) return null
  return { institutionId: t.tournamentInstitutionId, tournamentId: inst.tournamentId, active: t.active }
}

export async function getPortalTokenByInstitution(institutionId: string) {
  return prisma.institutionPortalToken.findFirst({
    where: { tournamentInstitutionId: institutionId, active: true },
    orderBy: { createdAt: 'desc' },
  })
}
