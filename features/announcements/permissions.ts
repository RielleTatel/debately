import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const ANNOUNCEMENT_PERMISSIONS = {
  canPublish: (role: Role) => hasRole(role, 'tournament_director'),
} as const
