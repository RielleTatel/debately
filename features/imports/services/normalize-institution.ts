import { distance } from 'fastest-levenshtein'
import { prisma } from '@/lib/prisma'

export type NormalizationOutcome =
  | { kind: 'alias'; institutionId: string }
  | { kind: 'exact'; institutionId: string }
  | { kind: 'fuzzy'; suggestedInstitutionId: string; suggestedName: string; distance: number }
  | { kind: 'new' }

const MAX_DISTANCE = 3

function canonical(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

export async function normalizeInstitutionName(
  tournamentId: string,
  rawName: string,
): Promise<NormalizationOutcome> {
  const alias = await prisma.institutionAlias.findFirst({
    where: { tournamentId, alias: canonical(rawName) },
  })
  if (alias) return { kind: 'alias', institutionId: alias.resolvedInstitutionId }

  const candidates = await prisma.tournamentInstitution.findMany({
    where: { tournamentId },
    select: { id: true, name: true },
  })
  const target = canonical(rawName)

  for (const c of candidates) {
    if (canonical(c.name) === target) return { kind: 'exact', institutionId: c.id }
  }

  let best: { id: string; name: string; d: number } | null = null
  for (const c of candidates) {
    const d = distance(canonical(c.name), target)
    if (d <= MAX_DISTANCE && (!best || d < best.d)) {
      best = { id: c.id, name: c.name, d }
    }
  }
  if (best) return { kind: 'fuzzy', suggestedInstitutionId: best.id, suggestedName: best.name, distance: best.d }
  return { kind: 'new' }
}

export async function applyConfirmedAlias(
  tournamentId: string,
  alias: string,
  resolvedInstitutionId: string,
): Promise<void> {
  await prisma.institutionAlias.upsert({
    where: { tournamentId_alias: { tournamentId, alias: canonical(alias) } },
    update: { resolvedInstitutionId },
    create: { tournamentId, alias: canonical(alias), resolvedInstitutionId },
  })
}
