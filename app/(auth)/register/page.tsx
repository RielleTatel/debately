import { RegisterForm } from '@/features/auth/components/register-form'

export const metadata = { title: 'Create account' }

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-sm space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <RegisterForm />
    </main>
  )
}
