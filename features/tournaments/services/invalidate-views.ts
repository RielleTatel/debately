import { revalidatePath, revalidateTag } from 'next/cache'
import {
  publicTournamentTag,
  registrationAnalyticsTag,
  financialAnalyticsTag,
} from '@/lib/cache-tags'

export function invalidateTournamentViews(tournamentId: string, institutionIds: string[] = []) {
  revalidateTag(publicTournamentTag(tournamentId))
  revalidateTag(registrationAnalyticsTag(tournamentId))
  revalidateTag(financialAnalyticsTag(tournamentId))
  revalidatePath(`/tournaments/${tournamentId}`, 'layout')
  for (const id of new Set(institutionIds)) revalidatePath(`/portal/${id}`, 'layout')
}

export function invalidateFinancialViews(tournamentId: string, institutionIds: string[] = []) {
  revalidateTag(financialAnalyticsTag(tournamentId))
  revalidatePath(`/tournaments/${tournamentId}/finance`, 'layout')
  revalidatePath(`/tournaments/${tournamentId}`)
  for (const id of new Set(institutionIds)) revalidatePath(`/portal/${id}`, 'layout')
}
