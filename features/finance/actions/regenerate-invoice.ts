'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { AppError, toApi } from '@/lib/errors'
import { requireTournamentDirector, assertTournamentEditable } from '@/features/tournaments/permissions'
import { regenerateInvoiceForInstitution } from '@/features/finance/services/invoice-generator'
import type { ApiResponse } from '@/types/api'

export async function regenerateInvoiceAction(fd: FormData): Promise<ApiResponse<{ invoiceId: string }>> {
  try {
    const institutionId = String(fd.get('institutionId') ?? '')
    if (!institutionId) throw new AppError('VALIDATION_ERROR', 'institutionId required')
    const institution = await prisma.tournamentInstitution.findUnique({
      where: { id: institutionId }, select: { id: true, tournamentId: true },
    })
    if (!institution) throw new AppError('NOT_FOUND', 'Institution not found')
    const { tournament } = await requireTournamentDirector(institution.tournamentId)
    assertTournamentEditable(tournament)
    const invoice = await regenerateInvoiceForInstitution(institutionId)
    revalidatePath(`/tournaments/${institution.tournamentId}/finance`)
    revalidatePath(`/tournaments/${institution.tournamentId}/finance/${institutionId}`)
    return { ok: true, data: { invoiceId: invoice.id } }
  } catch (e) { return toApi(e) }
}
