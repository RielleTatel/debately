export type InvoiceId = string

export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue' | 'cancelled'

export type CreateInvoiceInput = {
  tournamentId: string
  recipientEmail: string
  amount: number
  currency?: string
  dueDate?: Date
}
