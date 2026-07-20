import type { Organization, OrganizationMember, OrganizationInvitation, OrganizationRole } from '@prisma/client'

export type { Organization, OrganizationMember, OrganizationInvitation, OrganizationRole }

export type OrganizationId = string

export type OrganizationWithRole = Organization & { role: OrganizationRole }

export type MemberWithProfile = OrganizationMember & {
  profile: { id: string; displayName: string; avatarUrl: string | null; userId: string }
}

export type PendingInvitation = Pick<
  OrganizationInvitation,
  'id' | 'email' | 'role' | 'expiresAt' | 'createdAt'
>
