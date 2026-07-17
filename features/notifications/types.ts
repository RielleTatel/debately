export type NotificationId = string
export type NotificationType = 'announcement' | 'invitation' | 'status_change' | 'reminder'

export type Notification = {
  id: NotificationId
  userId: string
  type: NotificationType
  title: string
  body: string
  readAt: Date | null
  createdAt: Date
}
