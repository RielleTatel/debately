import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { resend } = vi.hoisted(() => ({ resend: vi.fn().mockResolvedValue({ ok: true }) }))

vi.mock('@/features/auth/actions', () => ({
  resendVerificationAction: resend,
  registerAction: vi.fn(), loginAction: vi.fn(), logoutAction: vi.fn(),
  forgotPasswordAction: vi.fn(), resetPasswordAction: vi.fn(),
  updateProfileAction: vi.fn(), changePasswordAction: vi.fn(), changeEmailAction: vi.fn(), uploadAvatarAction: vi.fn(),
}))

import { VerifyBanner } from '@/features/auth/components/verify-banner'

describe('<VerifyBanner/>', () => {
  it('renders and calls resend', async () => {
    render(<VerifyBanner email="a@b.com" />)
    expect(screen.getByText(/verify/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /resend/i }))
    expect(resend).toHaveBeenCalled()
  })
})
