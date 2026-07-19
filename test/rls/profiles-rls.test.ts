import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

describe('profiles RLS migration', () => {
  const sql = readFileSync(
    path.join(process.cwd(), 'supabase/migrations/0001_profiles_rls.sql'),
    'utf8'
  )

  it('enables RLS on profiles', () => {
    expect(sql).toMatch(/alter table public\.profiles enable row level security/i)
  })

  it('defines self select/update/insert policies', () => {
    expect(sql).toMatch(/profiles_self_select/)
    expect(sql).toMatch(/profiles_self_update/)
    expect(sql).toMatch(/profiles_self_insert/)
  })

  it('scopes policies to auth.uid()', () => {
    expect(sql).toMatch(/auth\.uid\(\)/)
  })
})
