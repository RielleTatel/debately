# Database

## Provider

PostgreSQL via Supabase, managed with Prisma ORM.

## Key Models

| Model | Table | Purpose |
|-------|-------|---------|
| Profile | profiles | User profile extending Supabase Auth |
| Organization | organizations | Tenant unit; owns tournaments |
| Tournament | tournaments | A debate tournament |
| Institution | institutions | Participating schools / clubs |
| Team | teams | A competing team within a tournament |
| TournamentParticipant | tournament_participants | Speaker or swing in a tournament |
| Adjudicator | adjudicators | Judge assigned to a tournament |
| Round | rounds | A single debate round |
| Announcement | announcements | Published notices for a tournament |
| RegistrationRequest | registration_requests | Pending sign-up requests |
| Invoice | invoices | Fee records per tournament |
| ActivityLog | activity_logs | Immutable audit trail |
| Notification | notifications | In-app user notifications |
| Invitation | invitations | Email-based invite tokens |

## Migrations

Run `npm run db:migrate` to apply pending migrations in development.
Run `npx prisma migrate deploy` in CI/production.

## Seeding

`npm run db:seed` loads the seed script at `prisma/seed.ts`.
