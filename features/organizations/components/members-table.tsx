import type { MemberWithProfile } from '@/features/organizations/types'
export function MembersTable({ members }: { members: MemberWithProfile[] }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-slate-500"><tr><th className="p-2">Name</th><th className="p-2">Role</th><th className="p-2">Joined</th></tr></thead>
      <tbody>{members.map(m => (
        <tr key={m.id} className="border-t"><td className="p-2">{m.profile.displayName}</td><td className="p-2">{m.role}</td><td className="p-2">{m.joinedAt.toLocaleDateString()}</td></tr>
      ))}</tbody>
    </table>
  )
}
