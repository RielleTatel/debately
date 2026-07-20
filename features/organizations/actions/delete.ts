'use server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireOrgOwner } from '@/features/organizations/permissions'
import { deleteOrganizationSchema } from '@/features/organizations/schemas'
import { err, type ActionResult } from '@/types/api'
import { isAppError } from '@/lib/errors'

export async function deleteOrganizationAction(fd: FormData): Promise<ActionResult<void>> {
  const orgId = String(fd.get('orgId') ?? '')
  const parsed = deleteOrganizationSchema.safeParse({ confirmName: fd.get('confirmName') })
  if (!orgId) return err('Missing organization id', 'VALIDATION_ERROR')
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  try {
    const { org } = await requireOrgOwner(orgId)
    if (parsed.data.confirmName !== org.name) {
      return err('Type the organization name exactly to confirm.', 'VALIDATION_ERROR')
    }
    // Phase 3 will archive child tournaments here before delete. For now, cascade removes members/aliases/invitations.
    await prisma.organization.delete({ where: { id: org.id } })
    redirect('/organization')
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}
