import { logger } from '@/services/logger'

type NotificationType = 'announcement' | 'invitation' | 'status_change' | 'reminder'

type NotificationPayload = {
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
}

export const notificationService = {
  async send(payload: NotificationPayload): Promise<void> {
    // TODO: persist to DB + push via websockets/SSE
    logger.info('Notification sent', { userId: payload.userId, type: payload.type })
  },

  async sendToMany(userIds: string[], payload: Omit<NotificationPayload, 'userId'>): Promise<void> {
    await Promise.all(userIds.map((userId) => notificationService.send({ ...payload, userId })))
  },
}
