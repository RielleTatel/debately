import { requireUser } from '@/features/auth/queries'
import { ProfileForm } from '@/features/auth/components/profile-form'
import { ChangePasswordForm } from '@/features/auth/components/change-password-form'
import { ChangeEmailForm } from '@/features/auth/components/change-email-form'
import { AvatarUploader } from '@/features/auth/components/avatar-uploader'

export const metadata = { title: 'Account' }

export default async function AccountPage() {
  const me = await requireUser()

  return (
    <main className="mx-auto max-w-2xl space-y-10 p-6">
      <section>
        <h1 className="mb-4 text-2xl font-semibold">Account</h1>
        <AvatarUploader avatarUrl={me.profile.avatarUrl} />
      </section>
      <section>
        <h2 className="mb-3 text-lg font-medium">Profile</h2>
        <ProfileForm displayName={me.profile.displayName} />
      </section>
      <section>
        <h2 className="mb-3 text-lg font-medium">Change email</h2>
        <ChangeEmailForm currentEmail={me.user.email} />
      </section>
      <section>
        <h2 className="mb-3 text-lg font-medium">Change password</h2>
        <ChangePasswordForm />
      </section>
    </main>
  )
}
