import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { LoginInput, RegisterInput } from '@/features/auth/types'

export const authService = {
  async signIn({ email, password }: LoginInput) {
    const supabase = await createClient()
    return supabase.auth.signInWithPassword({ email, password })
  },

  async signUp({ email, password, displayName }: RegisterInput) {
    const supabase = await createClient()
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
  },

  async signOut() {
    const supabase = await createClient()
    return supabase.auth.signOut()
  },

  async sendPasswordReset(email: string) {
    const supabase = await createClient()
    return supabase.auth.resetPasswordForEmail(email)
  },

  async deleteUser(userId: string) {
    const admin = createAdminClient()
    return admin.auth.admin.deleteUser(userId)
  },
}
