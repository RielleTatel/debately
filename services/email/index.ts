import { logger } from '@/services/logger'

type EmailPayload = {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export const emailService = {
  async send(payload: EmailPayload): Promise<void> {
    // TODO: integrate with email provider (Resend, SendGrid, etc.)
    logger.info('Email queued', { to: payload.to, subject: payload.subject })
  },

  async sendWelcome(to: string, name: string): Promise<void> {
    await emailService.send({
      to,
      subject: 'Welcome to Debately',
      html: `<p>Hi ${name}, welcome!</p>`,
      text: `Hi ${name}, welcome!`,
    })
  },

  async sendInvitation(to: string, tournamentName: string, inviteUrl: string): Promise<void> {
    await emailService.send({
      to,
      subject: `You're invited to ${tournamentName}`,
      html: `<p>You have been invited. <a href="${inviteUrl}">Accept invitation</a></p>`,
    })
  },
}
