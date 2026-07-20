import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

describe('organizations RLS migration', () => {
  const sql = readFileSync(
    path.join(process.cwd(), 'supabase/migrations/0003_organizations_rls.sql'),
    'utf8',
  )

  it('enables RLS on all four org tables', () => {
    for (const table of ['organizations', 'organization_members', 'organization_slug_aliases', 'organization_invitations']) {
      expect(sql).toMatch(new RegExp(`alter table public\\.${table} enable row level security`, 'i'))
    }
  })

  it('scopes org reads to members', () => {
    expect(sql).toMatch(/organizations_member_select/)
  })

  it('scopes org writes to owners', () => {
    expect(sql).toMatch(/organizations_owner_update/)
    expect(sql).toMatch(/organizations_owner_delete/)
  })

  it('allows any authenticated user to insert an org (self-owned)', () => {
    expect(sql).toMatch(/organizations_authenticated_insert/)
  })

  it('makes slug aliases publicly readable for redirects', () => {
    expect(sql).toMatch(/organization_slug_aliases_public_select/)
  })

  it('lets an invitee read their own invitation by email', () => {
    expect(sql).toMatch(/organization_invitations_invitee_select/)
  })
})
