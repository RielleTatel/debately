# Debately

Debate tournament management SaaS.

## Development

```bash
npm install
cp .env.local.example .env.local  # fill in Supabase credentials
npm run db:generate
npm run dev
```

## Stack

- Next.js 15 (App Router)
- Supabase (auth + storage)
- Prisma + PostgreSQL
- shadcn/ui + Tailwind CSS 4
