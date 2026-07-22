'use client'

import type { RequestStatus } from '@prisma/client'

export function RequestFilterBar({ current, onChange }: { current: RequestStatus | 'ALL'; onChange: (s: RequestStatus | 'ALL') => void }) {
  const options: Array<{ value: RequestStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'MORE_INFO', label: 'More info' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1 text-sm rounded border ${current === o.value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
