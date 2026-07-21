import { notificationService } from '@/services/notifications'

export async function notifyRequestSubmitted(_requestId: string): Promise<void> {
  notificationService.send({ userId: 'director', type: 'REQUEST_SUBMITTED', title: 'New request', message: 'New request submitted.', tournamentId: undefined, link: undefined } as any)
}

export async function notifyRequestStateChanged(_requestId: string, _kind: string, _note?: string): Promise<void> {
  notificationService.send({ userId: 'rep', type: 'REQUEST_STATUS_CHANGED', title: 'Request updated', message: `Request status changed.`, tournamentId: undefined, link: undefined } as any)
}
