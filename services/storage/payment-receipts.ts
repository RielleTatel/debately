import { createClient } from '@/lib/supabase/server'
import { AppError } from '@/lib/errors'

const BUCKET = 'payment-receipts'
const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED = new Set(['application/pdf', 'image/jpeg', 'image/png'])

export const paymentReceiptsStorage = {
  validate(file: File): void {
    if (!ALLOWED.has(file.type)) throw new AppError('VALIDATION_ERROR', 'Unsupported file type. PDF, JPG, or PNG only.')
    if (file.size > MAX_BYTES) throw new AppError('VALIDATION_ERROR', 'Receipt must be 10MB or smaller.')
  },
  async upload(invoiceId: string, file: File): Promise<string> {
    this.validate(file)
    const supabase = await createClient()
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
    const path = `${invoiceId}/${Date.now()}-${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false })
    if (error) throw new AppError('INTERNAL_ERROR', `Upload failed: ${error.message}`)
    return path
  },
  async getSignedUrl(path: string, ttlSeconds = 600): Promise<string> {
    const supabase = await createClient()
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, ttlSeconds)
    if (error || !data) throw new AppError('INTERNAL_ERROR', `Signed URL failed: ${error?.message ?? 'unknown'}`)
    return data.signedUrl
  },
}
