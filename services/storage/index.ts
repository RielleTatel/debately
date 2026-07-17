import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'debately-uploads'

export const storageService = {
  async upload(path: string, file: File): Promise<string> {
    const supabase = createAdminClient()
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  },

  async remove(path: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) throw error
  },

  getPublicUrl(path: string): string {
    const supabase = createAdminClient()
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  },
}
