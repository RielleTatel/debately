'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export type RepeatGroupState = { name: string; repetitions: number }

export function RepeatingGroupControls({
  groups, onChange,
}: {
  groups: RepeatGroupState[]
  onChange: (groups: RepeatGroupState[]) => void
}) {
  const setReps = (name: string, r: number) =>
    onChange(groups.map((g) => (g.name === name ? { ...g, repetitions: r } : g)))
  const add = () => onChange([...groups, { name: `group-${groups.length + 1}`, repetitions: 2 }])
  const remove = (name: string) => onChange(groups.filter((g) => g.name !== name))
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Repeating column groups</Label>
        <Button size="sm" variant="outline" onClick={add}>Add group</Button>
      </div>
      {groups.length === 0 ? (
        <p className="text-xs text-muted-foreground">Use groups when the same team fields appear twice in a row (e.g., "Team 1" + "Team 2").</p>
      ) : (
        <ul className="space-y-2">
          {groups.map((g) => (
            <li key={g.name} className="flex items-center gap-2">
              <Input value={g.name} readOnly className="max-w-[10rem]" />
              <Input
                type="number" min={2} max={10} value={g.repetitions}
                onChange={(e) => setReps(g.name, Number(e.target.value))}
                className="max-w-[6rem]"
              />
              <Button size="sm" variant="ghost" onClick={() => remove(g.name)}>Remove</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
