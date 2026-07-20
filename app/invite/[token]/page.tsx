import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getInvitationByToken } from '@/features/invitations/queries'
import { getCurrentUser } from '@/features/auth/queries'
import { AcceptInvitePanel } from '@/features/invitations/components/accept-invite-panel'

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invitation = await getInvitationByToken(token)
  if (!invitation) notFound()
  const me = await getCurrentUser()
  if (!me) redirect(`/login?redirectTo=${encodeURIComponent(`/invite/${token}`)}`)
  if (!me.isVerified) return (
    <main className="mx-auto max-w-md p-6">
      <p>You must verify your email address before accepting this invitation.</p>
      <p className="mt-2 text-sm"><Link href="/dashboard" className="underline">Go to dashboard</Link></p>
    </main>
  )
  if (invitation.revokedAt || invitation.expiresAt.getTime() < Date.now()) {
    return <main className="mx-auto max-w-md p-6"><p>This invitation is no longer valid.</p></main>
  }
  if (invitation.acceptedAt) redirect(`/organization/${invitation.organization.slug}`)
  if (invitation.email.toLowerCase() !== me.user.email.toLowerCase()) {
    return (
      <main className="mx-auto max-w-md p-6">
        <p>This invitation was sent to <strong>{invitation.email}</strong>, but you are signed in as <strong>{me.user.email}</strong>.</p>
      </main>
    )
  }
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Organization invitation</h1>
      <AcceptInvitePanel token={token} orgName={invitation.organization.name} />
    </main>
  )
}
