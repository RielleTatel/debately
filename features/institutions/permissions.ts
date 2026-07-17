import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const INSTITUTION_PERMISSIONS = {
  canManage: (role: Role) => hasRole(role, 'tournament_director'),
} as const
