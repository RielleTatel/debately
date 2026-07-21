import { activityLogService } from '@/features/activity-log/services'

export const activityLog = {
  async record(entry: {
    code: string
    tournamentId?: string
    actorId?: string
    data?: Record<string, unknown>
  }): Promise<void> {
    await activityLogService.log({
      action: entry.code,
      tournamentId: entry.tournamentId,
      actorId: entry.actorId,
      resourceType: 'import',
      metadata: entry.data ?? {},
    })
  },
}
