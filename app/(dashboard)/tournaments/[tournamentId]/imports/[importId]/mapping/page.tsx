import { requireImportEditor } from '@/features/imports/permissions'
import { tournamentImportsStorage } from '@/services/storage'
import { parseCsvHeaders } from '@/features/imports/services/csv-parser'
import { listMappingTemplates } from '@/features/imports/queries'
import { ColumnMappingTable } from '@/features/imports/components/column-mapping-table'
import type { MappingSpec } from '@/features/imports/types'

export default async function MappingPage({
  params,
}: { params: Promise<{ tournamentId: string; importId: string }> }) {
  const { tournamentId, importId } = await params
  const { import: rec, orgId } = await requireImportEditor(importId)
  const csvText = await tournamentImportsStorage.readText(rec.storagePath)
  const headers = parseCsvHeaders(csvText)
  const templates = await listMappingTemplates(orgId)
  const initialMapping = (rec.mappingJson as unknown as MappingSpec) ?? null
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Map columns</h1>
        <p className="text-sm text-muted-foreground">Assign each CSV column to a system field. Mark unused columns as Ignore.</p>
      </div>
      <ColumnMappingTable
        tournamentId={tournamentId}
        importId={importId}
        orgId={orgId}
        headers={headers}
        initialMapping={initialMapping}
        templates={templates}
      />
    </div>
  )
}
