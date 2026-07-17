import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const PARTICIPANT_PERMISSIONS = {
  canManage: (role: Role) => hasRole(role, 'tournament_director'),
  canRegisterSelf: (_role: Role) => true,
} as const
