import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const REQUEST_PERMISSIONS = {
  canReview: (role: Role) => hasRole(role, 'tournament_director'),
  canSubmit: (_role: Role) => true,
} as const
