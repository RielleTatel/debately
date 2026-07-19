export function verificationTemplate(opts: { displayName: string; verifyUrl: string }) {
  const { displayName, verifyUrl } = opts
  return {
    subject: 'Verify your email — Debately',
    html: `<p>Hi ${escapeHtml(displayName)},</p>
<p>Please verify your email by clicking the link below (expires in 24 hours):</p>
<p><a href="${verifyUrl}">${verifyUrl}</a></p>
<p>— Debately</p>`,
    text: `Hi ${displayName},\n\nVerify your email: ${verifyUrl}\n\n— Debately`,
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]!))
}
