# Architecture

## Overview

Debately is a Next.js 15 App Router application organized around feature-based vertical slices.

## Layer Diagram

```
app/ (Routing & Pages)
        │
        ▼
features/ (Business Logic & UI)
    ┌──────────┬──────────┐
    │          │          │
  actions   queries   components
    │          │
    ▼          ▼
  services (business rules)
            │
            ▼
         lib/supabase
            │
            ▼
         Supabase
    ├── Auth
    ├── PostgreSQL (via Prisma)
    └── Storage
```

## Feature Modules

Each domain under `features/` follows this structure:

| Directory | Purpose |
|-----------|---------|
| `actions/` | Next.js Server Actions; validates input with Zod, delegates to service |
| `services/` | Business logic; no HTTP, no direct DB calls |
| `repositories/` | Prisma queries; no business logic |
| `queries/` | TanStack Query hooks for client-side data fetching |
| `components/` | Domain-specific React components |
| `hooks/` | Client-side hooks specific to this domain |
| `schemas/` | Zod schemas for input validation |
| `permissions.ts` | Role-based access checks |
| `types.ts` | TypeScript types for this domain |

## Key Conventions

- Pages in `app/` are thin: they read params, call a service or query, render a feature component
- Server Actions live in `features/*/actions/index.ts`, always `'use server'`
- Client components begin with `'use client'`; keep them as leaf nodes when possible
- All DB access goes through `features/*/repositories/` — never call Prisma from actions directly
