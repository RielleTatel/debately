import { subunitFactor } from '@/lib/money'
import type { InvoiceLineKind } from '@prisma/client'

export type DraftLine = {
  kind: InvoiceLineKind
  label: string
  quantity: number
  unitPriceMinor: number
  subtotalMinor: number
}

type FeeStructure = { kind: 'none' | 'itemized'; lines: { label: string; amount: number; unit: 'per_team' | 'per_adjudicator' | 'flat' }[] }

export type EvaluateInput = { feeStructure: FeeStructure; teamCount: number; adjudicatorCount: number; currency: string }

export type EvaluateResult = { lineItems: DraftLine[]; subtotalMinor: number }

function unitToKind(unit: 'per_team' | 'per_adjudicator' | 'flat'): InvoiceLineKind {
  if (unit === 'per_team') return 'TEAM_FEE'
  if (unit === 'per_adjudicator') return 'ADJUDICATOR_FEE'
  return 'FLAT_FEE'
}

function amountToMinor(major: number, currency: string): number {
  return Math.round(major * subunitFactor(currency))
}

export function evaluateFeeStructure(input: EvaluateInput): EvaluateResult {
  const { feeStructure, teamCount, adjudicatorCount, currency } = input
  if (feeStructure.kind === 'none') return { lineItems: [], subtotalMinor: 0 }
  const lineItems: DraftLine[] = []
  for (const line of feeStructure.lines) {
    const unitPriceMinor = amountToMinor(line.amount, currency)
    let quantity = 0
    if (line.unit === 'per_team') quantity = teamCount
    else if (line.unit === 'per_adjudicator') quantity = adjudicatorCount
    else if (line.unit === 'flat') quantity = 1
    if (quantity <= 0 || unitPriceMinor <= 0) continue
    lineItems.push({
      kind: unitToKind(line.unit),
      label: line.label || `${line.unit} fee`,
      quantity, unitPriceMinor,
      subtotalMinor: quantity * unitPriceMinor,
    })
  }
  const subtotalMinor = lineItems.reduce((acc, l) => acc + l.subtotalMinor, 0)
  return { lineItems, subtotalMinor }
}
