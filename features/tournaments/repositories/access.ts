import { prisma } from '@/lib/prisma'
import type { OrganizationRole } from '@prisma/client'

export async function getTournamentAccess(orgId: string, tournamentId: string, profileId: string) {
  const [membership] = await prisma.$queryRaw<
    Array<{ role: OrganizationRole; isDirector: boolean }>
  >`
    SELECT m.role::text AS role,
      (m.role = 'OWNER' OR EXISTS (
        SELECT 1 FROM tournament_directors d
        WHERE d.tournament_id = ${tournamentId} AND d.profile_id = ${profileId}
      )) AS "isDirector"
    FROM organization_members m
    WHERE m.org_id = ${orgId} AND m.profile_id = ${profileId}
  `
  return membership
}
