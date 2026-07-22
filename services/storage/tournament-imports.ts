import { createAdminClient } from '@/lib/supabase/admin'
import { Errors } from '@/lib/errors'

const BUCKET = 'tournament-imports'
const MAX = 10 * 1024 * 1024
const ALLOWED = new Set(['text/csv', 'application/vnd.ms-excel'])

export const tournamentImportsStorage = {
  validate(file: File) {
    if (!ALLOWED.has(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
      return { ok: false as const, message: 'Only .csv files are accepted' }
    }
    if (file.size > MAX) return { ok: false as const, message: 'File must be ≤ 10MB' }
    return { ok: true as const }
  },
  async upload(tournamentId: string, importId: string, file: File): Promise<string> {
    const v = tournamentImportsStorage.validate(file)
    if (!v.ok) throw Errors.conflict(v.message)
    const supabase = createAdminClient()
    const path = `${tournamentId}/${importId}.csv`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: 'text/csv',
    })
    if (error) throw Errors.conflict(`Upload failed: ${error.message}`)
    return path
  },
  async signedUrl(path: string, expiresIn = 60): Promise<string> {
    const supabase = createAdminClient()
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn)
    if (error || !data) throw Errors.conflict('Failed to create signed URL')
    return data.signedUrl
  },
  async readText(path: string): Promise<string> {
    const supabase = createAdminClient()
    const { data, error } = await supabase.storage.from(BUCKET).download(path)
    if (error || !data) throw Errors.conflict('Failed to download CSV')
    return await data.text()
  },
}
