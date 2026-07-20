import type { PendingInvitation } from '@/features/organizations/types'
export function PendingInvitationsTable({ invitations }: { invitations: PendingInvitation[] }) {
  if (invitations.length === 0) return <p className="text-sm text-slate-500">No pending invitations.</p>
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-slate-500"><tr><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Expires</th></tr></thead>
      <tbody>{invitations.map(i => (
        <tr key={i.id} className="border-t"><td className="p-2">{i.email}</td><td className="p-2">{i.role}</td><td className="p-2">{i.expiresAt.toLocaleDateString()}</td></tr>
      ))}</tbody>
    </table>
  )
}
