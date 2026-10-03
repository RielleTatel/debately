import { financialAnalyticsTag } from '@/lib/cache-tags'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { readFinancialAnalytics } from '../repositories/financial'
export const FINANCIAL_TAG = financialAnalyticsTag
export const getFinancialAnalytics = cache((tournamentId: string) =>
  unstable_cache(
    () => readFinancialAnalytics(tournamentId),
    ['financial-analytics', tournamentId],
    { revalidate: 60, tags: [FINANCIAL_TAG(tournamentId)] },
  )(),
)
