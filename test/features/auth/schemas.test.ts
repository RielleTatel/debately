import { describe, it, expect } from 'vitest'
import {
  registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema,
  updateProfileSchema, changePasswordSchema, changeEmailSchema,
} from '@/features/auth/schemas'

describe('auth schemas', () => {
  it('registerSchema enforces password policy and display name length', () => {
    expect(registerSchema.safeParse({ email: 'a@b.com', password: 'weak', displayName: 'Ok Name' }).success).toBe(false)
    expect(registerSchema.safeParse({ email: 'a@b.com', password: 'Valid1Password', displayName: 'A' }).success).toBe(false)
    expect(registerSchema.safeParse({ email: 'a@b.com', password: 'Valid1Password', displayName: 'Ok Name' }).success).toBe(true)
  })
  it('resetPasswordSchema requires matching passwords', () => {
    expect(resetPasswordSchema.safeParse({ password: 'Valid1Password', confirmPassword: 'Different1Pw' }).success).toBe(false)
    expect(resetPasswordSchema.safeParse({ password: 'Valid1Password', confirmPassword: 'Valid1Password' }).success).toBe(true)
  })
  it('changePasswordSchema requires current + matching new', () => {
    expect(changePasswordSchema.safeParse({
      currentPassword: 'anything',
      newPassword: 'Valid1Password',
      confirmPassword: 'Valid1Password',
    }).success).toBe(true)
  })
  it('changeEmailSchema requires new email + current password', () => {
    expect(changeEmailSchema.safeParse({ newEmail: 'new@x.com', currentPassword: 'anything' }).success).toBe(true)
    expect(changeEmailSchema.safeParse({ newEmail: 'not-email', currentPassword: 'anything' }).success).toBe(false)
  })
  it('forgotPasswordSchema and loginSchema validate email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'no' }).success).toBe(false)
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'Whatever1' }).success).toBe(true)
  })
  it('updateProfileSchema validates display name', () => {
    expect(updateProfileSchema.safeParse({ displayName: 'x' }).success).toBe(false)
    expect(updateProfileSchema.safeParse({ displayName: 'Valid Name' }).success).toBe(true)
  })
})
