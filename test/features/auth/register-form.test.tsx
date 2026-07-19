import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/features/auth/actions', () => ({
  registerAction: vi.fn().mockResolvedValue({ ok: false, error: 'server error' }),
  loginAction: vi.fn(), logoutAction: vi.fn(), forgotPasswordAction: vi.fn(),
  resetPasswordAction: vi.fn(), resendVerificationAction: vi.fn(),
  updateProfileAction: vi.fn(), changePasswordAction: vi.fn(), changeEmailAction: vi.fn(), uploadAvatarAction: vi.fn(),
}))

import { RegisterForm } from '@/features/auth/components/register-form'

describe('<RegisterForm/>', () => {
  it('renders fields and validates client-side', async () => {
    render(<RegisterForm />)
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
  })
  it('shows server error on failed submit', async () => {
    render(<RegisterForm />)
    await userEvent.type(screen.getByLabelText(/display name/i), 'Test User')
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Valid1Password')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText('server error')).toBeInTheDocument()
  })
})
