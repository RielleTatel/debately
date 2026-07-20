'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireOrgOwner } from '@/features/organizations/permissions'
import { transferOwnershipSchema } from '@/features/organizations/schemas'
import { err, ok, type ActionResult } from '@/types/api'
import { isAppError } from '@/lib/errors'

export async function transferOwnershipAction(fd: FormData): Promise<ActionResult<void>> {
  const orgId = String(fd.get('orgId') ?? '')
  const parsed = transferOwnershipSchema.safeParse({ toProfileId: fd.get('toProfileId') })
  if (!orgId) return err('Missing organization id', 'VALIDATION_ERROR')
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  try {
    const { me, org } = await requireOrgOwner(orgId)
    if (parsed.data.toProfileId === me.profile.id) return err('You are already the owner.', 'VALIDATION_ERROR')
    await prisma.$transaction(async (tx) => {
      const target = await tx.organizationMember.findUnique({
        where: { orgId_profileId: { orgId: org.id, profileId: parsed.data.toProfileId } },
      })
      if (!target) throw new Error('NOT_MEMBER')
      await tx.organizationMember.update({
        where: { orgId_profileId: { orgId: org.id, profileId: me.profile.id } }, data: { role: 'MEMBER' },
      })
      await tx.organizationMember.update({
        where: { orgId_profileId: { orgId: org.id, profileId: parsed.data.toProfileId } }, data: { role: 'OWNER' },
      })
      await tx.organization.update({ where: { id: org.id }, data: { ownerId: parsed.data.toProfileId } })
    })
    revalidatePath(`/organization/${org.slug}`)
    return ok(undefined)
  } catch (e) {
    if (e instanceof Error && e.message === 'NOT_MEMBER') return err('Target user is not a member of this organization.', 'NOT_FOUND')
    if (isAppError(e)) return err(e.message, e.code)
    throw e
  }
}
