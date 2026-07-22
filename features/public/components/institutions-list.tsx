type Inst = { id: string; name: string; logoUrl: string | null }

export function InstitutionsList({ institutions }: { institutions: Inst[] }) {
  if (institutions.length === 0) return null
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Participating institutions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {institutions.map((i) => (
          <div key={i.id} className="rounded border p-2 text-sm flex items-center gap-2">
            {i.logoUrl && <img src={i.logoUrl} alt={i.name} className="h-6 w-6 rounded" />}
            <span>{i.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
