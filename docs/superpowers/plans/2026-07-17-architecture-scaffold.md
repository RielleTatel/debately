# Debate SaaS Architecture Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold every file and directory in the debate tournament SaaS monorepo so the project type-checks and builds from a clean `git clone`.

**Architecture:** Feature-based vertical slices — each domain (`auth`, `tournaments`, `organizations`, etc.) owns its own `actions/`, `services/`, `repositories/`, `queries/`, `components/`, `hooks/`, `schemas/`, `permissions.ts`, and `types.ts`. App Router routes are thin shells that import from `features/`. Supabase handles auth and object storage; Prisma manages the PostgreSQL schema. Shared UI lives in `components/`; business-agnostic utilities live in `lib/` and `services/`.

**Tech Stack:** Next.js 15 (App Router, Turbopack), React 19, TypeScript 5.7, Tailwind CSS 4, shadcn/ui, Supabase JS v2 + `@supabase/ssr`, Prisma 6, Zod 3, React Hook Form 7, TanStack Query v5, `date-fns` 4, `lucide-react`

## Global Constraints

- All source files are `.ts` or `.tsx`; no `.js` files
- Page components are `export default function`; all other exports are named
- Every `page.tsx` renders a visible `<main>` with a single `<h1>` matching the route name
- Every stub `actions/index.ts` begins with `'use server';`
- Every stub `hooks/index.ts` begins with `'use client';`
- Supabase env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Prisma env var: `DATABASE_URL`
- TypeScript path alias `@/` maps to project root (configured in `tsconfig.json`)
- No empty files — every file exports at least one named symbol or default export

---

## File Map

### Config / Root
| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript config with `@/` alias |
| `next.config.ts` | Next.js config (Turbopack, image domains) |
| `.gitignore` | Standard Next.js ignores |
| `.env.local` | Environment variable template (not committed) |
| `components.json` | shadcn/ui registry config |
| `middleware.ts` | Supabase auth session refresh on every request |

### lib/
| File | Purpose |
|------|---------|
| `lib/env.ts` | Validated env var exports via Zod |
| `lib/utils.ts` | `cn()` class merge helper |
| `lib/errors.ts` | `AppError` class + typed error codes |
| `lib/constants.ts` | App-wide magic strings / limits |
| `lib/validation.ts` | Shared Zod refinements |
| `lib/auth.ts` | Server-side session helpers |
| `lib/permissions.ts` | Role hierarchy constants |
| `lib/supabase/client.ts` | Browser Supabase client (singleton) |
| `lib/supabase/server.ts` | Server-side Supabase client (per-request) |
| `lib/supabase/middleware.ts` | Session refresh helper used by root middleware |
| `lib/supabase/admin.ts` | Service-role admin client |

### types/
| File | Purpose |
|------|---------|
| `types/database.ts` | Prisma-derived DB row types |
| `types/api.ts` | Generic API response wrappers |
| `types/pagination.ts` | Cursor/offset pagination types |
| `types/auth.ts` | Session and user types |
| `types/common.ts` | Utility types used across features |

### hooks/
| File | Purpose |
|------|---------|
| `hooks/use-mobile.ts` | Breakpoint detection |
| `hooks/use-confirm.ts` | Imperative confirm dialog |
| `hooks/use-pagination.ts` | URL-synced pagination state |
| `hooks/use-debounce.ts` | Debounced value hook |

### prisma/
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Full database schema |
| `prisma/seed.ts` | Dev seed script |

### app/ (routing)
Every route file is a minimal stub that renders a heading. Layouts wrap `children`. API routes return JSON.

### components/
Each sub-directory gets an `index.ts` barrel re-exporting its contents. A single representative stub component lives in each.

### services/
Each sub-directory gets an `index.ts` with a typed service object.

### features/
Each feature gets the sub-directories listed in the spec; each sub-directory has an `index.ts` stub.

---

## Task 1: Project Config & Dependencies

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `.gitignore`
- Create: `.env.local`
- Create: `components.json`
- Create: `README.md`

**Interfaces:**
- Produces: runnable `npm install`; `npx tsc` resolves paths; `@/` alias works

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "debately",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@prisma/client": "^6.1.0",
    "@supabase/ssr": "^0.5.0",
    "@supabase/supabase-js": "^2.49.0",
    "@tanstack/react-query": "^5.62.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.469.0",
    "next": "^15.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.0",
    "tailwind-merge": "^2.5.5",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "^15.3.0",
    "prisma": "^6.1.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next.config.ts`**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 4: Create `.gitignore`**

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem
.env*.local

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# prisma
prisma/migrations/

# typescript
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 5: Create `.env.local`**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (Supabase PostgreSQL connection string)
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 6: Create `components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 7: Create `README.md`**

```md
# Debately

Debate tournament management SaaS.

## Development

\`\`\`bash
npm install
cp .env.local.example .env.local  # fill in Supabase credentials
npm run db:generate
npm run dev
\`\`\`

## Stack

- Next.js 15 (App Router)
- Supabase (auth + storage)
- Prisma + PostgreSQL
- shadcn/ui + Tailwind CSS 4
\`\`\`
```

- [ ] **Step 8: Install dependencies**

```bash
npm install
```
Expected: `added N packages` with no peer-dep errors.

- [ ] **Step 9: Commit**

```bash
git add package.json tsconfig.json next.config.ts .gitignore .env.local components.json README.md
git commit -m "chore: initialize project with Next.js 15 + Supabase + Prisma config"
```

---

## Task 2: lib/supabase — Supabase Clients

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `lib/supabase/admin.ts`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` env vars
- Produces: `createClient()` (browser), `createServerClient()` (server/RSC), `updateSession()` (middleware), `createAdminClient()` (service role)

- [ ] **Step 1: Create `lib/supabase/client.ts`**

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create `lib/supabase/server.ts`**

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 3: Create `lib/supabase/middleware.ts`**

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()
  return supabaseResponse
}
```

- [ ] **Step 4: Create `lib/supabase/admin.ts`**

```ts
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

- [ ] **Step 5: Verify type-check**

```bash
npm run type-check
```
Expected: no errors (or only "Cannot find module 'next'" until step 6 when app/ files exist — that's fine, skip if needed).

- [ ] **Step 6: Commit**

```bash
git add lib/supabase/
git commit -m "feat: add Supabase client helpers (browser, server, middleware, admin)"
```

---

## Task 3: lib/ — Core Utilities

**Files:**
- Create: `lib/env.ts`
- Create: `lib/utils.ts`
- Create: `lib/errors.ts`
- Create: `lib/constants.ts`
- Create: `lib/validation.ts`
- Create: `lib/auth.ts`
- Create: `lib/permissions.ts`

**Interfaces:**
- Consumes: `zod`, `clsx`, `tailwind-merge`, `lib/supabase/server.ts`
- Produces: `cn()`, `AppError`, `env`, `ROLES`, `getSession()`, `getCurrentUser()`

- [ ] **Step 1: Create `lib/env.ts`**

```ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})
```

- [ ] **Step 2: Create `lib/utils.ts`**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
```

- [ ] **Step 3: Create `lib/errors.ts`**

```ts
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 400
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export const Errors = {
  unauthorized: () => new AppError('UNAUTHORIZED', 'Not authenticated', 401),
  forbidden: () => new AppError('FORBIDDEN', 'Access denied', 403),
  notFound: (resource: string) =>
    new AppError('NOT_FOUND', `${resource} not found`, 404),
  conflict: (msg: string) => new AppError('CONFLICT', msg, 409),
  internal: () => new AppError('INTERNAL_ERROR', 'Internal server error', 500),
} as const
```

- [ ] **Step 4: Create `lib/constants.ts`**

```ts
export const APP_NAME = 'Debately'
export const APP_DESCRIPTION = 'Debate tournament management'

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

export const TOURNAMENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  REGISTRATION_OPEN: 'registration_open',
  REGISTRATION_CLOSED: 'registration_closed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const DEBATE_FORMATS = ['BP', 'AP', 'WSDC', 'CP', 'CUSTOM'] as const

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  tournaments: '/tournaments',
  organization: '/organization',
  account: '/account',
  settings: '/settings',
} as const
```

- [ ] **Step 5: Create `lib/validation.ts`**

```ts
import { z } from 'zod'

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number')

export const slugSchema = z
  .string()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed')

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

export const dateRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
}).refine((d) => d.to > d.from, { message: 'End date must be after start date' })
```

- [ ] **Step 6: Create `lib/auth.ts`**

```ts
import { createClient } from '@/lib/supabase/server'
import { Errors } from '@/lib/errors'

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw Errors.unauthorized()
  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  return user
}
```

- [ ] **Step 7: Create `lib/permissions.ts`**

```ts
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
```

- [ ] **Step 8: Commit**

```bash
git add lib/
git commit -m "feat: add lib utilities (env, utils, errors, constants, validation, auth, permissions)"
```

---

## Task 4: types/ and hooks/ Directories

**Files:**
- Create: `types/database.ts`
- Create: `types/api.ts`
- Create: `types/pagination.ts`
- Create: `types/auth.ts`
- Create: `types/common.ts`
- Create: `hooks/use-mobile.ts`
- Create: `hooks/use-confirm.ts`
- Create: `hooks/use-pagination.ts`
- Create: `hooks/use-debounce.ts`

**Interfaces:**
- Produces: `ApiResponse<T>`, `PaginatedResponse<T>`, `AuthUser`, `ID`, `useDebounce()`, `usePagination()`, `useMobile()`, `useConfirm()`

- [ ] **Step 1: Create `types/common.ts`**

```ts
export type ID = string

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export type WithTimestamps = {
  createdAt: Date
  updatedAt: Date
}

export type WithId = {
  id: ID
}

export type BaseEntity = WithId & WithTimestamps

export type Status = 'active' | 'inactive' | 'pending' | 'archived'
```

- [ ] **Step 2: Create `types/api.ts`**

```ts
export type ApiResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

export type ActionResult<T = void> = ApiResponse<T>

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data }
}

export function err(error: string, code?: string): ApiResponse<never> {
  return { success: false, error, code }
}
```

- [ ] **Step 3: Create `types/pagination.ts`**

```ts
export type PaginationMeta = {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}

export type PaginationParams = {
  page?: number
  pageSize?: number
}
```

- [ ] **Step 4: Create `types/auth.ts`**

```ts
import type { User } from '@supabase/supabase-js'
import type { Role } from '@/lib/permissions'

export type AuthUser = User

export type UserProfile = {
  id: string
  userId: string
  displayName: string
  avatarUrl: string | null
  role: Role
  organizationId: string | null
  createdAt: Date
  updatedAt: Date
}

export type SessionWithProfile = {
  user: AuthUser
  profile: UserProfile | null
}
```

- [ ] **Step 5: Create `types/database.ts`**

```ts
// Re-export Prisma-generated types once `prisma generate` has been run.
// Until then, these manual stubs satisfy imports.

export type Tournament = {
  id: string
  name: string
  slug: string
  format: string
  status: string
  organizationId: string
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

export type Organization = {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export type Team = {
  id: string
  name: string
  tournamentId: string
  institutionId: string | null
  createdAt: Date
  updatedAt: Date
}

export type Participant = {
  id: string
  userId: string
  tournamentId: string
  teamId: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}
```

- [ ] **Step 6: Create `hooks/use-debounce.ts`**

```ts
'use client'

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debouncedValue
}
```

- [ ] **Step 7: Create `hooks/use-mobile.ts`**

```ts
'use client'

import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 768

export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(mql.matches)
    mql.addEventListener('change', onChange)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
```

- [ ] **Step 8: Create `hooks/use-pagination.ts`**

```ts
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export function usePagination(defaultPageSize = 20) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = Number(searchParams.get('pageSize') ?? String(defaultPageSize))

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(newPage))
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return { page, pageSize, setPage }
}
```

- [ ] **Step 9: Create `hooks/use-confirm.ts`**

```ts
'use client'

import { useState, useCallback } from 'react'

type ConfirmState = {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
}

const defaultState: ConfirmState = {
  isOpen: false,
  title: '',
  description: '',
  onConfirm: () => {},
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>(defaultState)

  const confirm = useCallback(
    (title: string, description: string): Promise<boolean> =>
      new Promise((resolve) => {
        setState({
          isOpen: true,
          title,
          description,
          onConfirm: () => {
            setState(defaultState)
            resolve(true)
          },
        })
      }),
    []
  )

  const cancel = useCallback(() => {
    setState(defaultState)
  }, [])

  return { confirmState: state, confirm, cancel }
}
```

- [ ] **Step 10: Commit**

```bash
git add types/ hooks/
git commit -m "feat: add types and hooks stubs"
```

---

## Task 5: Prisma Schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`

**Interfaces:**
- Consumes: `DATABASE_URL` env var
- Produces: Prisma client types for all domain models

- [ ] **Step 1: Create `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Profile {
  id             String   @id @default(cuid())
  userId         String   @unique
  displayName    String
  avatarUrl      String?
  role           String   @default("participant")
  organizationId String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization  Organization?  @relation(fields: [organizationId], references: [id])
  tournaments   TournamentParticipant[]
  adjudications Adjudicator[]

  @@map("profiles")
}

model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  logoUrl     String?
  website     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members     Profile[]
  tournaments Tournament[]

  @@map("organizations")
}

model Institution {
  id        String   @id @default(cuid())
  name      String
  shortName String?
  country   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  teams         Team[]
  participants  TournamentParticipant[]

  @@map("institutions")
}

model Tournament {
  id             String   @id @default(cuid())
  name           String
  slug           String   @unique
  format         String   @default("BP")
  status         String   @default("draft")
  organizationId String
  startDate      DateTime
  endDate        DateTime
  registrationDeadline DateTime?
  maxTeams       Int?
  description    String?
  rulesUrl       String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id])
  teams          Team[]
  participants   TournamentParticipant[]
  adjudicators   Adjudicator[]
  rounds         Round[]
  announcements  Announcement[]
  requests       RegistrationRequest[]
  invoices       Invoice[]
  activityLogs   ActivityLog[]
  invitations    Invitation[]

  @@map("tournaments")
}

model Team {
  id            String   @id @default(cuid())
  name          String
  tournamentId  String
  institutionId String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tournament    Tournament  @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  institution   Institution? @relation(fields: [institutionId], references: [id])
  members       TournamentParticipant[]

  @@map("teams")
}

model TournamentParticipant {
  id            String   @id @default(cuid())
  profileId     String
  tournamentId  String
  teamId        String?
  institutionId String?
  role          String   @default("speaker")
  status        String   @default("pending")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  profile       Profile     @relation(fields: [profileId], references: [id])
  tournament    Tournament  @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  team          Team?       @relation(fields: [teamId], references: [id])
  institution   Institution? @relation(fields: [institutionId], references: [id])

  @@unique([profileId, tournamentId])
  @@map("tournament_participants")
}

model Adjudicator {
  id           String   @id @default(cuid())
  profileId    String
  tournamentId String
  status       String   @default("pending")
  score        Float?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  profile      Profile    @relation(fields: [profileId], references: [id])
  tournament   Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)

  @@unique([profileId, tournamentId])
  @@map("adjudicators")
}

model Round {
  id           String   @id @default(cuid())
  tournamentId String
  number       Int
  status       String   @default("pending")
  motionId     String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tournament   Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)

  @@unique([tournamentId, number])
  @@map("rounds")
}

model Announcement {
  id           String   @id @default(cuid())
  tournamentId String
  title        String
  body         String
  publishedAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tournament   Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)

  @@map("announcements")
}

model RegistrationRequest {
  id           String   @id @default(cuid())
  tournamentId String
  requesterEmail String
  type         String
  status       String   @default("pending")
  notes        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tournament   Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)

  @@map("registration_requests")
}

model Invoice {
  id           String   @id @default(cuid())
  tournamentId String
  recipientEmail String
  amount       Float
  currency     String   @default("USD")
  status       String   @default("unpaid")
  dueDate      DateTime?
  paidAt       DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tournament   Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)

  @@map("invoices")
}

model ActivityLog {
  id           String   @id @default(cuid())
  tournamentId String?
  actorId      String?
  action       String
  resourceType String
  resourceId   String?
  metadata     Json?
  createdAt    DateTime @default(now())

  tournament   Tournament? @relation(fields: [tournamentId], references: [id])

  @@map("activity_logs")
}

model Notification {
  id         String   @id @default(cuid())
  userId     String
  type       String
  title      String
  body       String
  readAt     DateTime?
  data       Json?
  createdAt  DateTime @default(now())

  @@map("notifications")
}

model Invitation {
  id           String   @id @default(cuid())
  tournamentId String?
  email        String
  role         String
  token        String   @unique @default(cuid())
  expiresAt    DateTime
  acceptedAt   DateTime?
  createdAt    DateTime @default(now())

  tournament   Tournament? @relation(fields: [tournamentId], references: [id])

  @@map("invitations")
}
```

- [ ] **Step 2: Create `prisma/seed.ts`**

```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const org = await prisma.organization.upsert({
    where: { slug: 'demo-org' },
    update: {},
    create: {
      name: 'Demo Organization',
      slug: 'demo-org',
    },
  })

  console.log('Created organization:', org.name)
  console.log('Seed complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 3: Generate Prisma client**

```bash
npm run db:generate
```
Expected: `✔ Generated Prisma Client` (or a connection error if DATABASE_URL is a template — that's fine, the schema is valid)

- [ ] **Step 4: Commit**

```bash
git add prisma/
git commit -m "feat: add Prisma schema with all domain models"
```

---

## Task 6: App Root + (marketing) Routes

**Files:**
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `app/error.tsx`
- Create: `app/not-found.tsx`
- Create: `app/(marketing)/page.tsx`
- Create: `app/(marketing)/about/page.tsx`
- Create: `app/(marketing)/pricing/page.tsx`
- Create: `app/(marketing)/features/page.tsx`
- Create: `app/(marketing)/contact/page.tsx`
- Create: `middleware.ts`

**Interfaces:**
- Consumes: `lib/supabase/middleware.ts → updateSession()`
- Produces: root layout HTML shell; marketing pages

- [ ] **Step 1: Create `app/globals.css`**

```css
@import "tailwindcss";

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}

* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

- [ ] **Step 2: Create `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Debately', template: '%s | Debately' },
  description: 'Debate tournament management platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Create `app/error.tsx`**

```tsx
'use client'

import { useEffect } from 'react'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <button
        onClick={reset}
        className="rounded bg-primary px-4 py-2 text-primary-foreground"
      >
        Try again
      </button>
    </main>
  )
}
```

- [ ] **Step 4: Create `app/not-found.tsx`**

```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Link href="/" className="text-primary underline">
        Return home
      </Link>
    </main>
  )
}
```

- [ ] **Step 5: Create `app/(marketing)/page.tsx`**

```tsx
export default function MarketingHomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-5xl font-bold">Debately</h1>
      <p className="mt-4 text-xl text-muted-foreground">
        Debate tournament management for everyone
      </p>
    </main>
  )
}
```

- [ ] **Step 6: Create remaining marketing pages**

`app/(marketing)/about/page.tsx`:
```tsx
export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold">About</h1>
    </main>
  )
}
```

`app/(marketing)/pricing/page.tsx`:
```tsx
export default function PricingPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold">Pricing</h1>
    </main>
  )
}
```

`app/(marketing)/features/page.tsx`:
```tsx
export default function FeaturesPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold">Features</h1>
    </main>
  )
}
```

`app/(marketing)/contact/page.tsx`:
```tsx
export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold">Contact</h1>
    </main>
  )
}
```

- [ ] **Step 7: Create `middleware.ts`**

```ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 8: Commit**

```bash
git add app/globals.css app/layout.tsx app/error.tsx app/not-found.tsx "app/(marketing)/" middleware.ts
git commit -m "feat: add root layout, error/404 pages, and marketing route stubs"
```

---

## Task 7: (auth) and (dashboard) Routes

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`
- Create: `app/(auth)/forgot-password/page.tsx`
- Create: `app/(auth)/verify-email/page.tsx`
- Create: `app/(auth)/invite/page.tsx`
- Create: `app/(dashboard)/layout.tsx`
- Create: `app/(dashboard)/page.tsx`
- Create: `app/(dashboard)/tournaments/page.tsx`
- Create: `app/(dashboard)/tournaments/create/page.tsx`
- Create: `app/(dashboard)/tournaments/[tournamentId]/page.tsx`
- Create: `app/(dashboard)/tournaments/[tournamentId]/settings/page.tsx`
- Create: `app/(dashboard)/tournaments/[tournamentId]/institutions/page.tsx`
- Create: `app/(dashboard)/tournaments/[tournamentId]/teams/page.tsx`
- Create: `app/(dashboard)/tournaments/[tournamentId]/participants/page.tsx`
- Create: `app/(dashboard)/tournaments/[tournamentId]/adjudicators/page.tsx`
- Create: `app/(dashboard)/tournaments/[tournamentId]/finance/page.tsx`
- Create: `app/(dashboard)/tournaments/[tournamentId]/announcements/page.tsx`
- Create: `app/(dashboard)/tournaments/[tournamentId]/requests/page.tsx`
- Create: `app/(dashboard)/tournaments/[tournamentId]/activity/page.tsx`
- Create: `app/(dashboard)/tournaments/[tournamentId]/exports/page.tsx`
- Create: `app/(dashboard)/organization/page.tsx`
- Create: `app/(dashboard)/account/page.tsx`
- Create: `app/(dashboard)/settings/page.tsx`

**Interfaces:**
- Consumes: nothing from features yet (stubs only)
- Produces: all route segments Next.js needs to resolve paths

- [ ] **Step 1: Create auth pages**

`app/(auth)/login/page.tsx`:
```tsx
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Log in</h1>
    </main>
  )
}
```

`app/(auth)/register/page.tsx`:
```tsx
export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Create account</h1>
    </main>
  )
}
```

`app/(auth)/forgot-password/page.tsx`:
```tsx
export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Reset password</h1>
    </main>
  )
}
```

`app/(auth)/verify-email/page.tsx`:
```tsx
export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Verify your email</h1>
    </main>
  )
}
```

`app/(auth)/invite/page.tsx`:
```tsx
export default function InvitePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Accept invitation</h1>
    </main>
  )
}
```

- [ ] **Step 2: Create `app/(dashboard)/layout.tsx`**

```tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40 p-4">
        <p className="text-sm font-medium text-muted-foreground">Sidebar</p>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Create dashboard index + top-level pages**

`app/(dashboard)/page.tsx`:
```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
    </div>
  )
}
```

`app/(dashboard)/organization/page.tsx`:
```tsx
export default function OrganizationPage() {
  return <h1 className="text-2xl font-bold">Organization</h1>
}
```

`app/(dashboard)/account/page.tsx`:
```tsx
export default function AccountPage() {
  return <h1 className="text-2xl font-bold">Account</h1>
}
```

`app/(dashboard)/settings/page.tsx`:
```tsx
export default function SettingsPage() {
  return <h1 className="text-2xl font-bold">Settings</h1>
}
```

- [ ] **Step 4: Create tournament list + create pages**

`app/(dashboard)/tournaments/page.tsx`:
```tsx
export default function TournamentsPage() {
  return <h1 className="text-2xl font-bold">Tournaments</h1>
}
```

`app/(dashboard)/tournaments/create/page.tsx`:
```tsx
export default function CreateTournamentPage() {
  return <h1 className="text-2xl font-bold">Create Tournament</h1>
}
```

- [ ] **Step 5: Create `[tournamentId]` pages**

`app/(dashboard)/tournaments/[tournamentId]/page.tsx`:
```tsx
type Params = Promise<{ tournamentId: string }>

export default async function TournamentOverviewPage({ params }: { params: Params }) {
  const { tournamentId } = await params
  return <h1 className="text-2xl font-bold">Tournament {tournamentId}</h1>
}
```

Use this same pattern for all sub-pages — replace the heading text with the section name:

`settings/page.tsx` → `Tournament Settings`
`institutions/page.tsx` → `Institutions`
`teams/page.tsx` → `Teams`
`participants/page.tsx` → `Participants`
`adjudicators/page.tsx` → `Adjudicators`
`finance/page.tsx` → `Finance`
`announcements/page.tsx` → `Announcements`
`requests/page.tsx` → `Requests`
`activity/page.tsx` → `Activity`
`exports/page.tsx` → `Exports`

Each file:
```tsx
type Params = Promise<{ tournamentId: string }>

export default async function <SectionName>Page({ params }: { params: Params }) {
  const { tournamentId } = await params
  return <h1 className="text-2xl font-bold"><SectionName></h1>
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```
Expected: `✓ Compiled successfully` with all routes listed. Fix any TypeScript errors before continuing.

- [ ] **Step 7: Commit**

```bash
git add "app/(auth)/" "app/(dashboard)/"
git commit -m "feat: add auth and dashboard route stubs"
```

---

## Task 8: API Routes

**Files:**
- Create: `app/api/health/route.ts`
- Create: `app/api/webhooks/route.ts`

**Interfaces:**
- Produces: `GET /api/health` → `{ status: "ok" }`, `POST /api/webhooks` → 200

- [ ] **Step 1: Create `app/api/health/route.ts`**

```ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}
```

- [ ] **Step 2: Create `app/api/webhooks/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  console.log('[webhook]', body)
  return NextResponse.json({ received: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/
git commit -m "feat: add health check and webhooks API routes"
```

---

## Task 9: Shared components/ Directory

**Files:**
- Create: `components/ui/index.ts` (barrel)
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/badge.tsx`
- Create: `components/layout/index.ts`
- Create: `components/layout/page-header.tsx`
- Create: `components/navigation/index.ts`
- Create: `components/navigation/nav-link.tsx`
- Create: `components/forms/index.ts`
- Create: `components/forms/form-field.tsx`
- Create: `components/data-table/index.ts`
- Create: `components/data-table/data-table.tsx`
- Create: `components/dialogs/index.ts`
- Create: `components/dialogs/confirm-dialog.tsx`
- Create: `components/empty-state/index.ts`
- Create: `components/empty-state/empty-state.tsx`
- Create: `components/loading/index.ts`
- Create: `components/loading/spinner.tsx`
- Create: `components/shared/index.ts`

**Interfaces:**
- Consumes: `lib/utils.ts → cn()`
- Produces: primitive UI components for feature modules to import

- [ ] **Step 1: Create `components/ui/button.tsx`**

```tsx
import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'default' | 'destructive' | 'outline' | 'ghost' | 'link'
type Size = 'default' | 'sm' | 'lg' | 'icon'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
}

const sizeClasses: Record<Size, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
)
Button.displayName = 'Button'
```

- [ ] **Step 2: Create `components/ui/input.tsx`**

```tsx
import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
        'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
```

- [ ] **Step 3: Create `components/ui/badge.tsx`**

```tsx
import { cn } from '@/lib/utils'

type Variant = 'default' | 'secondary' | 'destructive' | 'outline'

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }

const variantClasses: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
  outline: 'text-foreground border',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 4: Create `components/ui/index.ts`**

```ts
export { Button } from './button'
export { Input } from './input'
export { Badge } from './badge'
```

- [ ] **Step 5: Create `components/layout/page-header.tsx`**

```tsx
type PageHeaderProps = {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
```

- [ ] **Step 6: Create `components/layout/index.ts`**

```ts
export { PageHeader } from './page-header'
```

- [ ] **Step 7: Create `components/navigation/nav-link.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type NavLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
}

export function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground font-medium'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        className
      )}
    >
      {children}
    </Link>
  )
}
```

- [ ] **Step 8: Create `components/navigation/index.ts`**

```ts
export { NavLink } from './nav-link'
```

- [ ] **Step 9: Create `components/empty-state/empty-state.tsx`**

```tsx
type EmptyStateProps = {
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
```

- [ ] **Step 10: Create `components/empty-state/index.ts`**

```ts
export { EmptyState } from './empty-state'
```

- [ ] **Step 11: Create `components/loading/spinner.tsx`**

```tsx
import { cn } from '@/lib/utils'

type SpinnerProps = { className?: string; size?: 'sm' | 'md' | 'lg' }

const sizeClasses = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  return (
    <div
      role="status"
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
```

- [ ] **Step 12: Create `components/loading/index.ts`**

```ts
export { Spinner } from './spinner'
```

- [ ] **Step 13: Create forms, data-table, dialogs, shared stubs**

`components/forms/form-field.tsx`:
```tsx
type FormFieldProps = {
  label: string
  error?: string
  children: React.ReactNode
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
```

`components/forms/index.ts`:
```ts
export { FormField } from './form-field'
```

`components/data-table/data-table.tsx`:
```tsx
type DataTableProps<T> = {
  data: T[]
  columns: { key: keyof T; header: string }[]
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
}: DataTableProps<T>) {
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th key={String(col.key)} className="px-4 py-3 text-left font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3">
                  {String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

`components/data-table/index.ts`:
```ts
export { DataTable } from './data-table'
```

`components/dialogs/confirm-dialog.tsx`:
```tsx
'use client'

import { Button } from '@/components/ui/button'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-background p-6 shadow-lg">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  )
}
```

`components/dialogs/index.ts`:
```ts
export { ConfirmDialog } from './confirm-dialog'
```

`components/shared/index.ts`:
```ts
// Shared cross-cutting components — add exports here as they are created
export {}
```

- [ ] **Step 14: Type-check**

```bash
npm run type-check
```
Expected: no errors.

- [ ] **Step 15: Commit**

```bash
git add components/
git commit -m "feat: add shared component stubs (ui, layout, navigation, data-table, dialogs, empty-state, loading)"
```

---

## Task 10: services/ Directory

**Files:**
- Create: `services/email/index.ts`
- Create: `services/storage/index.ts`
- Create: `services/csv/index.ts`
- Create: `services/logger/index.ts`
- Create: `services/notifications/index.ts`

**Interfaces:**
- Produces: typed service objects; used by `features/*/services/`

- [ ] **Step 1: Create `services/logger/index.ts`**

```ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type LogContext = Record<string, unknown>

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = { level, message, timestamp: new Date().toISOString(), ...context }
  if (level === 'error') {
    console.error(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => log('debug', msg, ctx),
  info: (msg: string, ctx?: LogContext) => log('info', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => log('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext) => log('error', msg, ctx),
}
```

- [ ] **Step 2: Create `services/email/index.ts`**

```ts
import { logger } from '@/services/logger'

type EmailPayload = {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export const emailService = {
  async send(payload: EmailPayload): Promise<void> {
    // TODO: integrate with email provider (Resend, SendGrid, etc.)
    logger.info('Email queued', { to: payload.to, subject: payload.subject })
  },

  async sendWelcome(to: string, name: string): Promise<void> {
    await emailService.send({
      to,
      subject: 'Welcome to Debately',
      html: `<p>Hi ${name}, welcome!</p>`,
      text: `Hi ${name}, welcome!`,
    })
  },

  async sendInvitation(to: string, tournamentName: string, inviteUrl: string): Promise<void> {
    await emailService.send({
      to,
      subject: `You're invited to ${tournamentName}`,
      html: `<p>You have been invited. <a href="${inviteUrl}">Accept invitation</a></p>`,
    })
  },
}
```

- [ ] **Step 3: Create `services/storage/index.ts`**

```ts
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'debately-uploads'

export const storageService = {
  async upload(path: string, file: File): Promise<string> {
    const supabase = createAdminClient()
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  },

  async remove(path: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) throw error
  },

  getPublicUrl(path: string): string {
    const supabase = createAdminClient()
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  },
}
```

- [ ] **Step 4: Create `services/csv/index.ts`**

```ts
type CsvRow = Record<string, string | number | boolean | null>

export const csvService = {
  stringify(rows: CsvRow[]): string {
    if (rows.length === 0) return ''
    const headers = Object.keys(rows[0])
    const lines = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = String(row[h] ?? '')
            return val.includes(',') ? `"${val.replace(/"/g, '""')}"` : val
          })
          .join(',')
      ),
    ]
    return lines.join('\n')
  },

  parse(csv: string): CsvRow[] {
    const lines = csv.trim().split('\n')
    if (lines.length < 2) return []
    const headers = lines[0].split(',')
    return lines.slice(1).map((line) => {
      const values = line.split(',')
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
    })
  },
}
```

- [ ] **Step 5: Create `services/notifications/index.ts`**

```ts
import { logger } from '@/services/logger'

type NotificationType = 'announcement' | 'invitation' | 'status_change' | 'reminder'

type NotificationPayload = {
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
}

export const notificationService = {
  async send(payload: NotificationPayload): Promise<void> {
    // TODO: persist to DB + push via websockets/SSE
    logger.info('Notification sent', { userId: payload.userId, type: payload.type })
  },

  async sendToMany(userIds: string[], payload: Omit<NotificationPayload, 'userId'>): Promise<void> {
    await Promise.all(userIds.map((userId) => notificationService.send({ ...payload, userId })))
  },
}
```

- [ ] **Step 6: Commit**

```bash
git add services/
git commit -m "feat: add service stubs (email, storage, csv, logger, notifications)"
```

---

## Task 11: features/auth + features/tournaments

These are the two most complex features; their structure becomes the pattern for all remaining features.

**Files for `features/auth/`:**
- `actions/index.ts`, `services/index.ts`, `components/index.ts`, `hooks/index.ts`, `schemas/index.ts`, `queries/index.ts`, `permissions.ts`, `types.ts`

**Files for `features/tournaments/`:**
- `actions/index.ts`, `services/index.ts`, `repositories/index.ts`, `queries/index.ts`, `components/index.ts`, `hooks/index.ts`, `schemas/index.ts`, `permissions.ts`, `types.ts`

- [ ] **Step 1: Create `features/auth/types.ts`**

```ts
import type { UserProfile } from '@/types/auth'

export type { UserProfile }

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  email: string
  password: string
  displayName: string
}

export type ForgotPasswordInput = {
  email: string
}

export type ResetPasswordInput = {
  token: string
  password: string
}
```

- [ ] **Step 2: Create `features/auth/schemas/index.ts`**

```ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2).max(60),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
```

- [ ] **Step 3: Create `features/auth/permissions.ts`**

```ts
import type { Role } from '@/lib/permissions'

export const AUTH_PERMISSIONS = {
  canManageUsers: (role: Role) => role === 'super_admin' || role === 'org_admin',
  canInviteMembers: (role: Role) =>
    role === 'super_admin' || role === 'org_admin' || role === 'tournament_director',
} as const
```

- [ ] **Step 4: Create `features/auth/services/index.ts`**

```ts
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { LoginInput, RegisterInput } from '@/features/auth/types'

export const authService = {
  async signIn({ email, password }: LoginInput) {
    const supabase = await createClient()
    return supabase.auth.signInWithPassword({ email, password })
  },

  async signUp({ email, password, displayName }: RegisterInput) {
    const supabase = await createClient()
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
  },

  async signOut() {
    const supabase = await createClient()
    return supabase.auth.signOut()
  },

  async sendPasswordReset(email: string) {
    const supabase = await createClient()
    return supabase.auth.resetPasswordForEmail(email)
  },

  async deleteUser(userId: string) {
    const admin = createAdminClient()
    return admin.auth.admin.deleteUser(userId)
  },
}
```

- [ ] **Step 5: Create `features/auth/actions/index.ts`**

```ts
'use server'

import { redirect } from 'next/navigation'
import { authService } from '@/features/auth/services'
import { loginSchema, registerSchema, forgotPasswordSchema } from '@/features/auth/schemas'
import type { ActionResult } from '@/types/api'
import { ok, err } from '@/types/api'

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')

  const { error } = await authService.signIn(parsed.data)
  if (error) return err(error.message)

  redirect('/dashboard')
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName'),
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')

  const { error } = await authService.signUp(parsed.data)
  if (error) return err(error.message)

  redirect('/verify-email')
}

export async function forgotPasswordAction(formData: FormData): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return err(parsed.error.errors[0].message)

  await authService.sendPasswordReset(parsed.data.email)
  return ok(undefined)
}

export async function signOutAction(): Promise<void> {
  await authService.signOut()
  redirect('/login')
}
```

- [ ] **Step 6: Create `features/auth/queries/index.ts`**

```ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export const authKeys = {
  session: () => ['auth', 'session'] as const,
  user: () => ['auth', 'user'] as const,
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
  })
}
```

- [ ] **Step 7: Create `features/auth/hooks/index.ts`**

```ts
'use client'

export { useCurrentUser } from '@/features/auth/queries'
```

- [ ] **Step 8: Create `features/auth/components/index.ts`**

```ts
// Auth UI components — add exports here as components are built
export {}
```

- [ ] **Step 9: Create `features/tournaments/types.ts`**

```ts
import type { Tournament } from '@/types/database'
import { TOURNAMENT_STATUS, DEBATE_FORMATS } from '@/lib/constants'

export type { Tournament }

export type TournamentStatus = (typeof TOURNAMENT_STATUS)[keyof typeof TOURNAMENT_STATUS]

export type DebateFormat = (typeof DEBATE_FORMATS)[number]

export type CreateTournamentInput = {
  name: string
  format: DebateFormat
  startDate: Date
  endDate: Date
  organizationId: string
  maxTeams?: number
  description?: string
}

export type UpdateTournamentInput = Partial<CreateTournamentInput> & { id: string }

export type TournamentWithCounts = Tournament & {
  _count: {
    teams: number
    participants: number
    adjudicators: number
  }
}
```

- [ ] **Step 10: Create `features/tournaments/schemas/index.ts`**

```ts
import { z } from 'zod'
import { DEBATE_FORMATS } from '@/lib/constants'

export const createTournamentSchema = z.object({
  name: z.string().min(3).max(120),
  format: z.enum(DEBATE_FORMATS),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  maxTeams: z.coerce.number().int().positive().optional(),
  description: z.string().max(2000).optional(),
}).refine((d) => d.endDate > d.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

export const updateTournamentSchema = createTournamentSchema.partial().extend({
  id: z.string().cuid(),
})
```

- [ ] **Step 11: Create `features/tournaments/permissions.ts`**

```ts
import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const TOURNAMENT_PERMISSIONS = {
  canCreate: (role: Role) => hasRole(role, 'tournament_director'),
  canEdit: (role: Role) => hasRole(role, 'tournament_director'),
  canDelete: (role: Role) => hasRole(role, 'org_admin'),
  canViewFinance: (role: Role) => hasRole(role, 'tournament_director'),
  canManageParticipants: (role: Role) => hasRole(role, 'tournament_director'),
} as const
```

- [ ] **Step 12: Create `features/tournaments/repositories/index.ts`**

```ts
import { PrismaClient } from '@prisma/client'
import type { CreateTournamentInput, UpdateTournamentInput } from '@/features/tournaments/types'

const prisma = new PrismaClient()

export const tournamentRepository = {
  async findAll(organizationId: string) {
    return prisma.tournament.findMany({
      where: { organizationId },
      orderBy: { startDate: 'desc' },
    })
  },

  async findById(id: string) {
    return prisma.tournament.findUnique({ where: { id } })
  },

  async findBySlug(slug: string) {
    return prisma.tournament.findUnique({ where: { slug } })
  },

  async create(data: CreateTournamentInput) {
    return prisma.tournament.create({
      data: {
        ...data,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      },
    })
  },

  async update({ id, ...data }: UpdateTournamentInput) {
    return prisma.tournament.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.tournament.delete({ where: { id } })
  },
}
```

- [ ] **Step 13: Create `features/tournaments/services/index.ts`**

```ts
import { tournamentRepository } from '@/features/tournaments/repositories'
import { Errors } from '@/lib/errors'
import type { CreateTournamentInput, UpdateTournamentInput } from '@/features/tournaments/types'

export const tournamentService = {
  async list(organizationId: string) {
    return tournamentRepository.findAll(organizationId)
  },

  async getById(id: string) {
    const tournament = await tournamentRepository.findById(id)
    if (!tournament) throw Errors.notFound('Tournament')
    return tournament
  },

  async create(input: CreateTournamentInput) {
    return tournamentRepository.create(input)
  },

  async update(input: UpdateTournamentInput) {
    await tournamentService.getById(input.id)
    return tournamentRepository.update(input)
  },

  async delete(id: string) {
    await tournamentService.getById(id)
    return tournamentRepository.delete(id)
  },
}
```

- [ ] **Step 14: Create `features/tournaments/actions/index.ts`**

```ts
'use server'

import { tournamentService } from '@/features/tournaments/services'
import { createTournamentSchema, updateTournamentSchema } from '@/features/tournaments/schemas'
import { requireAuth } from '@/lib/auth'
import { ok, err } from '@/types/api'
import type { ActionResult } from '@/types/api'
import type { Tournament } from '@/features/tournaments/types'

export async function createTournamentAction(
  formData: FormData
): Promise<ActionResult<Tournament>> {
  await requireAuth()

  const parsed = createTournamentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')

  try {
    const tournament = await tournamentService.create({
      ...parsed.data,
      organizationId: String(formData.get('organizationId')),
    })
    return ok(tournament)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Failed to create tournament')
  }
}

export async function deleteTournamentAction(id: string): Promise<ActionResult> {
  await requireAuth()
  try {
    await tournamentService.delete(id)
    return ok(undefined)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Failed to delete tournament')
  }
}
```

- [ ] **Step 15: Create `features/tournaments/queries/index.ts`**

```ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const tournamentKeys = {
  all: (orgId: string) => ['tournaments', orgId] as const,
  detail: (id: string) => ['tournaments', 'detail', id] as const,
}

export function useTournaments(organizationId: string) {
  return useQuery({
    queryKey: tournamentKeys.all(organizationId),
    queryFn: async () => {
      const res = await fetch(`/api/tournaments?orgId=${organizationId}`)
      return res.json()
    },
    enabled: !!organizationId,
  })
}
```

- [ ] **Step 16: Create remaining tournaments stubs**

`features/tournaments/hooks/index.ts`:
```ts
'use client'

export { useTournaments } from '@/features/tournaments/queries'
```

`features/tournaments/components/index.ts`:
```ts
// Tournament UI components — add exports here as components are built
export {}
```

- [ ] **Step 17: Commit**

```bash
git add features/auth/ features/tournaments/
git commit -m "feat: add auth and tournaments feature modules with full vertical slice stubs"
```

---

## Task 12: Remaining Feature Modules

Create the sub-directory stubs for the 11 remaining features. Each follows the same pattern.

**Features to scaffold:**
`organizations`, `institutions`, `teams`, `participants`, `adjudicators`, `finance`, `announcements`, `requests`, `notifications`, `invitations`, `dashboard`, `activity-log`

For each feature, create these files using the templates below:

### Template A — Feature with repositories (organizations, institutions, teams, participants, adjudicators, finance)

**`features/<name>/types.ts`:**
```ts
// Types for the <Name> domain
export type <Name>Id = string
```

**`features/<name>/schemas/index.ts`:**
```ts
import { z } from 'zod'

export const create<Name>Schema = z.object({
  name: z.string().min(1),
})
```

**`features/<name>/permissions.ts`:**
```ts
import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const <NAME>_PERMISSIONS = {
  canManage: (role: Role) => hasRole(role, 'tournament_director'),
} as const
```

**`features/<name>/repositories/index.ts`:**
```ts
// Data access for <Name> — implement with Prisma
export const <name>Repository = {}
```

**`features/<name>/services/index.ts`:**
```ts
// Business logic for <Name>
export const <name>Service = {}
```

**`features/<name>/actions/index.ts`:**
```ts
'use server'

// Server actions for <Name>
```

**`features/<name>/queries/index.ts`:**
```ts
'use client'

// React Query hooks for <Name>
```

**`features/<name>/components/index.ts`:**
```ts
// <Name> UI components
export {}
```

**`features/<name>/hooks/index.ts`:**
```ts
'use client'

// <Name> hooks
```

### Template B — Feature without repositories (announcements, requests, notifications, invitations, dashboard, activity-log)

Same as Template A but omit `repositories/index.ts`.

- [ ] **Step 1: Scaffold `features/organizations/`**

`features/organizations/types.ts`:
```ts
export type OrganizationId = string

export type CreateOrganizationInput = {
  name: string
  slug: string
  website?: string
}
```

`features/organizations/schemas/index.ts`:
```ts
import { z } from 'zod'
import { slugSchema } from '@/lib/validation'

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(120),
  slug: slugSchema,
  website: z.string().url().optional().or(z.literal('')),
})
```

`features/organizations/permissions.ts`:
```ts
import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const ORGANIZATION_PERMISSIONS = {
  canCreate: (role: Role) => role === 'super_admin',
  canEdit: (role: Role) => hasRole(role, 'org_admin'),
  canDelete: (role: Role) => role === 'super_admin',
} as const
```

`features/organizations/repositories/index.ts`:
```ts
export const organizationRepository = {}
```

`features/organizations/services/index.ts`:
```ts
export const organizationService = {}
```

`features/organizations/actions/index.ts`:
```ts
'use server'
```

`features/organizations/queries/index.ts`:
```ts
'use client'
```

`features/organizations/components/index.ts`:
```ts
export {}
```

- [ ] **Step 2: Scaffold `features/institutions/`**

`features/institutions/types.ts`:
```ts
export type InstitutionId = string

export type CreateInstitutionInput = {
  name: string
  shortName?: string
  country?: string
}
```

`features/institutions/schemas/index.ts`:
```ts
import { z } from 'zod'

export const createInstitutionSchema = z.object({
  name: z.string().min(2).max(120),
  shortName: z.string().max(20).optional(),
  country: z.string().length(2).optional(),
})
```

`features/institutions/permissions.ts`:
```ts
import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const INSTITUTION_PERMISSIONS = {
  canManage: (role: Role) => hasRole(role, 'tournament_director'),
} as const
```

`features/institutions/repositories/index.ts`:
```ts
export const institutionRepository = {}
```

`features/institutions/services/index.ts`:
```ts
export const institutionService = {}
```

`features/institutions/actions/index.ts`:
```ts
'use server'
```

`features/institutions/queries/index.ts`:
```ts
'use client'
```

`features/institutions/components/index.ts`:
```ts
export {}
```

- [ ] **Step 3: Scaffold `features/teams/`**

`features/teams/types.ts`:
```ts
import type { Team } from '@/types/database'

export type { Team }

export type CreateTeamInput = {
  name: string
  tournamentId: string
  institutionId?: string
}
```

`features/teams/schemas/index.ts`:
```ts
import { z } from 'zod'

export const createTeamSchema = z.object({
  name: z.string().min(1).max(80),
  tournamentId: z.string().cuid(),
  institutionId: z.string().cuid().optional(),
})
```

`features/teams/permissions.ts`:
```ts
import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const TEAM_PERMISSIONS = {
  canManage: (role: Role) => hasRole(role, 'tournament_director'),
} as const
```

`features/teams/repositories/index.ts`:
```ts
export const teamRepository = {}
```

`features/teams/services/index.ts`:
```ts
export const teamService = {}
```

`features/teams/actions/index.ts`:
```ts
'use server'
```

`features/teams/queries/index.ts`:
```ts
'use client'
```

`features/teams/components/index.ts`:
```ts
export {}
```

- [ ] **Step 4: Scaffold `features/participants/`**

`features/participants/types.ts`:
```ts
import type { Participant } from '@/types/database'

export type { Participant }

export type RegisterParticipantInput = {
  userId: string
  tournamentId: string
  teamId?: string
  institutionId?: string
  role?: 'speaker' | 'swing'
}
```

`features/participants/schemas/index.ts`:
```ts
import { z } from 'zod'

export const registerParticipantSchema = z.object({
  userId: z.string().cuid(),
  tournamentId: z.string().cuid(),
  teamId: z.string().cuid().optional(),
  institutionId: z.string().cuid().optional(),
  role: z.enum(['speaker', 'swing']).default('speaker'),
})
```

`features/participants/permissions.ts`:
```ts
import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const PARTICIPANT_PERMISSIONS = {
  canManage: (role: Role) => hasRole(role, 'tournament_director'),
  canRegisterSelf: (_role: Role) => true,
} as const
```

`features/participants/repositories/index.ts`:
```ts
export const participantRepository = {}
```

`features/participants/services/index.ts`:
```ts
export const participantService = {}
```

`features/participants/actions/index.ts`:
```ts
'use server'
```

`features/participants/queries/index.ts`:
```ts
'use client'
```

`features/participants/components/index.ts`:
```ts
export {}
```

- [ ] **Step 5: Scaffold `features/adjudicators/`**

`features/adjudicators/types.ts`:
```ts
export type AdjudicatorId = string

export type RegisterAdjudicatorInput = {
  userId: string
  tournamentId: string
  score?: number
}
```

`features/adjudicators/schemas/index.ts`:
```ts
import { z } from 'zod'

export const registerAdjudicatorSchema = z.object({
  userId: z.string().cuid(),
  tournamentId: z.string().cuid(),
  score: z.number().min(0).max(100).optional(),
})
```

`features/adjudicators/permissions.ts`:
```ts
import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const ADJUDICATOR_PERMISSIONS = {
  canManage: (role: Role) => hasRole(role, 'tournament_director'),
  canRegisterSelf: (_role: Role) => true,
} as const
```

`features/adjudicators/repositories/index.ts`:
```ts
export const adjudicatorRepository = {}
```

`features/adjudicators/services/index.ts`:
```ts
export const adjudicatorService = {}
```

`features/adjudicators/actions/index.ts`:
```ts
'use server'
```

`features/adjudicators/queries/index.ts`:
```ts
'use client'
```

`features/adjudicators/components/index.ts`:
```ts
export {}
```

- [ ] **Step 6: Scaffold `features/finance/`**

`features/finance/types.ts`:
```ts
export type InvoiceId = string

export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue' | 'cancelled'

export type CreateInvoiceInput = {
  tournamentId: string
  recipientEmail: string
  amount: number
  currency?: string
  dueDate?: Date
}
```

`features/finance/schemas/index.ts`:
```ts
import { z } from 'zod'

export const createInvoiceSchema = z.object({
  tournamentId: z.string().cuid(),
  recipientEmail: z.string().email(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  dueDate: z.coerce.date().optional(),
})
```

`features/finance/permissions.ts`:
```ts
import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const FINANCE_PERMISSIONS = {
  canManage: (role: Role) => hasRole(role, 'tournament_director'),
  canViewReports: (role: Role) => hasRole(role, 'org_admin'),
} as const
```

`features/finance/repositories/index.ts`:
```ts
export const financeRepository = {}
```

`features/finance/services/index.ts`:
```ts
export const financeService = {}
```

`features/finance/actions/index.ts`:
```ts
'use server'
```

`features/finance/queries/index.ts`:
```ts
'use client'
```

`features/finance/components/index.ts`:
```ts
export {}
```

- [ ] **Step 7: Scaffold `features/announcements/`**

`features/announcements/types.ts`:
```ts
export type AnnouncementId = string

export type CreateAnnouncementInput = {
  tournamentId: string
  title: string
  body: string
  publishedAt?: Date
}
```

`features/announcements/schemas/index.ts`:
```ts
import { z } from 'zod'

export const createAnnouncementSchema = z.object({
  tournamentId: z.string().cuid(),
  title: z.string().min(3).max(200),
  body: z.string().min(1),
  publishedAt: z.coerce.date().optional(),
})
```

`features/announcements/permissions.ts`:
```ts
import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const ANNOUNCEMENT_PERMISSIONS = {
  canPublish: (role: Role) => hasRole(role, 'tournament_director'),
} as const
```

`features/announcements/services/index.ts`:
```ts
export const announcementService = {}
```

`features/announcements/actions/index.ts`:
```ts
'use server'
```

`features/announcements/queries/index.ts`:
```ts
'use client'
```

`features/announcements/components/index.ts`:
```ts
export {}
```

- [ ] **Step 8: Scaffold `features/requests/`**

`features/requests/types.ts`:
```ts
export type RequestType = 'team_registration' | 'participant_registration' | 'adjudicator_registration' | 'custom'
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'waitlisted'

export type CreateRequestInput = {
  tournamentId: string
  requesterEmail: string
  type: RequestType
  notes?: string
}
```

`features/requests/schemas/index.ts`:
```ts
import { z } from 'zod'

export const createRequestSchema = z.object({
  tournamentId: z.string().cuid(),
  requesterEmail: z.string().email(),
  type: z.enum(['team_registration', 'participant_registration', 'adjudicator_registration', 'custom']),
  notes: z.string().max(1000).optional(),
})
```

`features/requests/permissions.ts`:
```ts
import type { Role } from '@/lib/permissions'
import { hasRole } from '@/lib/permissions'

export const REQUEST_PERMISSIONS = {
  canReview: (role: Role) => hasRole(role, 'tournament_director'),
  canSubmit: (_role: Role) => true,
} as const
```

`features/requests/services/index.ts`:
```ts
export const requestService = {}
```

`features/requests/actions/index.ts`:
```ts
'use server'
```

`features/requests/queries/index.ts`:
```ts
'use client'
```

`features/requests/components/index.ts`:
```ts
export {}
```

- [ ] **Step 9: Scaffold `features/notifications/`**

`features/notifications/types.ts`:
```ts
export type NotificationId = string
export type NotificationType = 'announcement' | 'invitation' | 'status_change' | 'reminder'

export type Notification = {
  id: NotificationId
  userId: string
  type: NotificationType
  title: string
  body: string
  readAt: Date | null
  createdAt: Date
}
```

`features/notifications/schemas/index.ts`:
```ts
import { z } from 'zod'

export const markReadSchema = z.object({
  notificationId: z.string().cuid(),
})
```

`features/notifications/services/index.ts`:
```ts
export const notificationsFeatureService = {}
```

`features/notifications/actions/index.ts`:
```ts
'use server'
```

`features/notifications/queries/index.ts`:
```ts
'use client'
```

`features/notifications/components/index.ts`:
```ts
export {}
```

- [ ] **Step 10: Scaffold `features/invitations/`**

`features/invitations/types.ts`:
```ts
export type InvitationId = string

export type CreateInvitationInput = {
  email: string
  role: string
  tournamentId?: string
}
```

`features/invitations/schemas/index.ts`:
```ts
import { z } from 'zod'

export const createInvitationSchema = z.object({
  email: z.string().email(),
  role: z.string().min(1),
  tournamentId: z.string().cuid().optional(),
})

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
})
```

`features/invitations/services/index.ts`:
```ts
export const invitationService = {}
```

`features/invitations/actions/index.ts`:
```ts
'use server'
```

`features/invitations/queries/index.ts`:
```ts
'use client'
```

`features/invitations/components/index.ts`:
```ts
export {}
```

- [ ] **Step 11: Scaffold `features/dashboard/`**

`features/dashboard/types.ts`:
```ts
export type DashboardStats = {
  totalTournaments: number
  activeTournaments: number
  totalParticipants: number
  totalTeams: number
}
```

`features/dashboard/queries/index.ts`:
```ts
'use client'

import { useQuery } from '@tanstack/react-query'
import type { DashboardStats } from '@/features/dashboard/types'

export const dashboardKeys = {
  stats: (orgId: string) => ['dashboard', 'stats', orgId] as const,
}

export function useDashboardStats(organizationId: string) {
  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats(organizationId),
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/stats?orgId=${organizationId}`)
      return res.json()
    },
    enabled: !!organizationId,
  })
}
```

`features/dashboard/components/index.ts`:
```ts
export {}
```

- [ ] **Step 12: Scaffold `features/activity-log/`**

`features/activity-log/types.ts`:
```ts
export type ActivityLogEntry = {
  id: string
  tournamentId: string | null
  actorId: string | null
  action: string
  resourceType: string
  resourceId: string | null
  metadata: Record<string, unknown> | null
  createdAt: Date
}

export type LogActivity = {
  tournamentId?: string
  actorId?: string
  action: string
  resourceType: string
  resourceId?: string
  metadata?: Record<string, unknown>
}
```

`features/activity-log/services/index.ts`:
```ts
import type { LogActivity } from '@/features/activity-log/types'
import { logger } from '@/services/logger'

export const activityLogService = {
  async log(entry: LogActivity): Promise<void> {
    // TODO: persist to activity_logs table via Prisma
    logger.info('Activity logged', { ...entry })
  },
}
```

`features/activity-log/queries/index.ts`:
```ts
'use client'
```

`features/activity-log/components/index.ts`:
```ts
export {}
```

- [ ] **Step 13: Type-check all features**

```bash
npm run type-check
```
Expected: no errors.

- [ ] **Step 14: Commit**

```bash
git add features/
git commit -m "feat: scaffold all feature module stubs (organizations, institutions, teams, participants, adjudicators, finance, announcements, requests, notifications, invitations, dashboard, activity-log)"
```

---

## Task 13: docs/ Directory

**Files:**
- Create: `docs/architecture.md`
- Create: `docs/database.md`
- Create: `docs/permissions.md`
- Create: `docs/contributing.md`
- Create: `docs/deployment.md`

- [ ] **Step 1: Create `docs/architecture.md`**

```md
# Architecture

## Overview

Debately is a Next.js 15 App Router application organized around feature-based vertical slices.

## Layer Diagram

\`\`\`
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
\`\`\`

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
```

- [ ] **Step 2: Create `docs/database.md`**

```md
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
```

- [ ] **Step 3: Create `docs/permissions.md`**

```md
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

\`\`\`ts
import { TOURNAMENT_PERMISSIONS } from '@/features/tournaments/permissions'

if (!TOURNAMENT_PERMISSIONS.canEdit(user.role)) throw Errors.forbidden()
\`\`\`
```

- [ ] **Step 4: Create `docs/contributing.md`**

```md
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
```

- [ ] **Step 5: Create `docs/deployment.md`**

```md
# Deployment

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role (server only) |
| `DATABASE_URL` | Yes | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | Yes | PostgreSQL direct URL (for Prisma migrations) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app base URL |

## Production Checklist

- [ ] Set all environment variables in hosting platform
- [ ] Run `npx prisma migrate deploy`
- [ ] Run `npm run build` to confirm no build errors
- [ ] Verify `/api/health` returns `{ status: "ok" }`

## Hosting

Recommended: Vercel (zero-config for Next.js App Router).
```

- [ ] **Step 6: Commit**

```bash
git add docs/
git commit -m "docs: add architecture, database, permissions, contributing, and deployment docs"
```

---

## Task 14: Final Verification

- [ ] **Step 1: Confirm full directory tree**

```bash
find . -type f -not -path './.git/*' -not -path './node_modules/*' | sort
```
Expected: every path from the spec appears.

- [ ] **Step 2: Full type-check**

```bash
npm run type-check
```
Expected: exit code 0, no errors.

- [ ] **Step 3: Production build**

```bash
npm run build
```
Expected: `✓ Compiled successfully`. All routes should be listed.

- [ ] **Step 4: Spot-check key imports compile**

```bash
node -e "require('./node_modules/next/dist/server/app-render/app-render.js')" 2>/dev/null && echo "next ok"
```

- [ ] **Step 5: Commit final state**

```bash
git add -A
git commit -m "chore: finalize architecture scaffold — all routes, features, and stubs in place"
```

---

## Spec Coverage Check

| Spec Section | Covered By |
|---|---|
| `app/(marketing)/*` | Task 6 |
| `app/(auth)/*` | Task 7 |
| `app/(dashboard)/*` | Task 7 |
| `app/api/*` | Task 8 |
| `app/error.tsx`, `not-found.tsx`, `layout.tsx`, `globals.css` | Task 6 |
| `features/auth/` | Task 11 |
| `features/tournaments/` | Task 11 |
| `features/organizations/`, `institutions/`, `teams/`, `participants/`, `adjudicators/`, `finance/` | Task 12 |
| `features/announcements/`, `requests/`, `notifications/`, `invitations/`, `dashboard/`, `activity-log/` | Task 12 |
| `components/ui/`, `layout/`, `navigation/`, `forms/`, `data-table/`, `dialogs/`, `empty-state/`, `loading/`, `shared/` | Task 9 |
| `services/email/`, `storage/`, `csv/`, `logger/`, `notifications/` | Task 10 |
| `lib/supabase/*` | Task 2 |
| `lib/auth.ts`, `permissions.ts`, `env.ts`, `constants.ts`, `utils.ts`, `validation.ts`, `errors.ts` | Task 3 |
| `hooks/*` | Task 4 |
| `types/*` | Task 4 |
| `prisma/schema.prisma`, `seed.ts` | Task 5 |
| `middleware.ts` | Task 6 |
| `docs/*` | Task 13 |
| `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`, `.env.local`, `components.json` | Task 1 |
| `public/` | Not in spec as files — create empty dirs if needed |
| `styles/globals.css` | Handled by `app/globals.css`; duplicate symlink optional |
