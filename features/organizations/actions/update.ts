'use server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireOrgOwner } from '@/features/organizations/permissions'
import { ORG_TAG } from '@/features/organizations/queries/current-org'
import { updateOrganizationSchema } from '@/features/organizations/schemas'
import { assertSlugAllowed } from '@/lib/slug'
import { err, ok, type ActionResult } from '@/types/api'
import { isAppError } from '@/lib/errors'

const ALIAS_TTL_MS = 30 * 24 * 60 * 60 * 1000

export async function updateOrganizationAction(fd: FormData): Promise<ActionResult<{ slug: string }>> {
  const orgId = String(fd.get('orgId') ?? '')
  if (!orgId) return err('Missing organization id', 'VALIDATION_ERROR')
  const parsed = updateOrganizationSchema.safeParse({
    name: fd.get('name'), slug: fd.get('slug'), description: fd.get('description') ?? '',
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')

  try {
    const { org } = await requireOrgOwner(orgId)
    const { name, slug, description } = parsed.data
    if (slug !== org.slug) {
      assertSlugAllowed(slug)
      const [conflict, aliasConflict] = await Promise.all([
        prisma.organization.findUnique({ where: { slug } }),
        prisma.organizationSlugAlias.findUnique({ where: { oldSlug: slug } }),
      ])
      if (conflict || aliasConflict) return err('This slug is already taken.', 'CONFLICT')
    }
    await prisma.$transaction(async (tx) => {
      await tx.organization.update({ where: { id: org.id }, data: { name, slug, description: description || null } })
      if (slug !== org.slug) {
        await tx.organizationSlugAlias.upsert({
          where: { oldSlug: org.slug },
          create: { oldSlug: org.slug, orgId: org.id, expiresAt: new Date(Date.now() + ALIAS_TTL_MS) },
          update: { orgId: org.id, expiresAt: new Date(Date.now() + ALIAS_TTL_MS) },
        })
      }
    })
    revalidatePath(`/organization/${slug}`)
    revalidateTag(ORG_TAG(slug))
    if (slug !== org.slug) revalidateTag(ORG_TAG(org.slug))
    return ok({ slug })
  } catch (e) {
    if (isAppError(e)) return err(e.message, e.code); throw e
  }
}
