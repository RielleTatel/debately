import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const TOURNAMENT_PERMISSIONS = {
  canCreate: (role: Role) => hasRole(role, 'tournament_director'),
  canEdit: (role: Role) => hasRole(role, 'tournament_director'),
  canDelete: (role: Role) => hasRole(role, 'org_admin'),
  canViewFinance: (role: Role) => hasRole(role, 'tournament_director'),
  canManageParticipants: (role: Role) => hasRole(role, 'tournament_director'),
} as const
