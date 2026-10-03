import { PrismaClient } from '@prisma/client'
export const queries: Array<{ durationMs: number; sql: string }> = []
export const prisma = new PrismaClient({ log: [{ emit: 'event', level: 'query' }] })
prisma.$on('query', (event) => queries.push({ durationMs: event.duration, sql: event.query }))
