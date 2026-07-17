import { z } from 'zod'

export const createInvoiceSchema = z.object({
  tournamentId: z.string().cuid(),
  recipientEmail: z.string().email(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  dueDate: z.coerce.date().optional(),
})
