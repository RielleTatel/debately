'use server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireOrgMember } from '@/features/organizations/permissions'
import { createTournamentSchema } from '@/features/tournaments/schemas'
import { err, type ActionResult } from '@/types/api'
import { isAppError } from '@/lib/errors'

export async function createTournamentAction(
  fd: FormData,
): Promise<ActionResult<{ tournamentId: string; orgSlug: string; slug: string }>> {
  const orgId = String(fd.get('orgId') ?? '')
  if (!orgId) return err('Missing organization id', 'VALIDATION_ERROR')

  const parsed = createTournamentSchema.safeParse({
    name: fd.get('name'),
    slug: fd.get('slug'),
    format: fd.get('format'),
    startDate: fd.get('startDate'),
    endDate: fd.get('endDate'),
    registrationDeadline: fd.get('registrationDeadline'),
    paymentDeadline: fd.get('paymentDeadline') || undefined,
    venue: fd.get('venue'),
    address: fd.get('address'),
    maxTeamSlots: fd.get('maxTeamSlots'),
    description: fd.get('description') ?? '',
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')

  try {
    const { org } = await requireOrgMember(orgId)
    const { slug } = parsed.data

    const conflict = await prisma.tournament.findFirst({ where: { orgId: org.id, slug } })
    if (conflict) return err('A tournament with this slug already exists in this organization.', 'CONFLICT')

    const created = await prisma.tournament.create({
      data: {
        orgId: org.id,
        name: parsed.data.name,
        slug,
        format: parsed.data.format,
        status: 'DRAFT',
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
        registrationDeadline: parsed.data.registrationDeadline,
        paymentDeadline: parsed.data.paymentDeadline ?? null,
        venue: parsed.data.venue,
        address: parsed.data.address,
        maxTeamSlots: parsed.data.maxTeamSlots,
        description: parsed.data.description || null,
      },
    })
    redirect(`/tournaments/${created.id}/settings`)
  } catch (e) {
    if (isAppError(e)) return err(e.message, e.code)
    throw e
  }
}
