'use client'
import { useTransition } from 'react'
import { removeMemberAction } from '@/features/organizations/actions'
import type { MemberWithProfile } from '@/features/organizations/types'

export function MembersTable({ members, isOwner, currentProfileId, orgId }: {
  members: MemberWithProfile[]; isOwner: boolean; currentProfileId: string; orgId: string
}) {
  const [pending, start] = useTransition()
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-slate-500">
        <tr>
          <th className="p-2">Name</th>
          <th className="p-2">Role</th>
          <th className="p-2">Joined</th>
          {isOwner && <th className="p-2" />}
        </tr>
      </thead>
      <tbody>
        {members.map((m) => (
          <tr key={m.id} className="border-t">
            <td className="p-2">{m.profile.displayName}</td>
            <td className="p-2">{m.role}</td>
            <td className="p-2">{m.joinedAt.toLocaleDateString()}</td>
            {isOwner && (
              <td className="p-2">
                {m.profileId !== currentProfileId && m.role !== 'OWNER' && (
                  <button
                    disabled={pending}
                    className="text-xs text-red-600 hover:underline disabled:opacity-50"
                    onClick={() => start(async () => {
                      const fd = new FormData(); fd.set('orgId', orgId); fd.set('profileId', m.profileId)
                      await removeMemberAction(fd)
                    })}
                  >
                    Remove
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
