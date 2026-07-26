'use client'
import { useTransition } from 'react'
import { formatAmount } from '@/lib/money'
import { updatePaymentAction, voidPaymentAction } from '@/features/finance/actions/payments'
import type { TournamentPayment } from '@prisma/client'

const PHASE_LABEL: Record<string, string> = {
  INSTITUTIONS: 'Institutions',
  TEAMS: 'Teams',
  ADJUDICATORS: 'Adjudicators',
}

const SOURCE_LABEL: Record<string, string> = {
  GOOGLE_FORM: 'Google Form',
  MANUAL: 'Manual',
}

export function PaymentHistory({ payments }: { payments: TournamentPayment[] }) {
  if (payments.length === 0) {
    return <p className="text-sm text-muted-foreground">No payment records yet.</p>
  }

  return (
    <div className="overflow-hidden rounded-lg border divide-y">
      {payments.map((p) => (
        <PaymentRow key={p.id} payment={p} />
      ))}
    </div>
  )
}

function PaymentRow({ payment: p }: { payment: TournamentPayment }) {
  const [pending, startTransition] = useTransition()

  function handleConfirm(fd: FormData) {
    startTransition(async () => { await updatePaymentAction(fd) })
  }

  function handleVoid(fd: FormData) {
    startTransition(async () => { await voidPaymentAction(fd) })
  }

  function handleSaveNote(fd: FormData) {
    startTransition(async () => { await updatePaymentAction(fd) })
  }

  return (
    <div className={`p-4 text-sm ${p.status === 'VOIDED' ? 'bg-muted/30' : ''} ${pending ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-base ${p.status === 'VOIDED' ? 'line-through text-muted-foreground' : ''}`}>
              {formatAmount(p.amountMinor, p.currency)}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              p.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' :
              p.status === 'VOIDED' ? 'bg-muted text-muted-foreground' :
              'bg-amber-50 text-amber-700'
            }`}>
              {p.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {p.phase ? (PHASE_LABEL[p.phase] ?? p.phase) : '—'} ·{' '}
            {SOURCE_LABEL[p.paymentSource] ?? p.paymentSource} ·{' '}
            {new Date(p.createdAt).toLocaleDateString()}
          </p>
        </div>

        {p.status !== 'VOIDED' && (
          <div className="flex shrink-0 items-center gap-2">
            {p.status === 'PENDING' && (
              <form action={handleConfirm}>
                <input type="hidden" name="paymentId" value={p.id} />
                <input type="hidden" name="status" value="CONFIRMED" />
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                >
                  Confirm
                </button>
              </form>
            )}
            <form action={handleVoid}>
              <input type="hidden" name="paymentId" value={p.id} />
              <button
                type="submit"
                disabled={pending}
                className="rounded border border-destructive/30 px-2 py-1 text-xs text-destructive hover:bg-destructive/5 disabled:opacity-50"
              >
                Void
              </button>
            </form>
          </div>
        )}
      </div>

      <form action={handleSaveNote} className="mt-2 flex items-center gap-2">
        <input type="hidden" name="paymentId" value={p.id} />
        <input
          type="text"
          name="notes"
          defaultValue={p.notes ?? ''}
          placeholder="Add notes…"
          className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded border px-2 py-1 text-xs text-muted-foreground hover:bg-surface disabled:opacity-50"
        >
          Save note
        </button>
      </form>
    </div>
  )
}
