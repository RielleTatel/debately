import { AppError } from '@/lib/errors'
import { RESERVED_SLUGS } from '@/lib/reserved-slugs'

export { RESERVED_SLUGS }

export function slugify(input: string): string {
  return input.normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 64).replace(/-+$/, '')
}

export function assertSlugAllowed(slug: string): void {
  if (RESERVED_SLUGS.has(slug)) {
    throw new AppError('VALIDATION_ERROR', `"${slug}" is a reserved slug and cannot be used.`, 400)
  }
}
