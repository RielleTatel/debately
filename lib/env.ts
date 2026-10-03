import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  GOOGLE_CLIENT_EMAIL: z.string().email(),
  GOOGLE_PRIVATE_KEY: z.string().min(1),
})

function readEnv(name: keyof z.infer<typeof envSchema>, value: string | undefined) {
  return envSchema.shape[name].parse(value, { path: [name] })
}

// Validate on access so route imports do not require every integration's credentials.
// Keep public process.env reads explicit so Next.js can inline them.
export const env = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return readEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return readEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY)
  },
  get DATABASE_URL() {
    return readEnv('DATABASE_URL', process.env.DATABASE_URL)
  },
  get DIRECT_URL() {
    return readEnv('DIRECT_URL', process.env.DIRECT_URL)
  },
  get NEXT_PUBLIC_APP_URL() {
    return readEnv('NEXT_PUBLIC_APP_URL', process.env.NEXT_PUBLIC_APP_URL)
  },
  get RESEND_API_KEY() {
    return readEnv('RESEND_API_KEY', process.env.RESEND_API_KEY)
  },
  get RESEND_FROM_EMAIL() {
    return readEnv('RESEND_FROM_EMAIL', process.env.RESEND_FROM_EMAIL)
  },
  get GOOGLE_CLIENT_EMAIL() {
    return readEnv('GOOGLE_CLIENT_EMAIL', process.env.GOOGLE_CLIENT_EMAIL)
  },
  get GOOGLE_PRIVATE_KEY() {
    return readEnv('GOOGLE_PRIVATE_KEY', process.env.GOOGLE_PRIVATE_KEY)
  },
} satisfies z.infer<typeof envSchema>
