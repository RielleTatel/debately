import { createClient } from '@/lib/supabase/server'
import { AppError } from '@/lib/errors'

const BUCKET = 'request-attachments'
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = new Set(['application/pdf', 'image/jpeg', 'image/png'])

export const requestAttachmentsStorage = {
  validate(file: File): void {
    if (!ALLOWED.has(file.type)) throw new AppError('VALIDATION_ERROR', 'Unsupported file type. PDF, JPG, or PNG only.')
    if (file.size > MAX_BYTES) throw new AppError('VALIDATION_ERROR', 'Attachment must be 5MB or smaller.')
  },
  async upload(requestId: string, file: File): Promise<string> {
    this.validate(file)
    const supabase = await createClient()
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
    const path = `${requestId}/${Date.now()}-${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type })
    if (error) throw new AppError('INTERNAL_ERROR', `Upload failed: ${error.message}`)
    return path
  },
}
