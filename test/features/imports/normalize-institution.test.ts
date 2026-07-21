import { describe, it, expect, vi, beforeEach } from 'vitest'
import { normalizeInstitutionName } from '@/features/imports/services/normalize-institution'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tournamentInstitution: { findMany: vi.fn() },
    institutionAlias: { findFirst: vi.fn() },
  },
}))

import { prisma } from '@/lib/prisma'

describe('normalizeInstitutionName', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns "exact" match ignoring case', async () => {
    (prisma.institutionAlias.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(prisma.tournamentInstitution.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'ti_1', name: 'De La Salle University Senior High School' },
    ])
    const r = await normalizeInstitutionName('t1', 'de la salle university senior high school')
    expect(r.kind).toBe('exact')
    if (r.kind === 'exact') expect(r.institutionId).toBe('ti_1')
  })

  it('returns "fuzzy" for Levenshtein ≤3', async () => {
    (prisma.institutionAlias.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(prisma.tournamentInstitution.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'ti_1', name: 'Sultan Kudarat State University' },
    ])
    const r = await normalizeInstitutionName('t1', 'Suktan Kudarat State University')
    expect(r.kind).toBe('fuzzy')
    if (r.kind === 'fuzzy') {
      expect(r.suggestedInstitutionId).toBe('ti_1')
      expect(r.distance).toBeLessThanOrEqual(3)
    }
  })

  it('returns "new" beyond distance threshold', async () => {
    (prisma.institutionAlias.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(prisma.tournamentInstitution.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'ti_1', name: 'Ateneo de Manila' },
    ])
    const r = await normalizeInstitutionName('t1', 'Miriam College')
    expect(r.kind).toBe('new')
  })

  it('respects previously-confirmed alias', async () => {
    (prisma.institutionAlias.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      resolvedInstitutionId: 'ti_1',
    })
    const r = await normalizeInstitutionName('t1', 'ADU')
    expect(r.kind).toBe('alias')
    if (r.kind === 'alias') expect(r.institutionId).toBe('ti_1')
  })
})
