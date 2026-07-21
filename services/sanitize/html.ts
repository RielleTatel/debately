import sanitize from 'sanitize-html'
const ALLOWED_TAGS = ['p', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'a', 'br', 'h1', 'h2', 'h3', 'blockquote', 'code']
export function sanitizeAnnouncementHtml(input: string): string {
  return sanitize(input, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: { a: (_tagName, attribs) => ({ tagName: 'a', attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' } }) },
    disallowedTagsMode: 'discard' as any,
  })
}
