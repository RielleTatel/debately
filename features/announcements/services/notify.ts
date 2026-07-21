import { notificationService } from '@/services/notifications'

export async function notifyAnnouncementPublished(_announcementId: string): Promise<void> {
  notificationService.send({ userId: 'rep', type: 'ANNOUNCEMENT_PUBLISHED', title: 'New announcement', message: 'A new announcement has been published.', tournamentId: undefined, link: undefined } as any)
}
