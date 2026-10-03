import { registrationAnalyticsTag } from '@/lib/cache-tags'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { readRegistrationSeries, readRegistrationSummary } from '../repositories/registration'

export const REGISTRATION_TAG = registrationAnalyticsTag
export const getRegistrationSummary = cache(async (tournamentId: string) => {
  const raw = await unstable_cache(
    () => readRegistrationSummary(tournamentId),
    ['registration-summary', tournamentId],
    { revalidate: 60, tags: [REGISTRATION_TAG(tournamentId)] },
  )()
  return {
    ...raw,
    capacity: {
      ...raw.capacity,
      deadline: raw.capacity.deadline ? new Date(raw.capacity.deadline) : null,
    },
  }
})
const getSeries = cache((tournamentId: string) =>
  unstable_cache(
    () => readRegistrationSeries(tournamentId),
    ['registration-series', tournamentId],
    { revalidate: 60, tags: [REGISTRATION_TAG(tournamentId)] },
  )(),
)
export const getRegistrationAnalytics = cache(async (tournamentId: string) => {
  const [summary, series] = await Promise.all([
    getRegistrationSummary(tournamentId),
    getSeries(tournamentId),
  ])
  return { ...summary, series }
})
