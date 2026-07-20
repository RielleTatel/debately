import { createClient } from '@/lib/supabase/server'
import { Errors } from '@/lib/errors'

const BUCKET = 'org-logos'
const MAX = 2 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png'])

export const orgLogoStorage = {
  validate(file: File) {
    if (!ALLOWED.has(file.type)) return { ok: false as const, message: 'Only JPG or PNG allowed' }
    if (file.size > MAX) return { ok: false as const, message: 'File must be ≤ 2MB' }
    return { ok: true as const }
  },
  async upload(orgId: string, file: File): Promise<string> {
    const v = orgLogoStorage.validate(file); if (!v.ok) throw Errors.conflict(v.message)
    const supabase = await createClient()
    const ext = file.type === 'image/png' ? 'png' : 'jpg'
    const path = `${orgId}/logo-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type })
    if (error) throw Errors.internal()
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  },
}
