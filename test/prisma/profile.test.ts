import { describe, it, expect, vi } from 'vitest'

vi.mock('@prisma/client', () => {
  const profile = { findUnique: vi.fn(), create: vi.fn(), upsert: vi.fn() }
  return {
    PrismaClient: vi.fn(function () {
      return { profile }
    }),
  }
})

describe('Profile model wiring', () => {
  it('exposes profile CRUD via prisma client', async () => {
    const { prisma } = await import('@/lib/prisma')
    expect(prisma.profile.findUnique).toBeDefined()
    expect(prisma.profile.upsert).toBeDefined()
  })
})
