import { prisma } from '@/lib/prisma'
export function getInvitationByToken(token: string) {
  return prisma.organizationInvitation.findUnique({ where: { token }, include: { organization: true } })
}
