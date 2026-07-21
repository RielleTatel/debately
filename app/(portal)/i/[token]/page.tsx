import { redirect } from 'next/navigation'
import { getPortalTokenByToken } from '@/features/portal/queries'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/features/auth/queries'
import { PortalClaimForm } from '@/features/portal/components/portal-claim-form'

export default async function ClaimPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const info = await getPortalTokenByToken(token)
  if (!info || !info.active) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <h1 className="text-lg font-semibold">Portal link inactive</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please contact the tournament director.</p>
      </div>
    )
  }
  const me = await getCurrentUser()
  if (!me) {
    redirect(`/login?redirect=/i/${token}`)
  }
  if (!me.isVerified) {
    redirect(`/verify-email?redirect=/i/${token}`)
  }
  const institution = await prisma.tournamentInstitution.findUnique({
    where: { id: info.institutionId }, select: { name: true },
  })
  return (
    <div className="mx-auto max-w-md p-8">
      <PortalClaimForm token={token} institutionName={institution?.name ?? 'Institution'} />
    </div>
  )
}
