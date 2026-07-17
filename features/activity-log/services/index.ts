import type { LogActivity } from '@/features/activity-log/types'
import { logger } from '@/services/logger'

export const activityLogService = {
  async log(entry: LogActivity): Promise<void> {
    // TODO: persist to activity_logs table via Prisma
    logger.info('Activity logged', { ...entry })
  },
}
