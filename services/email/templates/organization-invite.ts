export function organizationInviteTemplate(opts: { inviterName: string; orgName: string; acceptUrl: string }) {
  const { inviterName, orgName, acceptUrl } = opts
  return {
    subject: `${inviterName} invited you to ${orgName} on Debately`,
    html: `<p>${esc(inviterName)} invited you to join <strong>${esc(orgName)}</strong> on Debately.</p>
<p><a href="${acceptUrl}">Accept the invitation</a> (link expires in 7 days).</p>
<p>You must have a verified Debately account to accept.</p>`,
    text: `${inviterName} invited you to ${orgName} on Debately.\n\nAccept: ${acceptUrl}\n\nExpires in 7 days.`,
  }
}
function esc(s: string) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)) }
