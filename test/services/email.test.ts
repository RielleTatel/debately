import { describe, it, expect, vi, beforeEach } from 'vitest'

const send = vi.fn().mockResolvedValue({ data: { id: 'e1' }, error: null })
vi.mock('resend', () => ({ Resend: vi.fn(function () { return { emails: { send } } }) }))

beforeEach(() => send.mockClear())

describe('emailService', () => {
  it('sends verification email with a link', async () => {
    const { emailService } = await import('@/services/email')
    await emailService.sendVerification({ to: 'a@b.com', verifyUrl: 'https://x/y', displayName: 'A' })
    expect(send).toHaveBeenCalledOnce()
    const arg = send.mock.calls[0][0]
    expect(arg.to).toBe('a@b.com')
    expect(arg.subject).toMatch(/verify/i)
    expect(arg.html).toContain('https://x/y')
  })

  it('sends password reset email', async () => {
    const { emailService } = await import('@/services/email')
    await emailService.sendPasswordReset({ to: 'a@b.com', resetUrl: 'https://x/r', displayName: 'A' })
    expect(send).toHaveBeenCalledOnce()
    expect(send.mock.calls[0][0].subject).toMatch(/reset/i)
  })

  it('sends welcome email', async () => {
    const { emailService } = await import('@/services/email')
    await emailService.sendWelcome({ to: 'a@b.com', displayName: 'A' })
    expect(send).toHaveBeenCalledOnce()
  })
})
