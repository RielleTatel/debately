import { describe, it, expect } from 'vitest'
import { slugify, assertSlugAllowed, RESERVED_SLUGS } from '@/lib/slug'

describe('slugify', () => {
  it('lowercases, hyphenates, and strips punctuation', () => {
    expect(slugify('  My Awesome Org! ')).toBe('my-awesome-org')
  })
  it('strips accents', () => { expect(slugify('Café Débat')).toBe('cafe-debat') })
  it('collapses runs of hyphens', () => { expect(slugify('a---b')).toBe('a-b') })
  it('truncates to 64 chars', () => { expect(slugify('a'.repeat(200)).length).toBeLessThanOrEqual(64) })
})

describe('assertSlugAllowed', () => {
  it('throws on reserved word', () => { expect(() => assertSlugAllowed('admin')).toThrow() })
  it('allows non-reserved', () => { expect(() => assertSlugAllowed('my-org')).not.toThrow() })
  it('exports the reserved set', () => { expect(RESERVED_SLUGS.has('login')).toBe(true) })
})
