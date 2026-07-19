import { LoginForm } from '@/features/auth/components/login-form'
import Link from 'next/link'

export const metadata = { title: 'Sign in' }

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-sm space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <LoginForm />
      <p className="text-sm">
        <Link href="/forgot-password">Forgot password?</Link>
      </p>
    </main>
  )
}
