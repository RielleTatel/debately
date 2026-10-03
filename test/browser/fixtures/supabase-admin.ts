import type { SupabaseClient } from '@supabase/supabase-js'

export function createAdminClient(): SupabaseClient {
  return {
    storage: {
      from: () => ({
        download: async () => ({
          data: new Blob([
            'Type,Institution,Team,Debater 1\nInstitution,School 000,Team 0010,Reprocessed name\n',
          ]),
          error: null,
        }),
      }),
    },
  } as unknown as SupabaseClient
}
