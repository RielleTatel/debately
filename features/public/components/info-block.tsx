type Props = {
  tournament: {
    name: string
    startDate: Date
    endDate: Date
    venue: string
    address: string
    description: string | null
  }
}

export function InfoBlock({ tournament: t }: Props) {
  return (
    <div>
      <h1 className="text-3xl font-bold">{t.name}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {new Date(t.startDate).toLocaleDateString()} — {new Date(t.endDate).toLocaleDateString()} · {t.venue},{' '}
        {t.address}
      </p>
      {t.description && <p className="mt-3 text-muted-foreground">{t.description}</p>}
    </div>
  )
}
