import type { Prisma, ActivityAction } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type LogActivityInput = {
  action: ActivityAction
  resourceType: string
  resourceId?: string | null
  description: string
  tournamentId?: string | null
  orgId?: string | null
  actorId: string | null
  actorRoleAtTime: string
  before?: unknown
  after?: unknown
  tx?: Prisma.TransactionClient
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  const client = input.tx ?? prisma
  try {
    await client.activityLog.create({
      data: {
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId ?? null,
        description: input.description,
        tournamentId: input.tournamentId ?? null,
        orgId: input.orgId ?? null,
        actorId: input.actorId,
        actorRoleAtTime: input.actorRoleAtTime,
        beforeSnapshot: input.before as any,
        afterSnapshot: input.after as any,
      },
    })
  } catch (e) {
    console.error('logActivity failed', { input, error: e })
  }
}
