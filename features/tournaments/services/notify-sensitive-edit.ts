import { prisma } from '@/lib/prisma'
import { notificationService } from '@/services/notifications'
import type { Tournament } from '@prisma/client'

type SensitiveFields = Pick<Tournament, 'registrationDeadline' | 'paymentDeadline' | 'feeStructure'>

function sensitiveKey(t: SensitiveFields): string {
  const reg = t.registrationDeadline?.toISOString?.() ?? String(t.registrationDeadline)
  const pay = t.paymentDeadline ? t.paymentDeadline.toISOString() : 'null'
  const fee = JSON.stringify(t.feeStructure ?? null)
  return `${reg}|${pay}|${fee}`
}

export async function notifyIfSensitiveChanged(
  prev: Tournament,
  next: Tournament,
): Promise<void> {
  if (sensitiveKey(prev) === sensitiveKey(next)) return

  const members = await prisma.organizationMember.findMany({
    where: { orgId: next.orgId },
    include: { profile: { select: { userId: true } } },
  })
  const userIds = members.map((m) => m.profile.userId)
  if (userIds.length === 0) return

  await notificationService.sendToMany(userIds, {
    type: 'status_change',
    title: `Tournament settings updated: ${next.name}`,
    body: 'Registration deadline, payment deadline, or fee structure was changed.',
    data: { tournamentId: next.id, kind: 'sensitive_edit' },
  })
}
