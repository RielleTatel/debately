import { AppError } from './errors'

export function subunitFactor(_currency: string): number {
  return 100
}

export function parseAmount(input: string, currency: string): number {
  const cleaned = input.replace(/,/g, '').trim()
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new AppError('VALIDATION_ERROR', 'Amount must be a positive number with up to 2 decimal places.')
  }
  const [wholeStr, decStr = ''] = cleaned.split('.')
  const whole = Number(wholeStr)
  const decPadded = (decStr + '00').slice(0, 2)
  const dec = Number(decPadded)
  const minor = whole * subunitFactor(currency) + dec
  if (!Number.isFinite(minor) || minor < 0) throw new AppError('VALIDATION_ERROR', 'Invalid amount.')
  return minor
}

export function formatAmount(minor: number, currency: string): string {
  const factor = subunitFactor(currency)
  const negative = minor < 0
  const abs = Math.abs(minor)
  const whole = Math.floor(abs / factor)
  const dec = String(abs % factor).padStart(2, '0')
  const wholeFormatted = whole.toLocaleString('en-US')
  return `${negative ? '-' : ''}${currency} ${wholeFormatted}.${dec}`
}
