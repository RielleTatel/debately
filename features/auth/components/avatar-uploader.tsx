'use client'

import { useState, useTransition } from 'react'
import { uploadAvatarAction } from '@/features/auth/actions'

export function AvatarUploader({ avatarUrl }: { avatarUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(avatarUrl)
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData(); fd.set('file', file)
    start(async () => {
      const r = await uploadAvatarAction(fd)
      if (r.ok) { setPreview(r.data.url); setMsg('Avatar updated.') }
      else { setMsg(r.error) }
    })
  }

  return (
    <div className="space-y-3">
      {preview
        ? <img src={preview} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
        : <div className="h-24 w-24 rounded-full bg-muted" aria-label="No avatar" />}
      <label className="block">
        <span className="sr-only">Upload avatar</span>
        <input type="file" accept="image/jpeg,image/png" onChange={onChange} disabled={pending} />
      </label>
      {msg && <p role="status" className="text-sm">{msg}</p>}
    </div>
  )
}
