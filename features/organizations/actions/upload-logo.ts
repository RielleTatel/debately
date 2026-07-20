'use server'
import { requireOrgOwner } from '@/features/organizations/permissions'
import { orgLogoStorage } from '@/services/storage/org-logos'
import { prisma } from '@/lib/prisma'
import { err, ok, type ActionResult } from '@/types/api'
import { isAppError } from '@/lib/errors'

export async function uploadOrgLogoAction(fd: FormData): Promise<ActionResult<{ url: string }>> {
  const orgId = String(fd.get('orgId') ?? '')
  const file = fd.get('file')
  if (!orgId) return err('Missing organization id', 'VALIDATION_ERROR')
  if (!(file instanceof File)) return err('No file provided', 'VALIDATION_ERROR')
  const v = orgLogoStorage.validate(file); if (!v.ok) return err(v.message, 'VALIDATION_ERROR')
  try {
    const { org } = await requireOrgOwner(orgId)
    const url = await orgLogoStorage.upload(org.id, file)
    await prisma.organization.update({ where: { id: org.id }, data: { logoUrl: url } })
    return ok({ url })
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}
