'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireOrgOwner } from '@/features/organizations/permissions'
import { removeMemberSchema } from '@/features/organizations/schemas'
import { err, ok, type ActionResult } from '@/types/api'
import { isAppError, AppError } from '@/lib/errors'

// Phase 3 replaces this with a real TournamentDirector lookup.
async function isMemberATournamentDirector(_orgId: string, _profileId: string): Promise<boolean> { return false }

export async function removeMemberAction(fd: FormData): Promise<ActionResult<{ warnedAboutTD: boolean }>> {
  const orgId = String(fd.get('orgId') ?? '')
  const parsed = removeMemberSchema.safeParse({ profileId: fd.get('profileId') })
  if (!orgId) return err('Missing organization id', 'VALIDATION_ERROR')
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  try {
    const { org } = await requireOrgOwner(orgId)
    const member = await prisma.organizationMember.findUnique({
      where: { orgId_profileId: { orgId: org.id, profileId: parsed.data.profileId } },
    })
    if (!member) return err('Member not found', 'NOT_FOUND')
    if (member.role === 'OWNER') {
      throw new AppError('CONFLICT', 'Cannot remove the owner. Transfer ownership first.', 409)
    }
    const warnedAboutTD = await isMemberATournamentDirector(org.id, member.profileId)
    await prisma.organizationMember.delete({
      where: { orgId_profileId: { orgId: org.id, profileId: member.profileId } },
    })
    revalidatePath(`/organization/${org.slug}/members`)
    return ok({ warnedAboutTD })
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}
