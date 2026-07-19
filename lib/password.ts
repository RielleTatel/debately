import { z } from 'zod'

export type PasswordCheck = { ok: true } | { ok: false; message: string }

export function validatePassword(pw: string): PasswordCheck {
  if (pw.length < 8) return { ok: false, message: 'Password must be at least 8 characters' }
  if (!/[A-Z]/.test(pw)) return { ok: false, message: 'Password must contain at least one uppercase letter' }
  if (!/[0-9]/.test(pw)) return { ok: false, message: 'Password must contain at least one number' }
  return { ok: true }
}

export const passwordSchema = z.string().superRefine((pw, ctx) => {
  const r = validatePassword(pw)
  if (!r.ok) ctx.addIssue({ code: z.ZodIssueCode.custom, message: r.message })
})
