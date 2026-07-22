type Asset = { id: string; label: string; kind: string; storagePath: string }

export function DocsList({ assets }: { assets: Asset[] }) {
  if (assets.length === 0) return null
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Documents</h2>
      <ul className="space-y-1">
        {assets.map((a) => (
          <li key={a.id}>
            <a
              href={a.storagePath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {a.label} ({a.kind})
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
