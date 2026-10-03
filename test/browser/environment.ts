import { userInfo } from 'node:os'
const database =
  process.env.PERFORMANCE_DATABASE_URL ??
  `postgresql://${encodeURIComponent(userInfo().username)}@127.0.0.1:55432/debately_performance_test`
const databaseUrl = new URL(database)
if (
  !['127.0.0.1', 'localhost'].includes(databaseUrl.hostname) ||
  databaseUrl.pathname !== '/debately_performance_test'
)
  throw new Error(
    'Performance fixtures require the isolated local debately_performance_test database',
  )
export const browserEnvironment = {
  DATABASE_URL: database,
  DIRECT_URL: database,
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'fixture',
  SUPABASE_SERVICE_ROLE_KEY: 'fixture',
  NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3100',
  RESEND_API_KEY: 're_fixture',
  RESEND_FROM_EMAIL: 'fixture@example.com',
  GOOGLE_CLIENT_EMAIL: 'fixture@example.com',
  GOOGLE_PRIVATE_KEY: 'fixture',
  NEXT_TELEMETRY_DISABLED: '1',
}
