import { describe, it, expect } from 'vitest'
import { organizationInviteTemplate } from '@/services/email/templates/organization-invite'
describe('organizationInviteTemplate', () => {
  it('produces subject/html/text', () => {
    const t = organizationInviteTemplate({ inviterName: 'A', orgName: 'O', acceptUrl: 'https://x/y' })
    expect(t.subject).toContain('O'); expect(t.html).toContain('https://x/y'); expect(t.text).toContain('https://x/y')
  })
  it('escapes HTML', () => {
    const t = organizationInviteTemplate({ inviterName: '<b>x</b>', orgName: 'O', acceptUrl: 'x' })
    expect(t.html).not.toContain('<b>x</b>')
  })
})
