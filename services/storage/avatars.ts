import { createClient } from '@/lib/supabase/server'
import { Errors } from '@/lib/errors'

const BUCKET = 'avatars'
const MAX = 2 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png'])

export const avatarStorage = {
  validate(file: File) {
    if (!ALLOWED.has(file.type)) return { ok: false as const, message: 'Only JPG or PNG allowed' }
    if (file.size > MAX) return { ok: false as const, message: 'File must be ≤ 2MB' }
    return { ok: true as const }
  },

  async upload(userId: string, file: File): Promise<string> {
    const v = avatarStorage.validate(file)
    if (!v.ok) throw Errors.conflict(v.message)
    const supabase = await createClient()
    const ext = file.type === 'image/png' ? 'png' : 'jpg'
    const path = `${userId}/avatar-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type })
    if (error) throw Errors.internal()
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  },
}
