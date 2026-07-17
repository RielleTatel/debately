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
