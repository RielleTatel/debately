import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { update } = vi.hoisted(() => ({ update: vi.fn().mockResolvedValue({ ok: true, data: undefined }) }))
vi.mock('@/features/auth/actions', () => ({
  updateProfileAction: update,
  registerAction: vi.fn(), loginAction: vi.fn(), logoutAction: vi.fn(),
  forgotPasswordAction: vi.fn(), resetPasswordAction: vi.fn(), resendVerificationAction: vi.fn(),
  changePasswordAction: vi.fn(), changeEmailAction: vi.fn(), uploadAvatarAction: vi.fn(),
}))

import { ProfileForm } from '@/features/auth/components/profile-form'

describe('<ProfileForm/>', () => {
  it('submits display name update', async () => {
    render(<ProfileForm displayName="Old Name" />)
    const input = screen.getByLabelText(/display name/i)
    await userEvent.clear(input); await userEvent.type(input, 'New Name')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(update).toHaveBeenCalled()
  })
})
