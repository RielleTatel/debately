import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

export const metadata = { title: 'Set new password' }

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto max-w-sm space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Set a new password</h1>
      <ResetPasswordForm />
    </main>
  )
}
