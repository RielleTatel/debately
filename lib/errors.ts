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
