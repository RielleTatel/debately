export type DiffDecision = {
  mode: 'apply' | 'apply-selected' | 'keep-existing'
  selectedFields: string[]
}

// Existing imports persist this marker in messages; keep its wire format stable.
export function encodeDiffDecision(decision: DiffDecision) {
  return `DIFF_DECISION:${decision.mode}:${decision.selectedFields.join(',')}`
}

export function readDiffDecision(messages: string[]): DiffDecision | undefined {
  const marker = messages.find((message) => message.startsWith('DIFF_DECISION:'))
  if (!marker) return undefined
  const [, mode, fields] = marker.split(':')
  if (mode !== 'apply' && mode !== 'apply-selected' && mode !== 'keep-existing') return undefined
  return { mode, selectedFields: fields?.split(',').filter(Boolean) ?? [] }
}
