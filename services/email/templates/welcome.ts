export function welcomeTemplate(opts: { displayName: string }) {
  return {
    subject: 'Welcome to Debately',
    html: `<p>Hi ${escapeHtml(opts.displayName)}, your email is verified. Welcome!</p>`,
    text: `Welcome to Debately, ${opts.displayName}!`,
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]!))
}
