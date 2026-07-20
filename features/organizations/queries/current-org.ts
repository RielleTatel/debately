import { prisma } from '@/lib/prisma'
import { requireUser, requireVerifiedUser } from '@/features/auth/queries'
import type { Organization, OrganizationRole } from '@prisma/client'
import type { MemberWithProfile, OrganizationWithRole, PendingInvitation } from '@/features/organizations/types'

export async function getMyOrganizations(): Promise<OrganizationWithRole[]> {
  const me = await requireUser()
  const rows = await prisma.organization.findMany({
    where: { members: { some: { profileId: me.profile.id } } },
    include: { members: { where: { profileId: me.profile.id }, select: { role: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(({ members, ...org }) => ({ ...org, role: members[0]?.role ?? 'MEMBER' }))
}

export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  return prisma.organization.findUnique({ where: { slug } })
}

export async function resolveOrgBySlug(slug: string): Promise<{ org: Organization | null; redirectTo: string | null }> {
  const org = await prisma.organization.findUnique({ where: { slug } })
  if (org) return { org, redirectTo: null }
  const alias = await prisma.organizationSlugAlias.findUnique({ where: { oldSlug: slug }, include: { organization: true } })
  if (!alias || alias.expiresAt.getTime() <= Date.now()) return { org: null, redirectTo: null }
  return { org: null, redirectTo: `/organization/${alias.organization.slug}` }
}

export async function getUserRoleInOrg(profileId: string, orgId: string): Promise<OrganizationRole | null> {
  const m = await prisma.organizationMember.findUnique({
    where: { orgId_profileId: { orgId, profileId } }, select: { role: true },
  })
  return m?.role ?? null
}

export async function getOrgMembers(orgId: string): Promise<MemberWithProfile[]> {
  return prisma.organizationMember.findMany({
    where: { orgId },
    include: { profile: { select: { id: true, displayName: true, avatarUrl: true, userId: true } } },
    orderBy: { joinedAt: 'asc' },
  })
}

export async function getPendingInvitations(orgId: string): Promise<PendingInvitation[]> {
  return prisma.organizationInvitation.findMany({
    where: { orgId, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
    select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
}

export { requireVerifiedUser }
