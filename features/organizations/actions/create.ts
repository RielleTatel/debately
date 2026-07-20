'use server'
import { redirect } from 'next/navigation'
import { requireVerifiedUser } from '@/features/auth/queries'
import { createOrganizationSchema } from '@/features/organizations/schemas'
import { prisma } from '@/lib/prisma'
import { assertSlugAllowed } from '@/lib/slug'
import { err, type ActionResult } from '@/types/api'
import { isAppError } from '@/lib/errors'

export async function createOrganizationAction(fd: FormData): Promise<ActionResult<{ slug: string }>> {
  const parsed = createOrganizationSchema.safeParse({
    name: fd.get('name'), slug: fd.get('slug'), description: fd.get('description') ?? '',
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  const { name, slug, description } = parsed.data

  try { assertSlugAllowed(slug) } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }

  const me = await requireVerifiedUser()

  const [existingOrg, existingAlias] = await Promise.all([
    prisma.organization.findUnique({ where: { slug } }),
    prisma.organizationSlugAlias.findUnique({ where: { oldSlug: slug } }),
  ])
  if (existingOrg || existingAlias) return err('This slug is already taken.', 'CONFLICT')
  await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name, slug, description: description || null, ownerId: me.profile.id },
    })
    await tx.organizationMember.create({ data: { orgId: org.id, profileId: me.profile.id, role: 'OWNER' } })
  })
  redirect(`/organization/${slug}`)
}
