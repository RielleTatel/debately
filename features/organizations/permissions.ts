import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const ORGANIZATION_PERMISSIONS = {
  canCreate: (role: Role) => role === 'super_admin',
  canEdit: (role: Role) => hasRole(role, 'org_admin'),
  canDelete: (role: Role) => role === 'super_admin',
} as const
