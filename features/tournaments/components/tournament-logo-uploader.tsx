'use client'
import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { uploadTournamentLogoAction } from '@/features/tournaments/actions'

export function TournamentLogoUploader({ tournamentId, currentUrl, readOnly }: { tournamentId: string; currentUrl: string | null; readOnly: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setError(null)
    const fd = new FormData(); fd.set('tournamentId', tournamentId); fd.set('file', f)
    startTransition(async () => {
      const r = await uploadTournamentLogoAction(fd)
      if (!r.ok) setError(r.error); else setUrl(r.data.url)
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  return (
    <div className="space-y-2">
      {url && <Image src={url} alt="Tournament logo" width={96} height={96} className="rounded" />}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png" onChange={onChange} disabled={readOnly || pending} className="hidden" id="tournament-logo-input" />
      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={readOnly || pending}>
        {pending ? 'Uploading...' : url ? 'Replace logo' : 'Upload logo'}
      </Button>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <p className="text-xs text-muted-foreground">JPG or PNG, max 2MB.</p>
    </div>
  )
}
