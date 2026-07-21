'use client'
import { useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { uploadRulesPdfAction } from '@/features/tournaments/actions'

export function TournamentRulesUploader({ tournamentId, currentUrl, readOnly }: { tournamentId: string; currentUrl: string | null; readOnly: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setError(null)
    const fd = new FormData(); fd.set('tournamentId', tournamentId); fd.set('file', f)
    startTransition(async () => {
      const r = await uploadRulesPdfAction(fd)
      if (!r.ok) setError(r.error); else setUrl(r.data.url)
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  return (
    <div className="space-y-2">
      {url && (
        <Link href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
          View current rules PDF
        </Link>
      )}
      <input ref={inputRef} type="file" accept="application/pdf" onChange={onChange} disabled={readOnly || pending} className="hidden" id="tournament-rules-input" />
      <div>
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={readOnly || pending}>
          {pending ? 'Uploading...' : url ? 'Replace rules PDF' : 'Upload rules PDF'}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <p className="text-xs text-muted-foreground">PDF only, max 5MB.</p>
    </div>
  )
}
