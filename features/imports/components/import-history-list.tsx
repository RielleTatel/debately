'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/lib/constants'
import type { CsvImport } from '@prisma/client'

type Item = CsvImport & { uploaderName: string | null }

const STATUS_LABEL: Record<CsvImport['status'], string> = {
  STAGING: 'Staging',
  PROCESSED: 'Awaiting finalize',
  FINALIZED: 'Finalized',
  ROLLED_BACK: 'Rolled back',
}

const linkClasses =
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

export function ImportHistoryList({
  tournamentId, imports,
}: { tournamentId: string; imports: Item[] }) {
  if (imports.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-sm text-muted-foreground">No imports yet.</p>
        <Link
          href={ROUTES.imports(tournamentId) + '/new'}
          className={`mt-4 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${linkClasses}`}
        >
          Upload a CSV
        </Link>
      </div>
    )
  }
  return (
    <ul className="divide-y rounded-lg border">
      {imports.map((imp) => (
        <li key={imp.id} className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{imp.phaseLabel}</p>
              <Badge variant="outline">{STATUS_LABEL[imp.status]}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Uploaded {new Date(imp.createdAt).toLocaleString()} by {imp.uploaderName ?? 'Unknown'}
            </p>
          </div>
          <div className="flex gap-2">
            {imp.status === 'STAGING' && (
              <Link
                href={`${ROUTES.imports(tournamentId)}/${imp.id}/mapping`}
                className={`border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 ${linkClasses}`}
              >
                Continue mapping
              </Link>
            )}
            {imp.status === 'PROCESSED' && (
              <Link
                href={`${ROUTES.imports(tournamentId)}/${imp.id}/review`}
                className={`bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3 ${linkClasses}`}
              >
                Review
              </Link>
            )}
            {imp.status === 'FINALIZED' && (
              <Link
                href={`${ROUTES.imports(tournamentId)}/${imp.id}/summary`}
                className={`border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 ${linkClasses}`}
              >
                View summary
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
