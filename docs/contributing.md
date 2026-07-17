# Contributing

## Branching

- `main` — production
- `feat/<name>` — feature branches
- `fix/<name>` — bug fixes

## Adding a Feature

1. Add domain types to `features/<domain>/types.ts`
2. Add Zod schemas to `features/<domain>/schemas/index.ts`
3. Add Prisma model to `prisma/schema.prisma`, then run `npm run db:migrate`
4. Implement repository in `features/<domain>/repositories/index.ts`
5. Implement service in `features/<domain>/services/index.ts`
6. Add server actions in `features/<domain>/actions/index.ts`
7. Add client query hooks in `features/<domain>/queries/index.ts`
8. Build components in `features/<domain>/components/`
9. Wire the page in `app/(dashboard)/...`

## Code Style

- TypeScript strict mode, no `any`
- Named exports; default exports only for page/layout components
- No comments except where the WHY is non-obvious
