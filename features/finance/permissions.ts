import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const FINANCE_PERMISSIONS = {
  canManage: (role: Role) => hasRole(role, 'tournament_director'),
  canViewReports: (role: Role) => hasRole(role, 'org_admin'),
} as const
