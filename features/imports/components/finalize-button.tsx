'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { finalizeImportAction } from '@/features/imports/actions'
import { ROUTES } from '@/lib/constants'

type Props = {
  tournamentId: string
  importId: string
}

export function FinalizeImportButton({ tournamentId, importId }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button
        type="button"
        disabled={pending}
        onClick={async () => {
          setError(null)
          setPending(true)
          const fd = new FormData()
          fd.append('importId', importId)
          const r = await finalizeImportAction(fd)
          setPending(false)
          if (!r.ok) {
            setError(r.error)
            return
          }
          router.push(`${ROUTES.imports(tournamentId)}/${importId}/summary`)
          router.refresh()
        }}
      >
        {pending ? 'Finalizing…' : 'Finalize import'}
      </Button>
    </div>
  )
}
