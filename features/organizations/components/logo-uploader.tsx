'use client'
import { useRef, useState, useTransition } from 'react'
import { uploadOrgLogoAction } from '@/features/organizations/actions'
import { Button } from '@/components/ui/button'

export function LogoUploader({ orgId, currentUrl }: { orgId: string; currentUrl: string | null }) {
  const [url, setUrl] = useState(currentUrl)
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-3">
      {url ? <img src={url} alt="Logo" className="h-16 w-16 rounded object-cover" /> : <div className="h-16 w-16 rounded bg-slate-100" />}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0]; if (!file) return
          start(async () => {
            const fd = new FormData(); fd.set('orgId', orgId); fd.set('file', file)
            const r = await uploadOrgLogoAction(fd)
            if (r.ok) { setUrl(r.data.url); setMsg('Logo updated.') } else { setMsg(r.error) }
          })
        }} />
      <Button type="button" disabled={pending} onClick={() => inputRef.current?.click()}>{pending ? 'Uploading…' : 'Change logo'}</Button>
      {msg && <p role="status" className="text-sm">{msg}</p>}
    </div>
  )
}
