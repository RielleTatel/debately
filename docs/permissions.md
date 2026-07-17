# Permissions

## Roles (highest → lowest privilege)

| Role | Description |
|------|-------------|
| `super_admin` | Full platform access |
| `org_admin` | Full access within their organization |
| `tournament_director` | Manage tournaments they own |
| `adjudicator` | View draw, submit ballots |
| `participant` | View public info, manage own registration |
| `guest` | Public pages only |

## Role Hierarchy

Roles are checked via `hasRole(userRole, requiredRole)` in `lib/permissions.ts`.
A higher-ranked role always satisfies a lower-rank requirement.

## Feature-Level Permission Files

Each feature exports a `*_PERMISSIONS` object:

```ts
import { TOURNAMENT_PERMISSIONS } from '@/features/tournaments/permissions'

if (!TOURNAMENT_PERMISSIONS.canEdit(user.role)) throw Errors.forbidden()
```
