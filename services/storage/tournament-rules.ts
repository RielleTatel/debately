import { createClient } from '@/lib/supabase/server'
import { Errors } from '@/lib/errors'

const BUCKET = 'tournament-rules'
const MAX = 5 * 1024 * 1024
const ALLOWED = new Set(['application/pdf'])

export const tournamentRulesStorage = {
  validate(file: File) {
    if (!ALLOWED.has(file.type)) return { ok: false as const, message: 'Only PDF allowed' }
    if (file.size > MAX) return { ok: false as const, message: 'File must be ≤ 5MB' }
    return { ok: true as const }
  },
  async upload(tournamentId: string, file: File): Promise<string> {
    const v = tournamentRulesStorage.validate(file); if (!v.ok) throw Errors.conflict(v.message)
    const supabase = await createClient()
    const path = `${tournamentId}/rules-${Date.now()}.pdf`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: 'application/pdf' })
    if (error) throw Errors.internal()
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  },
}
