import { z } from 'zod'
import { parseAmount } from '@/lib/money'

function amountSchema() {
  return z.string().min(1)
}

export const applyDiscountSchema = z.object({
  invoiceId: z.string().min(1),
  amountInput: amountSchema(),
  reason: z.string().min(3).max(1000),
  currency: z.string().length(3).regex(/^[A-Z]{3}$/),
}).transform((v, ctx) => {
  try { return { ...v, amountMinor: parseAmount(v.amountInput, v.currency) } }
  catch (e) { ctx.addIssue({ code: 'custom', message: (e as Error).message, path: ['amountInput'] }); return z.NEVER }
})
export type ApplyDiscountInput = z.infer<typeof applyDiscountSchema>

export const overrideTotalSchema = z.object({
  invoiceId: z.string().min(1),
  amountInput: amountSchema(),
  reason: z.string().min(10).max(1000),
  currency: z.string().length(3).regex(/^[A-Z]{3}$/),
}).transform((v, ctx) => {
  try { return { ...v, amountMinor: parseAmount(v.amountInput, v.currency) } }
  catch (e) { ctx.addIssue({ code: 'custom', message: (e as Error).message, path: ['amountInput'] }); return z.NEVER }
})
export type OverrideTotalInput = z.infer<typeof overrideTotalSchema>

export const PaymentMethodEnum = z.enum(['BANK_TRANSFER', 'GCASH', 'CHECK', 'CASH', 'OTHER'])

export const submitReceiptSchema = z.object({
  invoiceId: z.string().min(1),
  amountInput: amountSchema(),
  currency: z.string().length(3).regex(/^[A-Z]{3}$/),
  paymentDate: z.coerce.date(),
  referenceNumber: z.string().min(1).max(120),
  method: PaymentMethodEnum,
}).transform((v, ctx) => {
  try { return { ...v, amountMinor: parseAmount(v.amountInput, v.currency) } }
  catch (e) { ctx.addIssue({ code: 'custom', message: (e as Error).message, path: ['amountInput'] }); return z.NEVER }
})
export type SubmitReceiptInput = z.infer<typeof submitReceiptSchema>

export const approveReceiptSchema = z.object({ receiptId: z.string().min(1) })
export type ApproveReceiptInput = z.infer<typeof approveReceiptSchema>

export const rejectReceiptSchema = z.object({
  receiptId: z.string().min(1),
  reason: z.string().min(5).max(1000),
})
export type RejectReceiptInput = z.infer<typeof rejectReceiptSchema>

export const sendReminderSchema = z.object({
  tournamentId: z.string().min(1),
  institutionIds: z.array(z.string().min(1)).min(1).max(500),
})
export type SendReminderInput = z.infer<typeof sendReminderSchema>
