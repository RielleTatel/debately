'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { startCsvImportAction } from '@/features/imports/actions'
import { phaseLabelSchema } from '@/features/imports/schemas'
import { ROUTES } from '@/lib/constants'

const clientSchema = z.object({
  phaseLabel: phaseLabelSchema,
})

export function CsvUploadForm({ tournamentId }: { tournamentId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: { phaseLabel: '' },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setError(null)
        if (!file) { setError('Please choose a CSV file'); return }
        setPending(true)
        const fd = new FormData()
        fd.append('tournamentId', tournamentId)
        fd.append('phaseLabel', values.phaseLabel)
        fd.append('file', file)
        const r = await startCsvImportAction(fd)
        setPending(false)
        if (!r.ok) { setError(r.error); return }
        router.push(`${ROUTES.imports(tournamentId)}/${r.data.importId}/mapping`)
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="phaseLabel">Phase label</Label>
        <Input id="phaseLabel" placeholder="Phase 2 — Team Registration" {...form.register('phaseLabel')} />
        {form.formState.errors.phaseLabel && (
          <p className="text-sm text-destructive">{form.formState.errors.phaseLabel.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">CSV file</Label>
        <Input
          id="file"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file && <p className="text-xs text-muted-foreground">{file.name} · {(file.size / 1024).toFixed(1)} KB</p>}
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? 'Uploading…' : 'Upload'}
        </Button>
      </div>
    </form>
  )
}
