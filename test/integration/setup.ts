import { vi } from 'vitest'
import { browserEnvironment } from '../browser/environment'
Object.assign(process.env, browserEnvironment)
vi.mock('next/headers', () => ({
  cookies: async () => ({ getAll: () => [], set: () => undefined }),
}))
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => ({
        data: {
          user: { id: 'owner', email: 'owner@example.com', email_confirmed_at: '2026-01-01' },
        },
        error: null,
      }),
    },
  }),
}))
vi.mock('next/cache', () => ({
  revalidatePath: () => undefined,
  revalidateTag: () => undefined,
  unstable_cache: (read: () => Promise<unknown>) => read,
}))
