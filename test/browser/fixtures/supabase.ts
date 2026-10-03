import { cookies } from 'next/headers'
import type { SupabaseClient, User } from '@supabase/supabase-js'

export async function createClient(): Promise<SupabaseClient> {
  const role = (await cookies()).get('fixture-role')?.value
  const user: User | null = role
    ? {
        id: role,
        email: `${role}@example.com`,
        aud: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: '2026-01-01',
        email_confirmed_at: role === 'unverified' ? undefined : '2026-01-01',
      }
    : null
  return {
    auth: { getUser: async () => ({ data: { user }, error: null }) },
  } as unknown as SupabaseClient
}
