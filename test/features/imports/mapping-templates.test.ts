import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveMappingTemplateAction, deleteMappingTemplateAction } from '@/features/imports/actions/mapping-templates'

vi.mock('@/lib/prisma', () => ({
  prisma: { columnMapping: { create: vi.fn(), delete: vi.fn(), findUnique: vi.fn() } },
}))
vi.mock('@/features/organizations/permissions', () => ({ requireOrgMember: vi.fn() }))
import { prisma } from '@/lib/prisma'

describe('saveMappingTemplateAction', () => {
  beforeEach(() => vi.clearAllMocks())
  it('creates a template scoped to the org', async () => {
    (prisma.columnMapping.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'tpl_1' })
    const f = new FormData()
    f.append('orgId', 'o1'); f.append('name', 'ZDO Phase 2')
    f.append('mapping', JSON.stringify({ entries: [], repeatGroups: [] }))
    const r = await saveMappingTemplateAction(f)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.data.templateId).toBe('tpl_1')
  })
})

describe('deleteMappingTemplateAction', () => {
  it('returns error when template not found', async () => {
    (prisma.columnMapping.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const f = new FormData(); f.append('templateId', 'tpl_missing')
    const r = await deleteMappingTemplateAction(f)
    expect(r.ok).toBe(false)
  })
})
