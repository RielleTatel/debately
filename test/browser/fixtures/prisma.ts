import { PrismaClient } from '@prisma/client'

const client = new PrismaClient({ log: [{ emit: 'event', level: 'query' }] })
type QuerySample = { sql: string; durationMs: number }
const metrics = globalThis as typeof globalThis & {
  performanceQueries?: QuerySample[]
  failRegistrationAnalytics?: boolean
  analyticsDelayMs?: number
  rosterDelayMs?: number
  balanceDelayMs?: number
}
metrics.performanceQueries ??= []
client.$on('query', (event) => {
  metrics.performanceQueries!.push({ durationMs: event.duration, sql: event.query })
  if (metrics.performanceQueries!.length > 10000) metrics.performanceQueries!.shift()
})
export function drainQueries() {
  return metrics.performanceQueries!.splice(0)
}
export function setAnalyticsFailure(fail: boolean, delayMs = 0) {
  metrics.failRegistrationAnalytics = fail
  metrics.analyticsDelayMs = delayMs
}
export function setRosterDelays(rosterDelayMs = 0, balanceDelayMs = 0) {
  metrics.rosterDelayMs = rosterDelayMs
  metrics.balanceDelayMs = balanceDelayMs
}
export const prisma = client.$extends({
  query: {
    async $allOperations({ model, operation, args, query }) {
      if (
        metrics.rosterDelayMs &&
        operation === 'findMany' &&
        ['Team', 'Participant', 'Adjudicator'].includes(model ?? '')
      )
        await new Promise((resolve) => setTimeout(resolve, metrics.rosterDelayMs))
      if (
        metrics.balanceDelayMs &&
        operation === '$queryRaw' &&
        JSON.stringify(args).includes('FROM invoices v JOIN')
      )
        await new Promise((resolve) => setTimeout(resolve, metrics.balanceDelayMs))
      if (operation === '$queryRaw' && JSON.stringify(args).includes('FROM tournaments t WHERE')) {
        if (metrics.analyticsDelayMs)
          await new Promise((resolve) => setTimeout(resolve, metrics.analyticsDelayMs))
        if (metrics.failRegistrationAnalytics)
          throw new Error('Injected registration analytics failure')
      }
      return query(args)
    },
    team: {
      async count({ args, query }) {
        if ('institution' in (args.where ?? {}))
          await new Promise((resolve) =>
            setTimeout(resolve, Number(process.env.PERFORMANCE_DELAY_MS ?? 2000)),
          )
        return query(args)
      },
      async findMany({ args, query }) {
        if (args.select?.createdAt)
          await new Promise((resolve) =>
            setTimeout(resolve, Number(process.env.PERFORMANCE_DELAY_MS ?? 2000)),
          )
        return query(args)
      },
    },
  },
})
