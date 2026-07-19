export function passwordResetTemplate(opts: { displayName: string; resetUrl: string }) {
  const { displayName, resetUrl } = opts
  return {
    subject: 'Reset your password — Debately',
    html: `<p>Hi ${escapeHtml(displayName)},</p>
<p>Reset your password using the link below (expires in 1 hour):</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>
<p>If you did not request this, ignore this email.</p>`,
    text: `Reset your password: ${resetUrl}`,
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]!))
}
