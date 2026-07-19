import { createClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'

export const authService = {
  async signUp(input: { email: string; password: string; displayName: string }) {
    const supabase = await createClient()
    return await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { display_name: input.displayName },
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`,
      },
    })
  },

  async signIn(input: { email: string; password: string }) {
    const supabase = await createClient()
    return await supabase.auth.signInWithPassword(input)
  },

  async signOut() {
    const supabase = await createClient()
    return await supabase.auth.signOut()
  },

  async sendPasswordReset(email: string) {
    const supabase = await createClient()
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
    })
  },

  async resendVerification(email: string) {
    const supabase = await createClient()
    return await supabase.auth.resend({ type: 'signup', email })
  },

  async getUser() {
    const supabase = await createClient()
    return await supabase.auth.getUser()
  },
}
