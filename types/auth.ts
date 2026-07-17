import type { User } from '@supabase/supabase-js'
import type { Role } from '@/lib/permissions'

export type AuthUser = User

export type UserProfile = {
  id: string
  userId: string
  displayName: string
  avatarUrl: string | null
  role: Role
  organizationId: string | null
  createdAt: Date
  updatedAt: Date
}

export type SessionWithProfile = {
  user: AuthUser
  profile: UserProfile | null
}
