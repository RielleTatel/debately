export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMITED'
  | 'EMAIL_NOT_VERIFIED'
  | 'INVALID_CREDENTIALS'

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 400,
    public readonly meta?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function isAppError(e: unknown): e is AppError { return e instanceof AppError }

import { ZodError } from 'zod'
import type { ApiResponse } from '@/types/api'

export function toApi(e: unknown): ApiResponse<never> {
  if (e instanceof AppError) {
    return { ok: false, error: e.message, code: e.code }
  }
  if (e instanceof ZodError) {
    const msg = e.issues.map((i) => i.message).join('; ')
    return { ok: false, error: msg, code: 'VALIDATION_ERROR' }
  }
  if (e instanceof Error) {
    return { ok: false, error: e.message, code: 'INTERNAL_ERROR' }
  }
  return { ok: false, error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' }
}

export const Errors = {
  unauthorized: () => new AppError('UNAUTHORIZED', 'Not authenticated', 401),
  forbidden: () => new AppError('FORBIDDEN', 'Access denied', 403),
  notFound: (r: string) => new AppError('NOT_FOUND', `${r} not found`, 404),
  conflict: (m: string) => new AppError('CONFLICT', m, 409),
  internal: () => new AppError('INTERNAL_ERROR', 'Internal server error', 500),
  rateLimited: (retryAfterMs: number) =>
    new AppError('RATE_LIMITED', 'Too many attempts. Please try again shortly.', 429, { retryAfterMs }),
  emailNotVerified: () =>
    new AppError('EMAIL_NOT_VERIFIED', 'Please verify your email first.', 403),
  invalidCredentials: () =>
    new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401),
} as const
