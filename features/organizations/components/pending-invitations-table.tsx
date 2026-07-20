'use client'
import { useTransition } from 'react'
import { revokeInvitationAction } from '@/features/invitations/actions'
import type { PendingInvitation } from '@/features/organizations/types'

export function PendingInvitationsTable({ invitations, isOwner }: { invitations: PendingInvitation[]; isOwner: boolean }) {
  const [pending, start] = useTransition()
  if (invitations.length === 0) return <p className="text-sm text-slate-500">No pending invitations.</p>
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-slate-500">
        <tr>
          <th className="p-2">Email</th>
          <th className="p-2">Role</th>
          <th className="p-2">Expires</th>
          {isOwner && <th className="p-2" />}
        </tr>
      </thead>
      <tbody>
        {invitations.map((i) => (
          <tr key={i.id} className="border-t">
            <td className="p-2">{i.email}</td>
            <td className="p-2">{i.role}</td>
            <td className="p-2">{i.expiresAt.toLocaleDateString()}</td>
            {isOwner && (
              <td className="p-2">
                <button
                  disabled={pending}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50"
                  onClick={() => start(async () => {
                    const fd = new FormData(); fd.set('invitationId', i.id)
                    await revokeInvitationAction(fd)
                  })}
                >
                  Revoke
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
