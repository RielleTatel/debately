import { describe, it, expect, vi, beforeEach } from 'vitest'

const sendToMany = vi.fn(async () => undefined)
const memberFindMany = vi.fn(async () => [{ profile: { userId: 'u1' } }, { profile: { userId: 'u2' } }])

vi.mock('@/services/notifications', () => ({
  notificationService: { send: vi.fn(), sendToMany },
}))
vi.mock('@/lib/prisma', () => ({
  prisma: { organizationMember: { findMany: memberFindMany } },
}))

beforeEach(() => { sendToMany.mockClear(); memberFindMany.mockClear() })

describe('notifyIfSensitiveChanged', () => {
  const base = {
    id: 't1',
    orgId: 'o1',
    name: 'T',
    registrationDeadline: new Date('2026-08-01'),
    paymentDeadline: null,
    feeStructure: { kind: 'none', lines: [] },
  } as any
  it('does nothing when nothing sensitive changed', async () => {
    const { notifyIfSensitiveChanged } = await import('@/features/tournaments/services')
    await notifyIfSensitiveChanged(base, { ...base, name: 'Renamed' })
    expect(sendToMany).not.toHaveBeenCalled()
  })
  it('fires when registrationDeadline changed', async () => {
    const { notifyIfSensitiveChanged } = await import('@/features/tournaments/services')
    await notifyIfSensitiveChanged(base, { ...base, registrationDeadline: new Date('2026-07-30') })
    expect(sendToMany).toHaveBeenCalledOnce()
  })
  it('fires when feeStructure JSON changed', async () => {
    const { notifyIfSensitiveChanged } = await import('@/features/tournaments/services')
    await notifyIfSensitiveChanged(base, {
      ...base,
      feeStructure: { kind: 'itemized', lines: [{ label: 'x', amount: 1, unit: 'flat' }] },
    })
    expect(sendToMany).toHaveBeenCalledOnce()
  })
  it('fires when paymentDeadline changed from null to a date', async () => {
    const { notifyIfSensitiveChanged } = await import('@/features/tournaments/services')
    await notifyIfSensitiveChanged(base, { ...base, paymentDeadline: new Date('2026-07-28') })
    expect(sendToMany).toHaveBeenCalledOnce()
  })
})
