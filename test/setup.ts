import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.DIRECT_URL = 'postgresql://test:test@localhost:5432/test'
process.env.RESEND_API_KEY = 'test-key'
process.env.RESEND_FROM_EMAIL = 'noreply@test.local'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.GOOGLE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com'
process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIItest\n-----END PRIVATE KEY-----\n'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))
