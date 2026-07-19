import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

export const metadata = { title: 'Reset password' }

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-sm space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Reset password</h1>
      <ForgotPasswordForm />
    </main>
  )
}
