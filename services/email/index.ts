// server-only: do NOT import this file in client components
import { getResend } from './client'
import { env } from '@/lib/env'
import { logger } from '@/services/logger'
import { Errors } from '@/lib/errors'
import { verificationTemplate } from './templates/verification'
import { passwordResetTemplate } from './templates/password-reset'
import { welcomeTemplate } from './templates/welcome'

async function send(to: string, tmpl: { subject: string; html: string; text: string }) {
  const { error } = await getResend().emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: tmpl.subject,
    html: tmpl.html,
    text: tmpl.text,
  })
  if (error) {
    logger.error('email send failed', { to, subject: tmpl.subject, error })
    throw Errors.internal()
  }
}

export const emailService = {
  async sendVerification(opts: { to: string; verifyUrl: string; displayName: string }) {
    await send(opts.to, verificationTemplate(opts))
  },
  async sendPasswordReset(opts: { to: string; resetUrl: string; displayName: string }) {
    await send(opts.to, passwordResetTemplate(opts))
  },
  async sendWelcome(opts: { to: string; displayName: string }) {
    await send(opts.to, welcomeTemplate(opts))
  },
}
