'use client'

import { Button } from '@/components/ui/button'
import type { ColumnMapping } from '@prisma/client'

export function MappingTemplatePicker({
  templates, onApply,
}: {
  templates: ColumnMapping[]
  onApply: (template: ColumnMapping) => void
}) {
  if (templates.length === 0) return null
  return (
    <div className="rounded-lg border p-3">
      <p className="text-sm font-medium">Reuse an existing mapping</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {templates.map((t) => (
          <li key={t.id}>
            <Button size="sm" variant="outline" onClick={() => onApply(t)}>{t.name}</Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
