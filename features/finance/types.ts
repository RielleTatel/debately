import type { Invoice, InvoiceLineItem, PaymentReceipt, PaymentMethod, ReceiptStatus, InvoiceLineKind, TournamentInstitution } from '@prisma/client'
export type { Invoice, InvoiceLineItem, PaymentReceipt, PaymentMethod, ReceiptStatus, InvoiceLineKind }
export type InvoiceWithLineItems = Invoice & { lineItems: InvoiceLineItem[] }
export type InvoiceWithInstitution = Invoice & { institution: Pick<TournamentInstitution, 'id' | 'name'> }
export type ReceiptWithUploader = PaymentReceipt & { uploader: { displayName: string; avatarUrl: string | null } }
