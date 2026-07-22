'use server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireTournamentDirector, assertTournamentEditable } from '@/features/tournaments/permissions'
import { notifyIfSensitiveChanged } from '@/features/tournaments/services'
import { TOURNAMENT_TAG } from '@/features/tournaments/queries/tournaments'
import {
  updateTournamentBasicSchema,
  updateRegistrationSettingsSchema,
  updateFinanceSettingsSchema,
  updatePortalSettingsSchema,
  updateFormatSettingsSchema,
} from '@/features/tournaments/schemas'
import { assertSlugAllowed } from '@/lib/slug'
import { err, ok, type ActionResult } from '@/types/api'
import { isAppError } from '@/lib/errors'

function revalidate(id: string) {
  revalidatePath(`/tournaments/${id}`)
  revalidatePath(`/tournaments/${id}/settings`)
  revalidateTag(TOURNAMENT_TAG(id))
}

export async function updateTournamentBasicAction(fd: FormData): Promise<ActionResult<{ slug: string }>> {
  const tournamentId = String(fd.get('tournamentId') ?? '')
  if (!tournamentId) return err('Missing tournament id', 'VALIDATION_ERROR')
  const parsed = updateTournamentBasicSchema.safeParse({
    name: fd.get('name'),
    slug: fd.get('slug'),
    description: fd.get('description') ?? '',
    venue: fd.get('venue'),
    address: fd.get('address'),
    startDate: fd.get('startDate'),
    endDate: fd.get('endDate'),
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  try {
    const { tournament, org } = await requireTournamentDirector(tournamentId)
    assertTournamentEditable(tournament)
    const { name, slug, description, venue, address, startDate, endDate } = parsed.data
    if (slug !== tournament.slug) {
      assertSlugAllowed(slug)
      const conflict = await prisma.tournament.findFirst({ where: { orgId: org.id, slug, NOT: { id: tournamentId } } })
      if (conflict) return err('A tournament with this slug already exists in this organization.', 'CONFLICT')
    }
    const next = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { name, slug, description: description || null, venue, address, startDate, endDate },
    })
    await notifyIfSensitiveChanged(tournament, next)
    revalidate(tournamentId)
    return ok({ slug: next.slug })
  } catch (e) {
    if (isAppError(e)) return err(e.message, e.code); throw e
  }
}

export async function updateRegistrationSettingsAction(fd: FormData): Promise<ActionResult<void>> {
  const tournamentId = String(fd.get('tournamentId') ?? '')
  if (!tournamentId) return err('Missing tournament id', 'VALIDATION_ERROR')
  const parsed = updateRegistrationSettingsSchema.safeParse({
    registrationOpen: fd.get('registrationOpen') === 'true',
    maxTeamSlots: fd.get('maxTeamSlots'),
    maxTeamsPerInstitution: fd.get('maxTeamsPerInstitution') || undefined,
    maxAdjudicatorsPerInstitution: fd.get('maxAdjudicatorsPerInstitution') || undefined,
    registrationDeadline: fd.get('registrationDeadline'),
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  try {
    const { tournament } = await requireTournamentDirector(tournamentId)
    assertTournamentEditable(tournament)
    const next = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        registrationOpen: parsed.data.registrationOpen,
        maxTeamSlots: parsed.data.maxTeamSlots,
        maxTeamsPerInstitution: parsed.data.maxTeamsPerInstitution ?? null,
        maxAdjudicatorsPerInstitution: parsed.data.maxAdjudicatorsPerInstitution ?? null,
        registrationDeadline: parsed.data.registrationDeadline,
      },
    })
    await notifyIfSensitiveChanged(tournament, next)
    revalidate(tournamentId)
    return ok(undefined)
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}

export async function updateFinanceSettingsAction(fd: FormData): Promise<ActionResult<void>> {
  const tournamentId = String(fd.get('tournamentId') ?? '')
  if (!tournamentId) return err('Missing tournament id', 'VALIDATION_ERROR')
  let feeStructureJson: unknown
  try { feeStructureJson = JSON.parse(String(fd.get('feeStructure') ?? '{}')) } catch { return err('Invalid feeStructure JSON', 'VALIDATION_ERROR') }
  const parsed = updateFinanceSettingsSchema.safeParse({
    currency: fd.get('currency'),
    feeStructure: feeStructureJson,
    paymentDeadline: fd.get('paymentDeadline') || undefined,
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  try {
    const { tournament } = await requireTournamentDirector(tournamentId)
    assertTournamentEditable(tournament)
    const next = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        currency: parsed.data.currency,
        feeStructure: parsed.data.feeStructure,
        paymentDeadline: parsed.data.paymentDeadline ?? null,
      },
    })
    await notifyIfSensitiveChanged(tournament, next)
    revalidate(tournamentId)
    return ok(undefined)
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}

export async function updatePortalSettingsAction(fd: FormData): Promise<ActionResult<void>> {
  const tournamentId = String(fd.get('tournamentId') ?? '')
  if (!tournamentId) return err('Missing tournament id', 'VALIDATION_ERROR')
  const parsed = updatePortalSettingsSchema.safeParse({
    portalActive: fd.get('portalActive') === 'true',
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  try {
    const { tournament } = await requireTournamentDirector(tournamentId)
    assertTournamentEditable(tournament)
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { portalActive: parsed.data.portalActive },
    })
    revalidate(tournamentId)
    return ok(undefined)
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}

export async function updateFormatSettingsAction(fd: FormData): Promise<ActionResult<void>> {
  const tournamentId = String(fd.get('tournamentId') ?? '')
  if (!tournamentId) return err('Missing tournament id', 'VALIDATION_ERROR')
  let formatConfigJson: unknown
  try { formatConfigJson = JSON.parse(String(fd.get('formatConfig') ?? '{}')) } catch { return err('Invalid formatConfig JSON', 'VALIDATION_ERROR') }
  const parsed = updateFormatSettingsSchema.safeParse({
    format: fd.get('format'),
    formatConfig: formatConfigJson,
  })
  if (!parsed.success) return err(parsed.error.errors[0].message, 'VALIDATION_ERROR')
  try {
    const { tournament } = await requireTournamentDirector(tournamentId)
    assertTournamentEditable(tournament)
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { format: parsed.data.format, formatConfig: parsed.data.formatConfig },
    })
    revalidate(tournamentId)
    return ok(undefined)
  } catch (e) { if (isAppError(e)) return err(e.message, e.code); throw e }
}
