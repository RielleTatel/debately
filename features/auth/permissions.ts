import type { Role } from '@/lib/permissions'

export const AUTH_PERMISSIONS = {
  canManageUsers: (role: Role) => role === 'super_admin' || role === 'org_admin',
  canInviteMembers: (role: Role) =>
    role === 'super_admin' || role === 'org_admin' || role === 'tournament_director',
} as const
