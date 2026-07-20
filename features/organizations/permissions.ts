import { prisma } from '@/lib/prisma'
import { requireUser } from '@/features/auth/queries'
import { getUserRoleInOrg } from '@/features/organizations/queries'
import { AppError, Errors } from '@/lib/errors'
import type { Organization, OrganizationRole } from '@prisma/client'

export async function requireOrgMember(orgId: string): Promise<{
  me: Awaited<ReturnType<typeof requireUser>>; org: Organization; role: OrganizationRole
}> {
  const me = await requireUser()
  const org = await prisma.organization.findUnique({ where: { id: orgId } })
  if (!org) throw Errors.notFound('Organization')
  const role = await getUserRoleInOrg(me.profile.id, orgId)
  if (!role) throw Errors.forbidden()
  return { me, org, role }
}

export async function requireOrgOwner(orgId: string): Promise<{
  me: Awaited<ReturnType<typeof requireUser>>; org: Organization
}> {
  const { me, org, role } = await requireOrgMember(orgId)
  if (role !== 'OWNER') throw new AppError('FORBIDDEN', 'Only the owner can perform this action', 403)
  return { me, org }
}
