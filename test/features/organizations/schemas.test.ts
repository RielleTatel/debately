import { describe, it, expect } from 'vitest'
import {
  createOrganizationSchema, updateOrganizationSchema,
  transferOwnershipSchema, deleteOrganizationSchema, removeMemberSchema,
} from '@/features/organizations/schemas'

describe('createOrganizationSchema', () => {
  it('accepts valid', () => { expect(createOrganizationSchema.safeParse({ name: 'My Org', slug: 'my-org', description: '' }).success).toBe(true) })
  it('rejects short name', () => { expect(createOrganizationSchema.safeParse({ name: 'A', slug: 'my-org' }).success).toBe(false) })
  it('rejects invalid slug', () => { expect(createOrganizationSchema.safeParse({ name: 'My Org', slug: 'My Org' }).success).toBe(false) })
})
describe('updateOrganizationSchema', () => {
  it('accepts', () => { expect(updateOrganizationSchema.safeParse({ name: 'My Org', slug: 'x-y' }).success).toBe(true) })
})
describe('transferOwnershipSchema', () => {
  it('requires toProfileId', () => { expect(transferOwnershipSchema.safeParse({}).success).toBe(false) })
})
describe('deleteOrganizationSchema', () => {
  it('requires confirmName', () => { expect(deleteOrganizationSchema.safeParse({ confirmName: '' }).success).toBe(false) })
})
describe('removeMemberSchema', () => {
  it('requires profileId', () => { expect(removeMemberSchema.safeParse({}).success).toBe(false) })
})
