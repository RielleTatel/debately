export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORG_ADMIN: 'org_admin',
  TOURNAMENT_DIRECTOR: 'tournament_director',
  ADJUDICATOR: 'adjudicator',
  PARTICIPANT: 'participant',
  GUEST: 'guest',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 100,
  org_admin: 80,
  tournament_director: 60,
  adjudicator: 40,
  participant: 20,
  guest: 0,
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}
