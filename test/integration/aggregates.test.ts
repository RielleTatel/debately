import { beforeAll, expect, it } from 'vitest'
import { seedBrowserDatabase } from '../browser/seed'
import { getRegistrationAnalytics } from '@/features/analytics/services/registration'
import { getFinancialAnalytics } from '@/features/analytics/services/financial'
import { getRequestAnalytics } from '@/features/analytics/services/requests'
import { getInstitutionBalance } from '@/features/finance/queries/balance'
import { getPaymentTotalsForTournament } from '@/features/finance/queries/payments'

beforeAll(seedBrowserDatabase)
it('retains UTC day boundaries and excludes independent adjudicators from registration counts', async () => {
  const data = await getRegistrationAnalytics('fixture-tournament')
  expect(data.counts).toEqual({ institutions: 150, teams: 1000, adjudicators: 120 })
  expect(data.claimBreakdown).toEqual({ claimed: 1, unclaimed: 149 })
  expect(data.series.slice(0, 2)).toEqual([
    { date: '2026-01-01', teamsCumulative: 500, adjudicatorsCumulative: 0 },
    { date: '2026-01-02', teamsCumulative: 1000, adjudicatorsCumulative: 0 },
  ])
})
it('keeps currency totals, approved receipts, and legacy invoice status classifications', async () => {
  const data = await getFinancialAnalytics('fixture-tournament')
  expect(data.byCurrency).toMatchObject([
    {
      currency: 'PHP',
      totalInvoicedMinor: 30000,
      totalPaidMinor: 24600,
      outstandingMinor: 5400,
      statusCount: { UNPAID: 0, PARTIAL: 1, PAID: 1, OVERPAID: 1 },
    },
    { currency: 'USD', totalInvoicedMinor: 5000, totalPaidMinor: 5000, outstandingMinor: 0 },
  ])
  expect(await getInstitutionBalance('institution-0')).toMatchObject({
    invoicedMinor: 10000,
    paidMinor: 2500,
    balanceMinor: 7500,
    status: 'PARTIAL',
  })
  expect(await getInstitutionBalance('institution-2')).toMatchObject({
    invoicedMinor: 0,
    paidMinor: 100,
    status: 'OVERPAID',
  })
})
it('keeps declared payments separate by currency and excludes voided payments', async () => {
  const totals = await getPaymentTotalsForTournament('fixture-tournament', ['institution-0'])
  expect(totals.get('institution-0')).toEqual([
    { currency: 'PHP', totalMinor: 1000 },
    { currency: 'USD', totalMinor: 2000 },
  ])
})
it('handles empty aggregates and computes resolved request averages', async () => {
  expect(await getFinancialAnalytics('fixture-empty')).toMatchObject({
    totalInvoicedMinor: 0,
    totalPaidMinor: 0,
    completionRate: 1,
  })
  expect(await getRegistrationAnalytics('fixture-empty')).toMatchObject({
    series: [],
    counts: { institutions: 1, teams: 0, adjudicators: 0 },
  })
  expect(await getRequestAnalytics('fixture-empty')).toMatchObject({
    avgResolutionMs: 0,
    approvalRate: 0,
  })
  expect(await getRequestAnalytics('fixture-tournament')).toMatchObject({
    avgResolutionMs: 10800000,
    approvalRate: 0.5,
  })
})
