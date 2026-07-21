import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/dashboard'),
  useRouter: vi.fn().mockReturnValue({ push: vi.fn(), replace: vi.fn() }),
  redirect: vi.fn(),
}))

vi.mock('@/features/auth/queries', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    user: { id: 'u1', email: 'a@b.com' },
    profile: { id: 'p1', displayName: 'A', avatarUrl: null },
    isVerified: false,
  }),
  requireUser: vi.fn(), requireVerifiedUser: vi.fn(),
}))
vi.mock('@/features/auth/actions', () => ({
  resendVerificationAction: vi.fn(), logoutAction: vi.fn(),
  registerAction: vi.fn(), loginAction: vi.fn(), forgotPasswordAction: vi.fn(),
  resetPasswordAction: vi.fn(), updateProfileAction: vi.fn(), changePasswordAction: vi.fn(),
  changeEmailAction: vi.fn(), uploadAvatarAction: vi.fn(),
}))

import DashboardLayout from '@/app/(dashboard)/layout'

describe('DashboardLayout', () => {
  it('renders verify banner when unverified', async () => {
    const ui = await (DashboardLayout as any)({ children: <div>child</div> })
    render(ui)
    expect(screen.getByText(/verify your email/i)).toBeInTheDocument()
    expect(screen.getByText('child')).toBeInTheDocument()
  })
})
