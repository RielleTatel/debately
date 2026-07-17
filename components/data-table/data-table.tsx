type DataTableProps<T> = {
  data: T[]
  columns: { key: keyof T; header: string }[]
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
}: DataTableProps<T>) {
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th key={String(col.key)} className="px-4 py-3 text-left font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3">
                  {String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
