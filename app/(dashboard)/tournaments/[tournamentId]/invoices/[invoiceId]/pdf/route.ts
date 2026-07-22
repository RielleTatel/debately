import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAppError } from '@/lib/errors'
import { requireTournamentDirector } from '@/features/tournaments/permissions'
import { requireInstitutionRep } from '@/features/portal/permissions'
import { renderInvoicePDF } from '@/services/pdf'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ tournamentId: string; invoiceId: string }> }) {
  try {
    const { tournamentId, invoiceId } = await ctx.params
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        lineItems: { orderBy: { createdAt: 'asc' } },
        institution: { include: { tournament: { include: { organization: { select: { name: true } } } } } },
      },
    })
    if (!invoice || invoice.institution.tournamentId !== tournamentId) return new NextResponse('Not found', { status: 404 })
    try { await requireTournamentDirector(tournamentId) } catch { await requireInstitutionRep(invoice.tournamentInstitutionId) }
    const buffer = await renderInvoicePDF({
      invoice,
      institution: { name: invoice.institution.name },
      tournament: { name: invoice.institution.tournament.name, venue: invoice.institution.tournament.venue, startDate: invoice.institution.tournament.startDate },
      organization: { name: invoice.institution.tournament.organization.name },
    })
    return new NextResponse(new Uint8Array(buffer), {
      headers: { 'content-type': 'application/pdf', 'content-disposition': `inline; filename="${invoice.invoiceNumber}.pdf"` },
    })
  } catch (e) {
    if (isAppError(e)) return new NextResponse(e.message, { status: e.code === 'NOT_FOUND' ? 404 : 403 })
    throw e
  }
}
