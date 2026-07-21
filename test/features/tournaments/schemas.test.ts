import { describe, it, expect } from 'vitest'
import {
  createTournamentSchema,
  updateFinanceSettingsSchema,
  scheduleEntrySchema,
  archiveTournamentSchema,
} from '@/features/tournaments/schemas'

describe('createTournamentSchema', () => {
  const base = {
    name: 'Championship 2026',
    slug: 'champ-2026',
    format: 'BP',
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-08-03T00:00:00Z',
    registrationDeadline: '2026-07-25T00:00:00Z',
    venue: 'Main Hall',
    address: '123 Debate St',
    maxTeamSlots: 32,
  }
  it('accepts valid input', () => {
    expect(createTournamentSchema.safeParse(base).success).toBe(true)
  })
  it('rejects endDate before startDate', () => {
    const r = createTournamentSchema.safeParse({ ...base, endDate: '2026-07-30T00:00:00Z' })
    expect(r.success).toBe(false)
  })
  it('rejects registrationDeadline after startDate', () => {
    const r = createTournamentSchema.safeParse({ ...base, registrationDeadline: '2026-08-02T00:00:00Z' })
    expect(r.success).toBe(false)
  })
  it('rejects reserved slug', () => {
    const r = createTournamentSchema.safeParse({ ...base, slug: 'settings' })
    expect(r.success).toBe(false)
  })
  it('rejects maxTeamSlots below 1', () => {
    const r = createTournamentSchema.safeParse({ ...base, maxTeamSlots: 0 })
    expect(r.success).toBe(false)
  })
})

describe('updateFinanceSettingsSchema', () => {
  it('accepts itemized fee lines', () => {
    const r = updateFinanceSettingsSchema.safeParse({
      currency: 'PHP',
      feeStructure: { kind: 'itemized', lines: [{ label: 'Team fee', amount: 1500, unit: 'per_team' }] },
      paymentDeadline: '2026-07-28T00:00:00Z',
    })
    expect(r.success).toBe(true)
  })
  it('rejects unknown unit', () => {
    const r = updateFinanceSettingsSchema.safeParse({
      currency: 'PHP',
      feeStructure: { kind: 'itemized', lines: [{ label: 'x', amount: 1, unit: 'per_thing' }] },
    })
    expect(r.success).toBe(false)
  })
  it('rejects negative amount', () => {
    const r = updateFinanceSettingsSchema.safeParse({
      currency: 'PHP',
      feeStructure: { kind: 'itemized', lines: [{ label: 'x', amount: -1, unit: 'flat' }] },
    })
    expect(r.success).toBe(false)
  })
})

describe('scheduleEntrySchema', () => {
  it('accepts valid entry', () => {
    const r = scheduleEntrySchema.safeParse({
      label: 'Round 1',
      kind: 'ROUND',
      startAt: '2026-08-01T09:00:00Z',
      endAt: '2026-08-01T10:30:00Z',
    })
    expect(r.success).toBe(true)
  })
  it('rejects endAt before startAt', () => {
    const r = scheduleEntrySchema.safeParse({
      label: 'Round 1',
      kind: 'ROUND',
      startAt: '2026-08-01T10:00:00Z',
      endAt: '2026-08-01T09:00:00Z',
    })
    expect(r.success).toBe(false)
  })
})

describe('archiveTournamentSchema', () => {
  it('requires confirmName', () => {
    expect(archiveTournamentSchema.safeParse({ confirmName: '' }).success).toBe(false)
    expect(archiveTournamentSchema.safeParse({ confirmName: 'My Tournament' }).success).toBe(true)
  })
})
