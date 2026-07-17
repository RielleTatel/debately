import { createClient } from '@/lib/supabase/server'
import { Errors } from '@/lib/errors'

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw Errors.unauthorized()
  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  return user
}
