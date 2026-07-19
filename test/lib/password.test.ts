import { describe, it, expect } from 'vitest'
import { validatePassword, passwordSchema } from '@/lib/password'

describe('validatePassword', () => {
  it('rejects short passwords', () => {
    expect(validatePassword('Ab1xyz')).toEqual({
      ok: false,
      message: 'Password must be at least 8 characters',
    })
  })
  it('rejects missing uppercase', () => {
    expect(validatePassword('lowercase1')).toEqual({
      ok: false,
      message: 'Password must contain at least one uppercase letter',
    })
  })
  it('rejects missing number', () => {
    expect(validatePassword('NoNumbers')).toEqual({
      ok: false,
      message: 'Password must contain at least one number',
    })
  })
  it('accepts a valid password', () => {
    expect(validatePassword('Valid1Password')).toEqual({ ok: true })
  })
})

describe('passwordSchema', () => {
  it('parses valid, rejects invalid', () => {
    expect(passwordSchema.safeParse('Valid1Password').success).toBe(true)
    expect(passwordSchema.safeParse('short').success).toBe(false)
  })
})
